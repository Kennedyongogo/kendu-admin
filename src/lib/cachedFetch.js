const cache = new Map();
const inflight = new Map();

const DEFAULT_TTL_MS = 45_000;

function cacheKey(url, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const headers = options.headers || {};
  const auth =
    headers.Authorization ||
    headers.authorization ||
    (typeof headers.get === "function" ? headers.get("Authorization") || headers.get("authorization") : "") ||
    "";
  return `${method}\n${url}\n${auth}`;
}

/** Drop cached GETs. Pass a URL substring to clear a subset. */
export function invalidateApiCache(match) {
  if (!match) {
    cache.clear();
    return;
  }
  const needle = String(match);
  for (const key of [...cache.keys()]) {
    if (key.includes(needle)) cache.delete(key);
  }
}

/**
 * GET JSON with short TTL + in-flight dedupe. Non-GET always hits the network.
 * Returns { ok, status, data, fromCache }.
 */
export async function cachedFetchJson(url, options = {}, { ttlMs = DEFAULT_TTL_MS } = {}) {
  const method = String(options.method || "GET").toUpperCase();
  if (method !== "GET") {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data, fromCache: false };
  }

  const key = cacheKey(url, options);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) {
    return { ok: hit.ok, status: hit.status, data: hit.data, fromCache: true };
  }

  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const pending = (async () => {
    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));
      const payload = { ok: res.ok, status: res.status, data, fromCache: false };
      cache.set(key, { at: Date.now(), ok: res.ok, status: res.status, data });
      return payload;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, pending);
  return pending;
}
