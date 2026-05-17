import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type {
  B2BInquiry,
  CustomerEnquiry,
  Order,
  Product,
  SiteContent,
  Subscriber,
  User,
} from "./types";
import { DEFAULT_CONTENT, DEFAULT_PRODUCTS } from "./data";

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
  | "company";

export const LIST_ENTITIES = [
  "products",
  "orders",
  "users",
  "subscribers",
  "customerEnquiries",
  "b2bInquiries",
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

const DEFAULTS: {
  products: Product[];
  orders: Order[];
  users: User[];
  subscribers: Subscriber[];
  customerEnquiries: CustomerEnquiry[];
  b2bInquiries: B2BInquiry[];
  company: SiteContent;
} = {
  products: DEFAULT_PRODUCTS,
  orders: [],
  users: [],
  subscribers: [],
  customerEnquiries: [],
  b2bInquiries: [],
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

export async function read<E extends EntityKey>(
  entity: E,
): Promise<typeof DEFAULTS[E]> {
  const r = redis();
  if (!r) return fileRead(entity);

  const stored = await r.get<typeof DEFAULTS[E]>(key(entity));
  if (stored !== null && stored !== undefined) return stored;

  // Seed with defaults on first read.
  const def = DEFAULTS[entity];
  await r.set(key(entity), def);
  return def;
}

export async function write<E extends EntityKey>(
  entity: E,
  value: typeof DEFAULTS[E],
): Promise<void> {
  const r = redis();
  if (!r) {
    await fileWrite(entity, value);
    return;
  }
  await r.set(key(entity), value);
}
