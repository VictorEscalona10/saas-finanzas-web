'use client';

import { useState } from 'react';
import './CashFlowFilters.css';

interface CashFlowFiltersProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function lastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

export default function CashFlowFilters({ startDate, endDate, onChange, onClear }: CashFlowFiltersProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const currentYear = new Date().getFullYear();

  const handleSelectMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    const month = parseInt(value, 10);
    const start = `${currentYear}-${String(month + 1).padStart(2, '0')}-01`;
    const end = lastDayOfMonth(currentYear, month);
    setLocalStart(start);
    setLocalEnd(end);
    onChange(start, end);
  };

  const handleApply = () => {
    if (localStart && localEnd) {
      onChange(localStart, localEnd);
    }
  };

  const handleClear = () => {
    setLocalStart('');
    setLocalEnd('');
    onClear();
  };

  return (
    <div className="cash-flow-filters">
      <div className="cash-flow-filters__row">
        <div className="cash-flow-filters__field">
          <label className="cash-flow-filters__label">Fecha Inicio</label>
          <input
            type="date"
            className="cash-flow-filters__input"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
          />
        </div>

        <div className="cash-flow-filters__field">
          <label className="cash-flow-filters__label">Fecha Fin</label>
          <input
            type="date"
            className="cash-flow-filters__input"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
          />
        </div>

        <button className="cash-flow-filters__btn cash-flow-filters__btn--apply" onClick={handleApply}>
          Aplicar
        </button>

        <button className="cash-flow-filters__btn cash-flow-filters__btn--clear" onClick={handleClear}>
          Todo el Periodo
        </button>

        <div className="cash-flow-filters__field">
          <label className="cash-flow-filters__label">Mes</label>
          <select className="cash-flow-filters__select" onChange={handleSelectMonth} defaultValue="">
            <option value="" disabled>Seleccionar mes</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i}>{name} {currentYear}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}