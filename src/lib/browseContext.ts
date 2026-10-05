/**
 * The "browse context" is the ordered result set the user was looking at when they
 * opened a detail page. It travels in router location state (so Back/Forward keep it)
 * and is mirrored to sessionStorage (so a page refresh on /details/:id keeps it too).
 */
export interface BrowseContext {
  /** Ordered ids of the filtered/sorted result set. */
  ids: number[];
  /** Human description, e.g. "List · “char” · Name A→Z". */
  label: string;
  /** Path + query string to return to, e.g. "/list?q=char&sort=name". */
  returnTo: string;
  /** Which view produced it. */
  origin: 'list' | 'gallery' | 'all';
}

export interface DetailLocationState {
  browse: BrowseContext;
}

const STORAGE_KEY = 'dexplorer:browse';
const LAST_VIEWED_KEY = 'dexplorer:last-viewed';

function isBrowseContext(value: unknown): value is BrowseContext {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.ids) &&
    v.ids.every((n) => typeof n === 'number') &&
    typeof v.label === 'string' &&
    typeof v.returnTo === 'string' &&
    (v.origin === 'list' || v.origin === 'gallery' || v.origin === 'all')
  );
}

/** Extracts a browse context from router location state, if present and valid. */
export function browseFromState(state: unknown): BrowseContext | null {
  if (typeof state !== 'object' || state === null) return null;
  const browse = (state as Record<string, unknown>).browse;
  return isBrowseContext(browse) ? browse : null;
}

export function saveBrowse(ctx: BrowseContext): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    /* best effort */
  }
}

export function loadBrowse(): BrowseContext | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isBrowseContext(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLastViewed(id: number): void {
  try {
    sessionStorage.setItem(LAST_VIEWED_KEY, String(id));
  } catch {
    /* best effort */
  }
}

export function loadLastViewed(): number | null {
  try {
    const n = Number(sessionStorage.getItem(LAST_VIEWED_KEY));
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}
