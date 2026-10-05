import { useContext } from 'react';
import { PokemonDataContext } from '../context/PokemonDataContext';
import type { PokemonDataState } from '../context/PokemonDataContext';

export function usePokemonData(): PokemonDataState {
  const ctx = useContext(PokemonDataContext);
  if (!ctx) throw new Error('usePokemonData must be used inside <PokemonDataProvider>');
  return ctx;
}
