import { POKEMON_TYPES } from '../types/pokemon';
import type { PokemonSummary, PokemonType } from '../types/pokemon';

// ---------- List view: search + sort ----------

export const SORT_FIELDS = {
  id: { label: 'Dex number', value: (p: PokemonSummary) => p.id },
  name: { label: 'Name', value: (p: PokemonSummary) => p.name },
  total: { label: 'Base stat total', value: (p: PokemonSummary) => p.total },
  baseExperience: { label: 'Base experience', value: (p: PokemonSummary) => p.baseExperience },
  height: { label: 'Height', value: (p: PokemonSummary) => p.height },
  weight: { label: 'Weight', value: (p: PokemonSummary) => p.weight },
} satisfies Record<string, { label: string; value: (p: PokemonSummary) => string | number }>;

export type SortField = keyof typeof SORT_FIELDS;
export type SortOrder = 'asc' | 'desc';

export function orderLabel(field: SortField, order: SortOrder): string {
  if (field === 'name') return order === 'asc' ? 'A → Z' : 'Z → A';
  return order === 'asc' ? 'Low → High' : 'High → Low';
}

export const isSortField = (v: string | null): v is SortField => v !== null && v in SORT_FIELDS;
export const isSortOrder = (v: string | null): v is SortOrder => v === 'asc' || v === 'desc';

export function matchesQuery(p: PokemonSummary, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  // Allow searching by dex number: "25", "#025".
  const asNumber = query.replace(/^#/, '');
  if (/^\d+$/.test(asNumber)) return String(p.id).includes(String(Number(asNumber)));
  return p.name.replace(/-/g, ' ').includes(query.replace(/-/g, ' '));
}

export function searchAndSort(
  list: PokemonSummary[],
  query: string,
  field: SortField,
  order: SortOrder,
): PokemonSummary[] {
  const getValue = SORT_FIELDS[field].value;
  const direction = order === 'asc' ? 1 : -1;
  return list
    .filter((p) => matchesQuery(p, query))
    .sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      const cmp = typeof av === 'string' && typeof bv === 'string' ? av.localeCompare(bv) : Number(av) - Number(bv);
      // Tie-break by dex number so the order is stable and predictable.
      return cmp !== 0 ? cmp * direction : a.id - b.id;
    });
}

// ---------- Gallery view: type filters ----------

export type MatchMode = 'any' | 'all';

export const isMatchMode = (v: string | null): v is MatchMode => v === 'any' || v === 'all';

export function parseTypes(raw: string | null): PokemonType[] {
  if (!raw) return [];
  const wanted = new Set(raw.split(','));
  return POKEMON_TYPES.filter((t) => wanted.has(t));
}

export function filterByTypes(list: PokemonSummary[], types: PokemonType[], mode: MatchMode): PokemonSummary[] {
  if (types.length === 0) return list;
  return list.filter((p) =>
    mode === 'any' ? types.some((t) => p.types.includes(t)) : types.every((t) => p.types.includes(t)),
  );
}

/** Counts how many Pokémon have each type, in canonical type order, omitting unused types. */
export function typeCounts(list: PokemonSummary[]): { type: PokemonType; count: number }[] {
  return POKEMON_TYPES.map((type) => ({ type, count: list.filter((p) => p.types.includes(type)).length })).filter(
    (c) => c.count > 0,
  );
}
