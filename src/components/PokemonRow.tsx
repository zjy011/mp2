import { Link } from 'react-router-dom';
import type { PokemonSummary } from '../types/pokemon';
import type { DetailLocationState } from '../lib/browseContext';
import type { SortField } from '../lib/listQuery';
import { dexNumber, formatHeightShort, formatWeightShort, titleCase } from '../lib/format';
import TypeBadge from './TypeBadge';
import styles from './PokemonRow.module.css';

interface PokemonRowProps {
  pokemon: PokemonSummary;
  query: string;
  sortField: SortField;
  linkState: DetailLocationState;
}

/** Wraps the part of `text` that matches `query` in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const index = q ? text.toLowerCase().indexOf(q) : -1;
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className={styles.mark}>{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  );
}

export default function PokemonRow({ pokemon, query, sortField, linkState }: PokemonRowProps) {
  const cell = (field: SortField) => (sortField === field ? `${styles.metric} ${styles.sorted}` : styles.metric);

  return (
    <li>
      <Link to={`/details/${pokemon.id}`} state={linkState} className={styles.row} data-type={pokemon.types[0]}>
        <span className={styles.spriteWrap}>
          <img src={pokemon.sprite} alt="" className={styles.sprite} loading="lazy" width={96} height={96} />
        </span>

        <span className={styles.identity}>
          <span className={styles.number}>{dexNumber(pokemon.id)}</span>
          <span className={styles.name}>
            <Highlight text={titleCase(pokemon.name)} query={query} />
          </span>
        </span>

        <span className={styles.types}>
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </span>

        <span className={styles.metrics}>
          <span className={cell('height')}>
            <span className={styles.metricLabel}>Height</span>
            {formatHeightShort(pokemon.height)}
          </span>
          <span className={cell('weight')}>
            <span className={styles.metricLabel}>Weight</span>
            {formatWeightShort(pokemon.weight)}
          </span>
          <span className={cell('baseExperience')}>
            <span className={styles.metricLabel}>Base XP</span>
            {pokemon.baseExperience}
          </span>
          <span className={cell('total')}>
            <span className={styles.metricLabel}>Stat total</span>
            {pokemon.total}
          </span>
        </span>

        <span className={styles.chevron} aria-hidden="true">
          ›
        </span>
      </Link>
    </li>
  );
}
