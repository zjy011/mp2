import { pokeApi } from './client';
import { memoizeAsync, readCache, writeCache } from './cache';
import { POKEMON_TYPES } from '../types/pokemon';
import type {
  ApiChainLink,
  ApiEvolutionChain,
  ApiEvolutionDetail,
  ApiPokemon,
  ApiSpecies,
  EvolutionNode,
  PokemonSummary,
  PokemonType,
  SpeciesInfo,
  StatBlock,
} from '../types/pokemon';

/** The app browses the original 151 (Kanto) Pokémon. */
export const DEX_SIZE = 151;

const CACHE_KEY = 'dexplorer:v1:kanto';
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // one week
const BATCH_SIZE = 30;

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export const artworkUrl = (id: number) => `${SPRITE_BASE}/other/official-artwork/${id}.png`;
export const spriteUrl = (id: number) => `${SPRITE_BASE}/${id}.png`;

// ---------- Mappers: raw API -> domain ----------

const STAT_KEYS: Record<string, keyof StatBlock> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
};

function isPokemonType(name: string): name is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(name);
}

export function toSummary(raw: ApiPokemon): PokemonSummary {
  const stats: StatBlock = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  for (const s of raw.stats) {
    const key = STAT_KEYS[s.stat.name];
    if (key) stats[key] = s.base_stat;
  }
  const total = Object.values(stats).reduce((sum, n) => sum + n, 0);

  return {
    id: raw.id,
    name: raw.name,
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name)
      .filter(isPokemonType),
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience ?? 0,
    stats,
    total,
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    artwork: raw.sprites.other?.['official-artwork']?.front_default ?? artworkUrl(raw.id),
    sprite: raw.sprites.front_default ?? spriteUrl(raw.id),
  };
}

const cleanText = (text: string) =>
  text
    .replace(/[\f\n\r­]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function toSpeciesInfo(raw: ApiSpecies): SpeciesInfo {
  const englishFlavor = raw.flavor_text_entries.filter((f) => f.language.name === 'en');
  const englishGenus = raw.genera.find((g) => g.language.name === 'en');
  return {
    genus: englishGenus?.genus ?? 'Pokémon',
    // The most recent English entry tends to be the cleanest text.
    flavorText: cleanText(englishFlavor.at(-1)?.flavor_text ?? 'No Pokédex entry available.'),
    color: raw.color.name,
    habitat: raw.habitat?.name ?? null,
    generation: raw.generation.name,
    growthRate: raw.growth_rate.name,
    eggGroups: raw.egg_groups.map((g) => g.name),
    captureRate: raw.capture_rate,
    baseHappiness: raw.base_happiness,
    genderRate: raw.gender_rate,
    isLegendary: raw.is_legendary,
    isMythical: raw.is_mythical,
    evolutionChainUrl: raw.evolution_chain?.url ?? null,
  };
}

const idFromUrl = (url: string) => Number(url.match(/\/(\d+)\/?$/)?.[1] ?? 0);
const pretty = (slug: string) => slug.replace(/-/g, ' ');

function describeEvolution(detail: ApiEvolutionDetail | undefined): string | null {
  if (!detail) return null;
  const trigger = detail.trigger.name;
  if (trigger === 'level-up') {
    if (detail.min_level) return `Level ${detail.min_level}`;
    if (detail.min_happiness) return 'High friendship';
    if (detail.time_of_day) return `Level up (${detail.time_of_day})`;
    return 'Level up';
  }
  if (trigger === 'use-item' && detail.item) return `Use ${pretty(detail.item.name)}`;
  if (trigger === 'trade') return detail.held_item ? `Trade holding ${pretty(detail.held_item.name)}` : 'Trade';
  return pretty(trigger);
}

function flattenChain(link: ApiChainLink, depth = 0, out: EvolutionNode[] = []): EvolutionNode[] {
  out.push({
    id: idFromUrl(link.species.url),
    name: link.species.name,
    depth,
    condition: describeEvolution(link.evolution_details[0]),
  });
  for (const next of link.evolves_to) flattenChain(next, depth + 1, out);
  return out;
}

// ---------- Fetchers ----------

export async function fetchPokemon(idOrName: number | string): Promise<PokemonSummary> {
  const { data } = await pokeApi.get<ApiPokemon>(`/pokemon/${idOrName}`);
  return toSummary(data);
}

export interface LoadResult {
  pokemon: PokemonSummary[];
  fromCache: boolean;
  failed: number;
}

/**
 * Loads every Pokémon in the dex. Uses the localStorage cache when fresh; otherwise
 * requests details in batches (PokeAPI's list endpoint omits types/stats/images).
 */
export async function loadDex(onProgress?: (loaded: number, total: number) => void): Promise<LoadResult> {
  const cached = readCache<PokemonSummary[]>(CACHE_KEY, CACHE_MAX_AGE);
  if (cached && cached.length === DEX_SIZE) {
    return { pokemon: cached, fromCache: true, failed: 0 };
  }

  const ids = Array.from({ length: DEX_SIZE }, (_, i) => i + 1);
  const results: PokemonSummary[] = [];
  let failed = 0;

  for (let start = 0; start < ids.length; start += BATCH_SIZE) {
    const batch = ids.slice(start, start + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map((id) => fetchPokemon(id)));
    for (const r of settled) {
      if (r.status === 'fulfilled') results.push(r.value);
      else failed += 1;
    }
    // Every request in the first batch failing means the API is down; stop early.
    if (start === 0 && failed === batch.length) {
      const firstError = settled.find((r) => r.status === 'rejected');
      throw firstError?.status === 'rejected' ? firstError.reason : new Error('PokeAPI unavailable');
    }
    onProgress?.(Math.min(start + BATCH_SIZE, ids.length), ids.length);
  }

  results.sort((a, b) => a.id - b.id);
  if (failed === 0) writeCache(CACHE_KEY, results);
  return { pokemon: results, fromCache: false, failed };
}

export const fetchSpecies = memoizeAsync(async (id: number): Promise<SpeciesInfo> => {
  const { data } = await pokeApi.get<ApiSpecies>(`/pokemon-species/${id}`);
  return toSpeciesInfo(data);
});

export const fetchEvolutionChain = memoizeAsync(async (url: string): Promise<EvolutionNode[]> => {
  // Chain URLs are absolute, so Axios ignores the instance baseURL here.
  const { data } = await pokeApi.get<ApiEvolutionChain>(url);
  return flattenChain(data.chain);
});
