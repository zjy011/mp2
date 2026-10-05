// ---------- Raw PokeAPI response shapes (only the fields this app reads) ----------

export interface ApiNamedResource {
  name: string;
  url: string;
}

export interface ApiPokemon {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  base_experience: number | null;
  types: { slot: number; type: ApiNamedResource }[];
  stats: { base_stat: number; effort: number; stat: ApiNamedResource }[];
  abilities: { ability: ApiNamedResource; is_hidden: boolean; slot: number }[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
}

export interface ApiSpecies {
  id: number;
  name: string;
  capture_rate: number;
  base_happiness: number | null;
  gender_rate: number; // chance of being female in eighths, -1 = genderless
  is_legendary: boolean;
  is_mythical: boolean;
  color: ApiNamedResource;
  habitat: ApiNamedResource | null;
  generation: ApiNamedResource;
  growth_rate: ApiNamedResource;
  egg_groups: ApiNamedResource[];
  evolution_chain: { url: string } | null;
  genera: { genus: string; language: ApiNamedResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: ApiNamedResource;
    version: ApiNamedResource;
  }[];
}

export interface ApiEvolutionDetail {
  min_level: number | null;
  min_happiness: number | null;
  trigger: ApiNamedResource;
  item: ApiNamedResource | null;
  held_item: ApiNamedResource | null;
  time_of_day: string;
}

export interface ApiChainLink {
  species: ApiNamedResource;
  evolution_details: ApiEvolutionDetail[];
  evolves_to: ApiChainLink[];
}

export interface ApiEvolutionChain {
  id: number;
  chain: ApiChainLink;
}

// ---------- Domain types used by the UI ----------

export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export interface StatBlock {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Ability {
  name: string;
  hidden: boolean;
}

export interface PokemonSummary {
  id: number;
  name: string;
  types: PokemonType[];
  height: number; // decimetres
  weight: number; // hectograms
  baseExperience: number;
  stats: StatBlock;
  total: number;
  abilities: Ability[];
  artwork: string;
  sprite: string;
}

export interface EvolutionNode {
  id: number;
  name: string;
  depth: number;
  condition: string | null;
}

export interface SpeciesInfo {
  genus: string;
  flavorText: string;
  color: string;
  habitat: string | null;
  generation: string;
  growthRate: string;
  eggGroups: string[];
  captureRate: number;
  baseHappiness: number | null;
  genderRate: number;
  isLegendary: boolean;
  isMythical: boolean;
  evolutionChainUrl: string | null;
}

export type DataSource = 'network' | 'cache' | 'mock';
