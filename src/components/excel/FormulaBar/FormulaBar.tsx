'use client';

import { useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import './FormulaBar.css';

interface FormulaBarProps {
  address: string | null;
  value: string | null;
  onCommit: (value: string) => void;
  onFillRange?: (value: string) => void;
  disabled?: boolean;
}

function isUnchanged(current: string, committed: string): boolean {
  return current === committed;
}

export default function FormulaBar({
  address,
  value,
  onCommit,
  onFillRange,
  disabled = false,
}: FormulaBarProps) {
  const [draft, setDraft] = useState(value ?? '');
  const [focused, setFocused] = useState(false);

  const shown = focused ? draft : value ?? '';

  const commit = () => {
    setFocused(false);
    if (isUnchanged(draft, value ?? '')) return;
    onCommit(draft);
  };

  const commitFill = () => {
    setFocused(false);
    onFillRange?.(draft);
  };

  const handleFocus = () => {
    setDraft(value ?? '');
    setFocused(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        commitFill();
        e.currentTarget.blur();
      } else {
        commit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraft(value ?? '');
      setFocused(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div className="formula-bar">
      <div className="formula-bar__address" title="Celda activa">
        {address ?? '\u2014'}
      </div>
      <div className="formula-bar__field">
        <span className="formula-bar__fx" aria-hidden="true">
          fx
        </span>
        <input
          className="formula-bar__input"
          value={shown}
          disabled={disabled}
          placeholder="Selecciona una celda"
          title="Enter: aplicar a la celda activa · Ctrl+Enter: aplicar a la selección"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Caja de fórmulas"
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}