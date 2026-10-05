import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePokemonData } from '../hooks/usePokemonData';
import { SORT_FIELDS, isSortField, isSortOrder, orderLabel, searchAndSort } from '../lib/listQuery';
import type { SortField, SortOrder } from '../lib/listQuery';
import type { DetailLocationState } from '../lib/browseContext';
import SearchBar from '../components/SearchBar';
import SortControls from '../components/SortControls';
import PokemonRow from '../components/PokemonRow';
import StatusView from '../components/StatusView';
import styles from './ListView.module.css';

const DEFAULT_SORT: SortField = 'id';
const DEFAULT_ORDER: SortOrder = 'asc';

export default function ListView() {
  const { status, pokemon, progress } = usePokemonData();

  // Search/sort are mirrored into the URL so Back from a detail page restores them exactly.
  // The query text itself is local state: router URL updates are async, and driving a
  // controlled input from them drops keystrokes when typing quickly.
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const sortParam = params.get('sort');
  const orderParam = params.get('order');
  const sortField: SortField = isSortField(sortParam) ? sortParam : DEFAULT_SORT;
  const sortOrder: SortOrder = isSortOrder(orderParam) ? orderParam : DEFAULT_ORDER;

  const updateParam = (key: string, value: string, fallback: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== fallback) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const onSearch = (value: string) => {
    setQuery(value);
    updateParam('q', value, '');
  };

  const returnTo = useMemo(() => {
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    if (sortField !== DEFAULT_SORT) search.set('sort', sortField);
    if (sortOrder !== DEFAULT_ORDER) search.set('order', sortOrder);
    const qs = search.toString();
    return qs ? `/list?${qs}` : '/list';
  }, [query, sortField, sortOrder]);

  const results = useMemo(
    () => searchAndSort(pokemon, query, sortField, sortOrder),
    [pokemon, query, sortField, sortOrder],
  );

  const linkState = useMemo<DetailLocationState>(() => {
    const parts = ['List'];
    if (query.trim()) parts.push(`“${query.trim()}”`);
    parts.push(`${SORT_FIELDS[sortField].label} ${orderLabel(sortField, sortOrder)}`);
    return {
      browse: {
        ids: results.map((p) => p.id),
        label: parts.join(' · '),
        returnTo,
        origin: 'list',
      },
    };
  }, [results, query, sortField, sortOrder, returnTo]);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>List view</p>
        <h1 className={styles.title}>Search the Kanto Pokédex</h1>
        <p className={styles.lede}>
          Type a name or dex number. Results update as you type. Sort by any column in either direction.
        </p>
      </header>

      <div className={styles.toolbar}>
        <SearchBar
          value={query}
          onChange={onSearch}
          placeholder="Search by name or number, e.g. “char” or 25"
        />
        <SortControls
          field={sortField}
          order={sortOrder}
          onFieldChange={(f) => updateParam('sort', f, DEFAULT_SORT)}
          onOrderChange={(o) => updateParam('order', o, DEFAULT_ORDER)}
        />
      </div>

      {status === 'loading' ? (
        <StatusView kind="loading" title="Catching Pokémon…" progress={progress} />
      ) : (
        <>
          <p className={styles.count} aria-live="polite">
            Showing <strong>{results.length}</strong> of {pokemon.length} Pokémon
            {query.trim() && (
              <>
                {' '}
                matching <strong>“{query.trim()}”</strong>
              </>
            )}
          </p>

          {results.length === 0 ? (
            <StatusView
              kind="empty"
              title="No Pokémon found"
              message={`Nothing matches “${query.trim()}”. Check the spelling or try a dex number.`}
              action={
                <button type="button" className={styles.reset} onClick={() => onSearch('')}>
                  Clear search
                </button>
              }
            />
          ) : (
            <>
              <div className={styles.columns} aria-hidden="true">
                <span />
                <span>Pokémon</span>
                <span>Type</span>
                <span className={sortField === 'height' ? styles.activeCol : undefined}>Height</span>
                <span className={sortField === 'weight' ? styles.activeCol : undefined}>Weight</span>
                <span className={sortField === 'baseExperience' ? styles.activeCol : undefined}>Base XP</span>
                <span className={sortField === 'total' ? styles.activeCol : undefined}>Stat total</span>
                <span />
              </div>
              <ol className={styles.list}>
                {results.map((p) => (
                  <PokemonRow key={p.id} pokemon={p} query={query} sortField={sortField} linkState={linkState} />
                ))}
              </ol>
            </>
          )}
        </>
      )}
    </div>
  );
}
