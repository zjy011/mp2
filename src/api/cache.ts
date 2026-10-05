interface CacheEnvelope<T> {
  savedAt: number;
  value: T;
}

/** Reads a JSON value from localStorage, ignoring it once it is older than maxAgeMs. */
export function readCache<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CacheEnvelope<T>;
    if (Date.now() - envelope.savedAt > maxAgeMs) return null;
    return envelope.value;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  try {
    const envelope: CacheEnvelope<T> = { savedAt: Date.now(), value };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Storage full or blocked (private mode): caching is best-effort only.
  }
}

/**
 * In-memory memoisation for per-item requests (species, evolution chains).
 * Stores the promise so concurrent callers share one request; failures are evicted.
 */
export function memoizeAsync<K, V>(fn: (key: K) => Promise<V>): (key: K) => Promise<V> {
  const cache = new Map<K, Promise<V>>();
  return (key: K) => {
    const hit = cache.get(key);
    if (hit) return hit;
    const pending = fn(key).catch((err: unknown) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, pending);
    return pending;
  };
}
