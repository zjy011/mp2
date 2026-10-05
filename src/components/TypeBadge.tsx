import type { PokemonType } from '../types/pokemon';
import { titleCase } from '../lib/format';
import styles from './TypeBadge.module.css';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md';
}

export default function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  return (
    <span data-type={type} className={`${styles.badge} ${styles[size]}`}>
      {titleCase(type)}
    </span>
  );
}
