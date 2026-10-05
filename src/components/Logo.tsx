import styles from './Logo.module.css';

/** Original line-art "scope" mark: a capsule split by a band, with a lens in the middle. */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`${styles.logo} ${className ?? ''}`} aria-hidden="true">
      <circle cx="16" cy="16" r="14" className={styles.bottom} />
      <path d="M2 16a14 14 0 0 1 28 0Z" className={styles.top} />
      <path d="M2 16h28" className={styles.band} />
      <circle cx="16" cy="16" r="5" className={styles.lens} />
      <circle cx="16" cy="16" r="2" className={styles.pupil} />
    </svg>
  );
}
