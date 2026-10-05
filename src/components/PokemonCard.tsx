import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PokemonSummary } from '../types/pokemon';
import type { DetailLocationState } from '../lib/browseContext';
import { dexNumber, titleCase } from '../lib/format';
import TypeBadge from './TypeBadge';
import styles from './PokemonCard.module.css';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  linkState: DetailLocationState;
}

export default function PokemonCard({ pokemon, linkState }: PokemonCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <li className={styles.item}>
      <Link
        to={`/details/${pokemon.id}`}
        state={linkState}
        className={styles.card}
        data-type={pokemon.types[0]}
        aria-label={`${titleCase(pokemon.name)}, ${dexNumber(pokemon.id)}`}
      >
        <span className={styles.number} aria-hidden="true">
          {dexNumber(pokemon.id)}
        </span>
        <span className={`${styles.frame} ${loaded ? styles.loaded : ''}`}>
          <img
            src={pokemon.artwork}
            alt=""
            className={styles.art}
            loading="lazy"
            width={475}
            height={475}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
        </span>
        <span className={styles.caption}>
          <span className={styles.name}>{titleCase(pokemon.name)}</span>
          <span className={styles.types}>
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} size="sm" />
            ))}
          </span>
        </span>
      </Link>
    </li>
  );
}
