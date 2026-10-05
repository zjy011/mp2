import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { usePokemonData } from '../hooks/usePokemonData';
import { filterByTypes, isMatchMode, parseTypes, typeCounts } from '../lib/listQuery';
import type { MatchMode } from '../lib/listQuery';
import type { DetailLocationState } from '../lib/browseContext';
import type { PokemonType } from '../types/pokemon';
import { titleCase } from '../lib/format';
import TypeFilter from '../components/TypeFilter';
import PokemonCard from '../components/PokemonCard';
import StatusView from '../components/StatusView';
import styles from './GalleryView.module.css';

export default function GalleryView() {
  const { status, pokemon, progress } = usePokemonData();
  const location = useLocation();

  // Filters live in the URL (?types=fire,water&match=all) so they survive navigation.
  const [params, setParams] = useSearchParams();
  const selected = parseTypes(params.get('types'));
  const matchParam = params.get('match');
  const mode: MatchMode = isMatchMode(matchParam) ? matchParam : 'any';

  const writeFilters = (types: PokemonType[], nextMode: MatchMode) => {
    const next = new URLSearchParams();
    if (types.length) next.set('types', types.join(','));
    if (nextMode !== 'any') next.set('match', nextMode);
    setParams(next, { replace: true });
  };

  const toggleType = (type: PokemonType) =>
    writeFilters(selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type], mode);

  const options = useMemo(() => typeCounts(pokemon), [pokemon]);
  const selectedKey = selected.join(',');
  const results = useMemo(() => filterByTypes(pokemon, parseTypes(selectedKey), mode), [pokemon, selectedKey, mode]);

  const linkState = useMemo<DetailLocationState>(() => {
    const filterText = selectedKey
      ? selectedKey
          .split(',')
          .map(titleCase)
          .join(mode === 'all' ? ' + ' : ' / ')
      : 'All types';
    return {
      browse: {
        ids: results.map((p) => p.id),
        label: `Gallery · ${filterText}`,
        returnTo: `${location.pathname}${location.search}`,
        origin: 'gallery',
      },
    };
  }, [results, selectedKey, mode, location.pathname, location.search]);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Gallery view</p>
        <h1 className={styles.title}>The Kanto collection</h1>
        <p className={styles.lede}>
          Official artwork for all {pokemon.length || 151} original Pokémon. Pick one or more types to narrow the
          gallery. “Match any” shows Pokémon with at least one selected type. “Match all” shows only Pokémon that have
          every selected type.
        </p>
      </header>

      {status === 'loading' ? (
        <StatusView kind="loading" title="Developing the gallery…" progress={progress} />
      ) : (
        <>
          <TypeFilter
            options={options}
            selected={selected}
            mode={mode}
            onToggle={toggleType}
            onModeChange={(m) => writeFilters(selected, m)}
            onClear={() => writeFilters([], mode)}
          />

          <p className={styles.count} aria-live="polite">
            <strong>{results.length}</strong> Pokémon on display
          </p>

          {results.length === 0 ? (
            <StatusView
              kind="empty"
              title="No Pokémon fit those filters"
              message={`No original Pokémon has all of: ${selected.map(titleCase).join(', ')}. Try “Match any” or remove a type.`}
              action={
                <button type="button" className={styles.reset} onClick={() => writeFilters(selected, 'any')}>
                  Switch to “Match any”
                </button>
              }
            />
          ) : (
            <ul className={styles.grid}>
              {results.map((p) => (
                <PokemonCard key={p.id} pokemon={p} linkState={linkState} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
