import { createContext } from 'react';
import type { DataSource, PokemonSummary } from '../types/pokemon';

export interface PokemonDataState {
  status: 'loading' | 'ready';
  pokemon: PokemonSummary[];
  byId: Map<number, PokemonSummary>;
  source: DataSource | null;
  progress: { loaded: number; total: number };
  /** Set when the live API failed (mock data shown) or some items could not be loaded. */
  warning: string | null;
  reload: () => void;
}

export const PokemonDataContext = createContext<PokemonDataState | null>(null);
