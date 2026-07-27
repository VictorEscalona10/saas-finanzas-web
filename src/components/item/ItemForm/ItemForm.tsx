'use client';

import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { useCreateItem } from '@/src/use-cases/item/useCreateItem';
import { useUpdateItem } from '@/src/use-cases/item/useUpdateItem';
import type { Item } from '@/src/domain/entities/Item';
import type { ItemType } from '@/src/domain/entities/Item';
import Button from '@/src/components/shared/Button';
import './ItemForm.css';

function formatCurrency(raw: string): string {
  if (!raw) return '';
  const num = parseInt(raw, 10) / 100;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function stripLeadingZeros(v: string): string {
  return v.replace(/^0+/, '') || '0';
}

interface ItemFormProps {
  companyId: string;
  item?: Item;
  onSave: () => void;
  onCancel: () => void;
  id?: string;
  hideFooter?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export default function ItemForm({ companyId, item, onSave, onCancel, id, hideFooter, onLoadingChange }: ItemFormProps) {
  const isEdit = !!item;
  const { createItems, loading: creating } = useCreateItem();
  const { updateItem, loading: updating } = useUpdateItem();

const [name, setName] = useState(item?.name ?? '');
  const [type, setType] = useState<ItemType>(item?.type ?? 'PRODUCT');
  const [rawPrice, setRawPrice] = useState(() => {
    if (item?.basePrice && item.basePrice > 0) {
      return String(Math.round(item.basePrice * 100));
    }
    return '';
  });
  const [stockRaw, setStockRaw] = useState(() => {
    if (item?.stockCurrent !== undefined && item.stockCurrent > 0) {
      return String(item.stockCurrent);
    }
    return '0';
  });
  const [error, setError] = useState<string | null>(null);

  const basePrice = rawPrice ? parseInt(rawPrice, 10) / 100 : 0;
  const stockCurrent = parseInt(stockRaw, 10) || 0;
  const loading = creating || updating;
  const displayPrice = formatCurrency(rawPrice);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handlePriceChange = useCallback((value: string) => {
    setRawPrice(value.replace(/\D/g, ''));
  }, []);

  const handleStockChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '');
    setStockRaw(stripLeadingZeros(digits));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del item es obligatorio');
      return;
    }

    if (basePrice < 0) {
      setError('El precio base no puede ser negativo');
      return;
    }

    let success = false;
    const payload = {
      name: name.trim(),
      type,
      basePrice,
      ...(type === 'PRODUCT' ? { stockCurrent } : {}),
    };

    if (isEdit && item) {
      const result = await updateItem(item.id, companyId, payload);
      success = result !== null;
    } else {
      const result = await createItems(companyId, [payload]);
      success = result !== null;
    }

    if (success) {
      onSave();
    }
  }, [name, type, basePrice, stockCurrent, isEdit, item, companyId, createItems, updateItem, onSave]);

  return (
    <div className="item-form-wrapper">
      <div className="item-form">
        <form className="item-form__body" id={id} onSubmit={handleSubmit}>
          <div className="item-form__field">
            <label className="item-form__label" htmlFor="item-name">Nombre del Producto o Servicio</label>
            <input
              id="item-name"
              className={`item-form__input${error ? ' item-form__input--error' : ''}`}
              type="text"
              placeholder="Ej: Terminal de Cobro Pro"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
            />
            {error && <span className="item-form__error">{error}</span>}
          </div>

          <div className="item-form__field">
            <label className="item-form__label" htmlFor="item-type">Tipo de Item</label>
            <div className="item-form__select-wrapper">
              <select
                id="item-type"
                className="item-form__select"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as ItemType);
                  if (e.target.value === 'SERVICE') setStockRaw('0');
                }}
              >
                <option value="PRODUCT">Producto</option>
                <option value="SERVICE">Servicio</option>
              </select>
              <span className="material-symbols-outlined item-form__select-arrow">expand_more</span>
            </div>
          </div>

          <div className="item-form__section-label">Valores y Existencias</div>

          <div className="item-form__grid">
            <div className="item-form__field">
              <label className="item-form__label" htmlFor="item-price">Precio Base (USD)</label>
              <div className="item-form__input-group">
                <span className="item-form__input-prefix">$</span>
                <input
                  id="item-price"
                  className="item-form__input item-form__input--with-prefix"
                  type="text"
                  inputMode="numeric"
                  placeholder="0.00"
                  value={displayPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
              </div>
            </div>

{type === 'PRODUCT' && (
              <div className="item-form__field">
                <label className="item-form__label" htmlFor="item-stock">Stock Inicial</label>
                <input
                  id="item-stock"
                  className="item-form__input"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={stockRaw}
                  onChange={(e) => handleStockChange(e.target.value)}
                />
              </div>
            )}

          </div>

          {!hideFooter && (
            <div className="item-form__footer">
              <Button variant="outline" size="lg" fullWidth onClick={onCancel} type="button" disabled={loading}>
                Cancelar
              </Button>
              <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
                {loading ? 'Guardando...' : 'Guardar Item'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
