import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type {
  AbandonedCart,
  B2BInquiry,
  CustomerEnquiry,
  Order,
  Product,
  ResetRequest,
  SiteContent,
  Subscriber,
  User,
} from "./types";
import { DEFAULT_CONTENT, DEFAULT_PRODUCTS } from "./data";
import { hashPassword } from "./passwords";

// Storage strategy:
// - In production / on Vercel: Upstash Redis (set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
// - In local dev with no Upstash envs: fall back to JSON files under ./data, so the app runs without setup.

const DATA_DIR = path.join(process.cwd(), "data");
const KEY_PREFIX = "mc:";

export type EntityKey =
  | "products"
  | "orders"
  | "users"
  | "subscribers"
  | "customerEnquiries"
  | "b2bInquiries"
  | "abandonedCarts"
  | "resetRequests"
  | "company";

export const LIST_ENTITIES = [
  "products",
  "orders",
  "users",
  "subscribers",
  "customerEnquiries",
  "b2bInquiries",
  "abandonedCarts",
  "resetRequests",
] as const;

export const SINGLE_ENTITIES = ["company"] as const;

export type ListEntity = (typeof LIST_ENTITIES)[number];
export type SingleEntity = (typeof SINGLE_ENTITIES)[number];

export function isEntity(name: string): name is EntityKey {
  return (
    (LIST_ENTITIES as readonly string[]).includes(name) ||
    (SINGLE_ENTITIES as readonly string[]).includes(name)
  );
}

export function isListEntity(name: string): name is ListEntity {
  return (LIST_ENTITIES as readonly string[]).includes(name);
}

// Entities stored as a Redis Hash (one field per record) so creates/updates/
// deletes are atomic and can't clobber each other under concurrency. `products`
// stays a JSON blob (admin-only, manually ordered); `company` is a singleton.
export const ATOMIZED_ENTITIES = [
  "orders",
  "users",
  "subscribers",
  "customerEnquiries",
  "b2bInquiries",
  "abandonedCarts",
  "resetRequests",
] as const;

export type AtomizedEntity = (typeof ATOMIZED_ENTITIES)[number];

export function isAtomized(name: string): name is AtomizedEntity {
  return (ATOMIZED_ENTITIES as readonly string[]).includes(name);
}

const DEFAULTS: {
  products: Product[];
  orders: Order[];
  users: User[];
  subscribers: Subscriber[];
  customerEnquiries: CustomerEnquiry[];
  b2bInquiries: B2BInquiry[];
  abandonedCarts: AbandonedCart[];
  resetRequests: ResetRequest[];
  company: SiteContent;
} = {
  products: DEFAULT_PRODUCTS,
  orders: [],
  users: [],
  subscribers: [],
  customerEnquiries: [],
  b2bInquiries: [],
  abandonedCarts: [],
  resetRequests: [],
  company: DEFAULT_CONTENT,
};

// Upstash client is created lazily so missing envs don't crash module load.
let _redis: Redis | null = null;
function redis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    // In serverless (Vercel) the file fallback can't work: /var/task is read-only,
    // and even /tmp does not persist across invocations. Fail loudly instead of
    // pretending to save data that will vanish.
    if (process.env.VERCEL) {
      throw new Error(
        "Missing UPSTASH_REDIS_REST_URL/TOKEN (or KV_REST_API_URL/TOKEN) on Vercel. " +
          "Configure the Upstash Redis / Vercel KV integration for the Production environment.",
      );
    }
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

function key(entity: EntityKey): string {
  return `${KEY_PREFIX}${entity}`;
}

function fileFor(entity: EntityKey): string {
  return path.join(DATA_DIR, `${entity}.json`);
}

async function fileRead<E extends EntityKey>(entity: E): Promise<typeof DEFAULTS[E]> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(fileFor(entity), "utf8");
    return JSON.parse(raw) as typeof DEFAULTS[E];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      const def = DEFAULTS[entity];
      await fileWrite(entity, def);
      return def;
    }
    throw err;
  }
}

async function fileWrite<E extends EntityKey>(
  entity: E,
  value: typeof DEFAULTS[E],
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const fp = fileFor(entity);
  const tmp = `${fp}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, fp);
}

// --- Atomic per-record storage (Redis Hash) for high-concurrency entities ---

// Serialize file read-modify-write sequences per entity so concurrent requests
// in the dev (no-Redis) fallback can't interleave and lose records. Production
// uses Redis HSET/HDEL, which are atomic and don't need this.
const _fileLocks = new Map<EntityKey, Promise<unknown>>();
function withFileLock<T>(entity: EntityKey, fn: () => Promise<T>): Promise<T> {
  const prev = _fileLocks.get(entity) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  _fileLocks.set(
    entity,
    next.then(
      () => undefined,
      () => undefined,
    ),
  );
  return next;
}

type Elem<E extends AtomizedEntity> = (typeof DEFAULTS)[E] extends (infer U)[]
  ? U
  : never;

const SORT_FIELD: Record<AtomizedEntity, "createdAt" | "requestedAt"> = {
  orders: "createdAt",
  users: "createdAt",
  subscribers: "createdAt",
  customerEnquiries: "createdAt",
  b2bInquiries: "createdAt",
  abandonedCarts: "createdAt",
  resetRequests: "requestedAt",
};

// Newest-first, matching the old prepend (`[record, ...list]`) ordering.
function sortList<T>(entity: AtomizedEntity, arr: T[]): T[] {
  const f = SORT_FIELD[entity];
  return arr.slice().sort((a, b) => {
    const av = Number((a as Record<string, unknown>)[f] ?? 0);
    const bv = Number((b as Record<string, unknown>)[f] ?? 0);
    return bv - av;
  });
}

// Hash field that uniquely identifies a record: email for users, id otherwise.
function fieldOf(entity: AtomizedEntity, record: unknown): string {
  const r = (record ?? {}) as Record<string, unknown>;
  if (entity === "users") return String(r.email ?? "").toLowerCase();
  return String(r.id ?? "");
}

function hkey(entity: AtomizedEntity): string {
  return `${KEY_PREFIX}h:${entity}`;
}

// One-time migration from the legacy whole-array JSON key (`mc:<entity>`) into
// the per-record hash (`mc:h:<entity>`). Guarded by a marker key + in-process
// cache so it costs at most one extra GET per instance per entity.
const _migrated = new Set<AtomizedEntity>();
async function migrateIfNeeded(r: Redis, entity: AtomizedEntity): Promise<void> {
  if (_migrated.has(entity)) return;
  const marker = `${KEY_PREFIX}migrated:${entity}`;
  if (await r.get(marker)) {
    _migrated.add(entity);
    return;
  }
  const legacy = await r.get<unknown[]>(key(entity));
  if (Array.isArray(legacy) && legacy.length) {
    const obj: Record<string, unknown> = {};
    for (const rec of legacy) {
      if (rec == null) continue;
      const f = fieldOf(entity, rec);
      if (f) obj[f] = rec;
    }
    if (Object.keys(obj).length) await r.hset(hkey(entity), obj);
  }
  await r.del(key(entity));
  await r.set(marker, 1);
  _migrated.add(entity);
}

export async function readList<E extends AtomizedEntity>(
  entity: E,
): Promise<typeof DEFAULTS[E]> {
  const r = redis();
  if (!r) {
    const arr = (await fileRead(entity)) as unknown[];
    return sortList(entity, arr.filter((x) => x != null)) as typeof DEFAULTS[E];
  }
  await migrateIfNeeded(r, entity);
  const map = await r.hgetall<Record<string, unknown>>(hkey(entity));
  const arr = map ? Object.values(map).filter((x) => x != null) : [];
  return sortList(entity, arr) as typeof DEFAULTS[E];
}

// Atomic create-or-update of a single record. No read-modify-write, so
// concurrent writers can't lose each other's records.
export async function upsertItem<E extends AtomizedEntity>(
  entity: E,
  record: Elem<E>,
): Promise<void> {
  const field = fieldOf(entity, record);
  if (!field) throw new Error(`upsertItem(${entity}): record is missing its key`);
  const r = redis();
  if (!r) {
    await withFileLock(entity, async () => {
      const arr = (await fileRead(entity)) as unknown[];
      const idx = arr.findIndex((x) => fieldOf(entity, x) === field);
      if (idx >= 0) arr[idx] = record;
      else arr.unshift(record);
      await fileWrite(entity, arr as typeof DEFAULTS[E]);
    });
    return;
  }
  await migrateIfNeeded(r, entity);
  await r.hset(hkey(entity), { [field]: record });
}

// Atomic removal of a single record by id (email for users).
export async function removeItem<E extends AtomizedEntity>(
  entity: E,
  id: string,
): Promise<void> {
  const field = entity === "users" ? id.toLowerCase() : id;
  const r = redis();
  if (!r) {
    await withFileLock(entity, async () => {
      const arr = (await fileRead(entity)) as unknown[];
      const next = arr.filter((x) => fieldOf(entity, x) !== field);
      await fileWrite(entity, next as typeof DEFAULTS[E]);
    });
    return;
  }
  await migrateIfNeeded(r, entity);
  await r.hdel(hkey(entity), field);
}

export async function read<E extends EntityKey>(
  entity: E,
): Promise<typeof DEFAULTS[E]> {
  if (isAtomized(entity)) {
    const list = await readList(entity);
    return (
      entity === "users" ? await ensureAdmin(list as User[]) : list
    ) as typeof DEFAULTS[E];
  }

  // products / company: a single JSON blob (low concurrency, order-sensitive).
  const r = redis();
  if (!r) return fileRead(entity);

  const stored = await r.get<typeof DEFAULTS[E]>(key(entity));
  if (stored !== null && stored !== undefined) return stored;

  // Seed with defaults on first read.
  const def = DEFAULTS[entity];
  await r.set(key(entity), def);
  return def;
}

function fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Guarantee an admin account exists, sourced from env so credentials are never
// committed or shown to the client. Persisted (with a scrypt hash) on first run.
//
// Two env-driven behaviors:
//  - ADMIN_PASSWORD seeds the admin on first run (admin absent) with
//    mustChangePassword, so the bootstrap password is single-use: the client is
//    forced to pick their own on first login and the dev never learns it.
//  - ADMIN_PASSWORD_RESET is a developer recovery hatch for when the client
//    forgets: setting it (to a value the admin hasn't been reset to yet)
//    overwrites the admin password and re-arms the forced change. A stored
//    fingerprint makes this idempotent — the value can stay in env across
//    restarts without re-clobbering the client's chosen password.
let _adminEnsured = false;
async function ensureAdmin(users: User[]): Promise<User[]> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const pass = process.env.ADMIN_PASSWORD;
  if (!email || !pass) {
    if (!_adminEnsured) {
      console.warn(
        "[db] ADMIN_EMAIL/ADMIN_PASSWORD not set — no admin account will be seeded.",
      );
      _adminEnsured = true;
    }
    return users;
  }

  const idx = users.findIndex(
    (u) => u.email.toLowerCase() === email && u.role === "admin",
  );

  // Admin absent → seed it (bootstrap password, single-use).
  if (idx < 0) {
    const admin: User = {
      name: "Admin",
      email,
      role: "admin",
      passwordHash: await hashPassword(pass),
      mustChangePassword: true,
      createdAt: Date.now(),
    };
    await upsertItem("users", admin);
    return [admin, ...users.filter((u) => u.email.toLowerCase() !== email)];
  }

  // Admin present → apply a developer force-reset only when ADMIN_PASSWORD_RESET
  // is set to a value we haven't already applied (fingerprint differs).
  const resetPass = process.env.ADMIN_PASSWORD_RESET;
  if (resetPass) {
    const fp = fingerprint(resetPass);
    if (users[idx].resetFingerprint !== fp) {
      const updated: User = {
        ...users[idx],
        passwordHash: await hashPassword(resetPass),
        mustChangePassword: true,
        resetFingerprint: fp,
      };
      delete updated.password;
      await upsertItem("users", updated);
      const next = [...users];
      next[idx] = updated;
      return next;
    }
  }

  return users;
}

// Whole-collection write. Kept for products/company (JSON blob) and for
// low-concurrency bulk operations (admin import, legacy migration). For
// atomized entities it replaces the whole hash — NOT concurrency-safe, so
// high-traffic create/update/delete paths must use upsertItem/removeItem.
export async function write<E extends EntityKey>(
  entity: E,
  value: typeof DEFAULTS[E],
): Promise<void> {
  const r = redis();
  if (!r) {
    await fileWrite(entity, value);
    return;
  }
  if (isAtomized(entity)) {
    await migrateIfNeeded(r, entity);
    const obj: Record<string, unknown> = {};
    for (const rec of value as unknown[]) {
      if (rec == null) continue;
      const f = fieldOf(entity, rec);
      if (f) obj[f] = rec;
    }
    const hk = hkey(entity);
    await r.del(hk);
    if (Object.keys(obj).length) await r.hset(hk, obj);
    return;
  }
  await r.set(key(entity), value);
}
