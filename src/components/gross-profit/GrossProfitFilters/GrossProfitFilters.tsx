'use client';

import { useState } from 'react';
import { subDays, subMonths, startOfMonth, format } from 'date-fns';
import { formatPeriodLabel } from '@/src/shared/utils/dateUtils';
import './GrossProfitFilters.css';

interface GrossProfitFiltersProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

interface QuickRange {
  key: string;
  label: string;
  start: string;
  end: string;
}

function buildQuickRange(key: string, label: string, start: Date, end: Date): QuickRange {
  return { key, label, start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
}

function getQuickRanges(): QuickRange[] {
  const end = new Date();
  return [
    buildQuickRange('month', 'Este mes', startOfMonth(end), end),
    buildQuickRange('7d', 'Últimos 7 días', subDays(end, 6), end),
    buildQuickRange('15d', 'Últimos 15 días', subDays(end, 14), end),
    buildQuickRange('30d', 'Últimos 30 días', subDays(end, 29), end),
    buildQuickRange('3m', 'Últimos 3 meses', subMonths(end, 3), end),
    buildQuickRange('6m', 'Últimos 6 meses', subMonths(end, 6), end),
  ];
}

export default function GrossProfitFilters({ startDate, endDate, onChange }: GrossProfitFiltersProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const ranges = getQuickRanges();
  const activeKey = ranges.find((r) => r.start === startDate && r.end === endDate)?.key;

  const handleQuick = (range: QuickRange) => {
    setLocalStart(range.start);
    setLocalEnd(range.end);
    onChange(range.start, range.end);
  };

  const handleApply = () => {
    if (localStart && localEnd && localStart <= localEnd) {
      onChange(localStart, localEnd);
    }
  };

  return (
    <div className="gross-profit-filters">
      <div className="gross-profit-filters__quick">
        {ranges.map((r) => (
          <button
            key={r.key}
            className={`gross-profit-filters__quick-btn${activeKey === r.key ? ' gross-profit-filters__quick-btn--active' : ''}`}
            onClick={() => handleQuick(r)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="gross-profit-filters__custom">
        <div className="gross-profit-filters__field">
          <label className="gross-profit-filters__label">Desde</label>
          <input
            type="date"
            className="gross-profit-filters__input"
            value={localStart}
            max={localEnd}
            onChange={(e) => setLocalStart(e.target.value)}
          />
        </div>

        <div className="gross-profit-filters__field">
          <label className="gross-profit-filters__label">Hasta</label>
          <input
            type="date"
            className="gross-profit-filters__input"
            value={localEnd}
            min={localStart}
            onChange={(e) => setLocalEnd(e.target.value)}
          />
        </div>

        <button className="gross-profit-filters__apply" onClick={handleApply}>
          Aplicar
        </button>
      </div>

      <p className="gross-profit-filters__period" aria-live="polite">
        {formatPeriodLabel(startDate, endDate)}
      </p>
    </div>
  );
}
