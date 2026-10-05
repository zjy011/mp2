import type { PokemonType } from '../types/pokemon';
import type { MatchMode } from '../lib/listQuery';
import { titleCase } from '../lib/format';
import styles from './TypeFilter.module.css';

interface TypeFilterProps {
  options: { type: PokemonType; count: number }[];
  selected: PokemonType[];
  mode: MatchMode;
  onToggle: (type: PokemonType) => void;
  onModeChange: (mode: MatchMode) => void;
  onClear: () => void;
}

export default function TypeFilter({ options, selected, mode, onToggle, onModeChange, onClear }: TypeFilterProps) {
  return (
    <section className={styles.panel} aria-labelledby="type-filter-heading">
      <div className={styles.header}>
        <h2 id="type-filter-heading" className={styles.heading}>
          Filter by type
          {selected.length > 0 && <span className={styles.count}>{selected.length} selected</span>}
        </h2>

        <div className={styles.tools}>
          <div className={styles.segmented} role="group" aria-label="How to combine selected types">
            <button
              type="button"
              className={styles.segment}
              aria-pressed={mode === 'any'}
              onClick={() => onModeChange('any')}
            >
              Match any
            </button>
            <button
              type="button"
              className={styles.segment}
              aria-pressed={mode === 'all'}
              onClick={() => onModeChange('all')}
            >
              Match all
            </button>
          </div>
          <button type="button" className={styles.clear} onClick={onClear} disabled={selected.length === 0}>
            Clear
          </button>
        </div>
      </div>

      <div className={styles.chips}>
        {options.map(({ type, count }) => {
          const active = selected.includes(type);
          return (
            <button
              key={type}
              type="button"
              data-type={type}
              className={styles.chip}
              aria-pressed={active}
              onClick={() => onToggle(type)}
            >
              <span className={styles.dot} aria-hidden="true" />
              {titleCase(type)}
              <span className={styles.chipCount}>{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
