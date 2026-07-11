'use client';

import type { ItemTypeFilter } from '@/src/use-cases/item/useItemList';
import './ItemTypeFilter.css';

interface ItemTypeFilterProps {
  value: ItemTypeFilter;
  onChange: (value: ItemTypeFilter) => void;
}

const OPTIONS: { value: ItemTypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'PRODUCT', label: 'Productos' },
  { value: 'SERVICE', label: 'Servicios' },
];

export default function ItemTypeFilter({ value, onChange }: ItemTypeFilterProps) {
  return (
    <div className="item-type-filter">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`item-type-filter__btn${value === opt.value ? ' item-type-filter__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
