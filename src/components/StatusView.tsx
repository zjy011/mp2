import type { ReactNode } from 'react';
import styles from './StatusView.module.css';

interface LoadingProps {
  kind: 'loading';
  title?: string;
  progress?: { loaded: number; total: number };
}

interface MessageProps {
  kind: 'error' | 'empty';
  title: string;
  message?: ReactNode;
  action?: ReactNode;
}

type StatusViewProps = LoadingProps | MessageProps;

/** Shared loading / error / empty state panel. */
export default function StatusView(props: StatusViewProps) {
  if (props.kind === 'loading') {
    const { title = 'Loading…', progress } = props;
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <h2 className={styles.title}>{title}</h2>
        {progress && (
          <>
            <progress className={styles.progress} value={progress.loaded} max={progress.total} />
            <p className={styles.message}>
              {progress.loaded} / {progress.total} Pokémon
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.panel} ${styles[props.kind]}`} role={props.kind === 'error' ? 'alert' : 'status'}>
      <span className={styles.glyph} aria-hidden="true">
        {props.kind === 'error' ? '⚠' : '∅'}
      </span>
      <h2 className={styles.title}>{props.title}</h2>
      {props.message && <p className={styles.message}>{props.message}</p>}
      {props.action && <div className={styles.action}>{props.action}</div>}
    </div>
  );
}
