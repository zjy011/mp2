import { usePokemonData } from '../hooks/usePokemonData';
import styles from './DataBanner.module.css';

/** Shown when the live API failed (mock fallback) or some entries were missing. */
export default function DataBanner() {
  const { warning, reload } = usePokemonData();
  if (!warning) return null;
  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <p className={styles.text}>{warning}</p>
      <button type="button" className={styles.retry} onClick={reload}>
        Retry
      </button>
    </div>
  );
}
