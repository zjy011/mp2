import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DEX_SIZE, loadDex } from '../api/pokemon';
import { describeError } from '../api/client';
import { MOCK_POKEMON } from '../data/mockPokemon';
import { PokemonDataContext } from './PokemonDataContext';
import type { PokemonDataState } from './PokemonDataContext';
import type { DataSource, PokemonSummary } from '../types/pokemon';

interface LoadState {
  status: 'loading' | 'ready';
  pokemon: PokemonSummary[];
  source: DataSource | null;
  progress: { loaded: number; total: number };
  warning: string | null;
}

const initialState: LoadState = {
  status: 'loading',
  pokemon: [],
  source: null,
  progress: { loaded: 0, total: DEX_SIZE },
  warning: null,
};

export function PokemonDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>(initialState);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadDex((loaded, total) => {
      if (!cancelled) setState((s) => ({ ...s, progress: { loaded, total } }));
    })
      .then(({ pokemon, fromCache, failed }) => {
        if (cancelled) return;
        setState({
          status: 'ready',
          pokemon,
          source: fromCache ? 'cache' : 'network',
          progress: { loaded: DEX_SIZE, total: DEX_SIZE },
          warning: failed > 0 ? `${failed} Pokémon could not be loaded from PokeAPI.` : null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // API unavailable: fall back to bundled sample data so the app stays usable.
        setState({
          status: 'ready',
          pokemon: MOCK_POKEMON,
          source: 'mock',
          progress: { loaded: DEX_SIZE, total: DEX_SIZE },
          warning: `${describeError(err)} Showing offline sample data instead.`,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState(initialState);
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo<PokemonDataState>(
    () => ({
      ...state,
      byId: new Map(state.pokemon.map((p) => [p.id, p])),
      reload,
    }),
    [state, reload],
  );

  return <PokemonDataContext.Provider value={value}>{children}</PokemonDataContext.Provider>;
}
