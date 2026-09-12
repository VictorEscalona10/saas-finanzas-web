'use client';

import { useState, useMemo } from 'react';
import { subDays, subMonths, startOfMonth, format, addDays, parse, differenceInCalendarDays } from 'date-fns';
import { formatPeriodLabel } from '@/src/shared/utils/dateUtils';
import './ContributionFilters.css';

const MAX_RANGE_DAYS = 365;

interface ContributionFiltersProps {
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

export default function ContributionFilters({ startDate, endDate, onChange }: ContributionFiltersProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const ranges = getQuickRanges();
  const activeKey = ranges.find((r) => r.start === startDate && r.end === endDate)?.key;

  const maxEndDate = useMemo(() => {
    if (!localStart) return '';
    const start = parse(localStart, 'yyyy-MM-dd', new Date());
    return format(addDays(start, MAX_RANGE_DAYS), 'yyyy-MM-dd');
  }, [localStart]);

  const isOutOfRange = useMemo(() => {
    if (!localStart || !localEnd) return false;
    const start = parse(localStart, 'yyyy-MM-dd', new Date());
    const end = parse(localEnd, 'yyyy-MM-dd', new Date());
    return differenceInCalendarDays(end, start) > MAX_RANGE_DAYS;
  }, [localStart, localEnd]);

  const handleQuick = (range: QuickRange) => {
    setLocalStart(range.start);
    setLocalEnd(range.end);
    onChange(range.start, range.end);
  };

  const handleApply = () => {
    if (localStart && localEnd && localStart <= localEnd && !isOutOfRange) {
      onChange(localStart, localEnd);
    }
  };

  return (
    <div className="contribution-filters">
      <div className="contribution-filters__quick">
        {ranges.map((r) => (
          <button
            key={r.key}
            className={`contribution-filters__quick-btn${activeKey === r.key ? ' contribution-filters__quick-btn--active' : ''}`}
            onClick={() => handleQuick(r)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="contribution-filters__custom">
        <div className="contribution-filters__field">
          <label className="contribution-filters__label">Desde</label>
          <input
            type="date"
            className="contribution-filters__input"
            value={localStart}
            max={localEnd}
            onChange={(e) => setLocalStart(e.target.value)}
          />
        </div>

        <div className="contribution-filters__field">
          <label className="contribution-filters__label">Hasta</label>
          <input
            type="date"
            className="contribution-filters__input"
            value={localEnd}
            min={localStart}
            max={maxEndDate}
            onChange={(e) => setLocalEnd(e.target.value)}
          />
        </div>

        <button
          className={`contribution-filters__apply${isOutOfRange ? ' contribution-filters__apply--disabled' : ''}`}
          onClick={handleApply}
          disabled={isOutOfRange}
        >
          Aplicar
        </button>
      </div>

      {isOutOfRange && (
        <p className="contribution-filters__warning" role="alert">
          El rango no puede superar 1 año (365 días).
        </p>
      )}

      <p className="contribution-filters__period" aria-live="polite">
        {formatPeriodLabel(startDate, endDate)}
      </p>
    </div>
  );
}
