import { useId } from 'react';
import { SORT_FIELDS, isSortField, orderLabel } from '../lib/listQuery';
import type { SortField, SortOrder } from '../lib/listQuery';
import styles from './SortControls.module.css';

interface SortControlsProps {
  field: SortField;
  order: SortOrder;
  onFieldChange: (field: SortField) => void;
  onOrderChange: (order: SortOrder) => void;
}

const fieldEntries = Object.entries(SORT_FIELDS) as [SortField, (typeof SORT_FIELDS)[SortField]][];

export default function SortControls({ field, order, onFieldChange, onOrderChange }: SortControlsProps) {
  const selectId = useId();
  return (
    <div className={styles.controls}>
      <label htmlFor={selectId} className={styles.label}>
        Sort by
      </label>
      <div className={styles.selectWrap}>
        <select
          id={selectId}
          className={styles.select}
          value={field}
          onChange={(e) => {
            if (isSortField(e.target.value)) onFieldChange(e.target.value);
          }}
        >
          {fieldEntries.map(([key, def]) => (
            <option key={key} value={key}>
              {def.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.segmented} role="group" aria-label="Sort order">
        {(['asc', 'desc'] as const).map((o) => (
          <button
            key={o}
            type="button"
            className={styles.segment}
            aria-pressed={order === o}
            onClick={() => onOrderChange(o)}
            title={o === 'asc' ? 'Ascending' : 'Descending'}
          >
            <span aria-hidden="true">{o === 'asc' ? '↑' : '↓'}</span> {orderLabel(field, o)}
            <span className="visually-hidden">{o === 'asc' ? ' (ascending)' : ' (descending)'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
