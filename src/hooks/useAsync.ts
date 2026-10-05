import { useEffect, useRef, useState } from 'react';
import { describeError } from '../api/client';

export type AsyncState<T> =
  { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string };

interface Keyed<T> {
  key: string;
  state: AsyncState<T>;
}

/**
 * Runs `task` whenever `key` changes and exposes its state. A `null` key stays idle.
 * Results are tagged with the key that produced them, so a stale response is never
 * shown for a newer key (e.g. when clicking Next quickly in the detail view).
 */
export function useAsync<T>(key: string | null, task: () => Promise<T>): AsyncState<T> {
  const [result, setResult] = useState<Keyed<T> | null>(null);
  const taskRef = useRef(task);

  useEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    taskRef
      .current()
      .then((data) => {
        if (!cancelled) setResult({ key, state: { status: 'success', data } });
      })
      .catch((err: unknown) => {
        if (!cancelled) setResult({ key, state: { status: 'error', error: describeError(err) } });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (key === null) return { status: 'idle' };
  if (!result || result.key !== key) return { status: 'loading' };
  return result.state;
}
