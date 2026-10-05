import type { StatBlock } from '../types/pokemon';
import styles from './StatBars.module.css';

const STAT_LABELS: [keyof StatBlock, string][] = [
  ['hp', 'HP'],
  ['attack', 'Attack'],
  ['defense', 'Defense'],
  ['specialAttack', 'Sp. Atk'],
  ['specialDefense', 'Sp. Def'],
  ['speed', 'Speed'],
];

/** Highest single base stat among the original 151 is Chansey's HP (250); 255 is the game cap. */
const STAT_MAX = 255;

function tier(value: number): string {
  if (value >= 100) return styles.high;
  if (value >= 70) return styles.mid;
  return styles.low;
}

export default function StatBars({ stats, total }: { stats: StatBlock; total: number }) {
  return (
    <dl className={styles.stats}>
      {STAT_LABELS.map(([key, label]) => (
        <div key={key} className={styles.row}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{stats[key]}</dd>
          <dd className={styles.barCell}>
            <progress
              className={`${styles.bar} ${tier(stats[key])}`}
              value={stats[key]}
              max={STAT_MAX}
              aria-label={`${label} ${stats[key]} of ${STAT_MAX}`}
            />
          </dd>
        </div>
      ))}
      <div className={`${styles.row} ${styles.totalRow}`}>
        <dt className={styles.label}>Total</dt>
        <dd className={styles.value}>{total}</dd>
        <dd className={styles.barCell} />
      </div>
    </dl>
  );
}
