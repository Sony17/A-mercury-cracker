"use client";

import {
  DEFAULT_POLICIES,
  POLICIES_STORAGE_KEY,
  type Policy,
  type PolicyKey,
} from "@/lib/policies";

export type PolicyMap = Record<PolicyKey, Policy>;

const ENDPOINT = "/api/db/policies";
const LEGACY_LS_KEY = "mc_" + POLICIES_STORAGE_KEY;
const MIGRATED_FLAG = "mc_policies_migrated_v1";

// Module-level cache so the footer dialog and the admin editor share one fetch,
// and a re-opened dialog paints the saved text immediately instead of flashing
// the defaults.
let cache: PolicyMap | null = null;
let inflight: Promise<PolicyMap> | null = null;

/** Merge over the defaults so a policy added in code later is never missing. */
function merge(saved: Partial<PolicyMap> | null | undefined): PolicyMap {
  return { ...DEFAULT_POLICIES, ...(saved ?? {}) };
}

/** Whatever we already have — defaults until the first fetch resolves. */
export function cachedPolicies(): PolicyMap {
  return cache ?? DEFAULT_POLICIES;
}

/**
 * Policies used to live in this browser's localStorage only, so edits never
 * reached the server or any other device. If this browser still holds such a
 * copy and nothing has been saved to the server yet, push it up once — then
 * drop the local key for good. Guarded on the server copy still being the
 * untouched defaults so a stale local copy can never clobber a real save.
 */
async function migrateLegacyLocal(server: PolicyMap): Promise<PolicyMap> {
  if (localStorage.getItem(MIGRATED_FLAG) === "1") return server;

  const raw = localStorage.getItem(LEGACY_LS_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return server;
  }

  // Someone has already saved through the new server-backed path — the local
  // copy is the stale one. Discard it rather than overwrite them.
  if (JSON.stringify(server) !== JSON.stringify(DEFAULT_POLICIES)) {
    localStorage.removeItem(LEGACY_LS_KEY);
    localStorage.setItem(MIGRATED_FLAG, "1");
    return server;
  }

  try {
    const local = merge(JSON.parse(raw) as Partial<PolicyMap>);
    const res = await fetch(ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(local),
    });
    if (!res.ok) return server; // Not an admin (or offline) — retry next load.
    localStorage.removeItem(LEGACY_LS_KEY);
    localStorage.setItem(MIGRATED_FLAG, "1");
    return local;
  } catch {
    return server; // Leave the legacy key in place so it can be retried.
  }
}

/** Fetch the saved policies. Pass `force` to bypass the module cache. */
export async function loadPolicies(force = false): Promise<PolicyMap> {
  if (typeof window === "undefined") return DEFAULT_POLICIES;
  if (!force && cache) return cache;
  if (!force && inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(ENDPOINT, { cache: "no-store" });
      const server = merge(res.ok ? ((await res.json()) as Partial<PolicyMap>) : null);
      return await migrateLegacyLocal(server);
    } catch {
      return merge(null);
    } finally {
      inflight = null;
    }
  })();

  cache = await inflight;
  return cache;
}

/** Persist to the server (admin only). Returns false if the write was rejected. */
export async function savePolicies(p: PolicyMap): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    if (!res.ok) return false;
    cache = p;
    window.dispatchEvent(new CustomEvent("mc:policies-updated"));
    return true;
  } catch {
    return false;
  }
}
