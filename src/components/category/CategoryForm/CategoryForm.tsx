'use client';

import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { useCreateCategory } from '@/src/use-cases/category/useCreateCategory';
import { useUpdateCategory } from '@/src/use-cases/category/useUpdateCategory';
import type { Category } from '@/src/domain/entities/Category';
import type { CategoryType, FlowDirection } from '@/src/domain/entities/Category';
import Button from '@/src/components/shared/Button';
import './CategoryForm.css';

interface CategoryFormProps {
  companyId: string;
  category?: Category;
  onSave: () => void;
  onCancel: () => void;
  id?: string;
  hideFooter?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export default function CategoryForm({ companyId, category, onSave, onCancel, id, hideFooter, onLoadingChange }: CategoryFormProps) {
  const isEdit = !!category;
  const { createCategory, loading: creating } = useCreateCategory();
  const { updateCategory, loading: updating } = useUpdateCategory();

  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<CategoryType>(category?.type ?? 'OPERATING');
  const [flowDirection, setFlowDirection] = useState<FlowDirection>(category?.flowDirection ?? 'INFLOW');
  const [isCogs, setIsCogs] = useState(category?.isCogs ?? false);
  const [isVariable, setIsVariable] = useState(category?.isVariable ?? false);
  const [isDirectCost, setIsDirectCost] = useState(category?.isDirectCost ?? false);
  const [error, setError] = useState<string | null>(null);

  const loading = creating || updating;

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    let success = false;

    if (isEdit && category) {
      const result = await updateCategory(companyId, category.id, {
        name: name.trim(),
        type,
        flowDirection,
        isCogs,
        isVariable,
        isDirectCost: flowDirection === 'OUTFLOW' ? isDirectCost : undefined,
      });
      success = result !== null;
    } else {
      const result = await createCategory(companyId, {
        name: name.trim(),
        type,
        flowDirection,
        isCogs,
        isVariable,
        isDirectCost: flowDirection === 'OUTFLOW' ? isDirectCost : undefined,
      });
      success = result !== null;
    }

    if (success) {
      onSave();
    }
  }, [name, type, flowDirection, isCogs, isVariable, isDirectCost, isEdit, category, companyId, createCategory, updateCategory, onSave]);

  return (
    <div className="category-form-wrapper">
      <div className="category-form">
        <div className="category-form__header">
          <h3 className="category-form__title">
            {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <p className="category-form__subtitle">
            Define la estructura de tus flujos financieros
          </p>
        </div>

        <form className="category-form__body" id={id} onSubmit={handleSubmit}>
          <div className="category-form__field">
            <label className="category-form__label" htmlFor="cat-name">Nombre</label>
            <input
              id="cat-name"
              className={`category-form__input${error ? ' category-form__input--error' : ''}`}
              type="text"
              placeholder="Ej: Ventas, Marketing, Alquiler..."
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
            />
            {error && <span className="category-form__error">{error}</span>}
          </div>

          <div className="category-form__grid">
            <div className="category-form__field">
              <label className="category-form__label" htmlFor="cat-type">Tipo</label>
              <div className="category-form__select-wrapper">
                <select
                  id="cat-type"
                  className="category-form__select"
                  value={type}
                  onChange={(e) => setType(e.target.value as CategoryType)}
                >
                  <option value="OPERATING">OPERATING</option>
                  <option value="INVESTING">INVESTING</option>
                  <option value="FINANCING">FINANCING</option>
                </select>
                <span className="material-symbols-outlined category-form__select-arrow">expand_more</span>
              </div>
              <div className="category-form__badge-row">
                <span className={`category-form__badge category-form__badge--operating${type !== 'OPERATING' ? ' category-form__badge--inactive' : ''}`}>
                  OPERATING
                </span>
                <span className={`category-form__badge category-form__badge--investing${type !== 'INVESTING' ? ' category-form__badge--inactive' : ''}`}>
                  INVESTING
                </span>
                <span className={`category-form__badge category-form__badge--financing${type !== 'FINANCING' ? ' category-form__badge--inactive' : ''}`}>
                  FINANCING
                </span>
              </div>
            </div>

            <div className="category-form__field">
              <label className="category-form__label">Dirección del Flujo</label>
              <div className="category-form__segmented">
                <button
                  type="button"
                  className={`category-form__segmented-btn${flowDirection === 'INFLOW' ? ' category-form__segmented-btn--active category-form__segmented-btn--inflow' : ''}`}
                  onClick={() => {
                    setFlowDirection('INFLOW');
                    setIsCogs(false);
                    setIsVariable(false);
                    setIsDirectCost(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>trending_up</span>
                  <span>INFLOW</span>
                </button>
                <button
                  type="button"
                  className={`category-form__segmented-btn${flowDirection === 'OUTFLOW' ? ' category-form__segmented-btn--active category-form__segmented-btn--outflow' : ''}`}
                  onClick={() => setFlowDirection('OUTFLOW')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>trending_down</span>
                  <span>OUTFLOW</span>
                </button>
              </div>
            </div>
          </div>

          {flowDirection === 'OUTFLOW' && (
            <>
              <div className="category-form__grid">
                <div className="category-form__toggle-card">
                  <div className="category-form__toggle-info">
                    <span className="category-form__toggle-label">Costo de Venta (COGS)</span>
                    <span className="category-form__toggle-desc">¿Es un costo directo?</span>
                  </div>
                  <label className="category-form__switch">
                    <input
                      className="category-form__switch-input"
                      type="checkbox"
                      checked={isCogs}
                      onChange={(e) => setIsCogs(e.target.checked)}
                    />
                    <span className="category-form__switch-slider" />
                  </label>
                </div>

                <div className="category-form__toggle-card">
                  <div className="category-form__toggle-info">
                    <span className="category-form__toggle-label">Costo Variable</span>
                    <span className="category-form__toggle-desc">¿Depende del volumen?</span>
                  </div>
                  <label className="category-form__switch">
                    <input
                      className="category-form__switch-input"
                      type="checkbox"
                      checked={isVariable}
                      onChange={(e) => setIsVariable(e.target.checked)}
                    />
                    <span className="category-form__switch-slider" />
                  </label>
                </div>
              </div>

              <div className="category-form__toggle-card">
              <div className="category-form__toggle-info">
                <span className="category-form__toggle-label">Costo Directo</span>
                <span className="category-form__toggle-desc">
                  {isDirectCost
                    ? 'Compra directa del producto para reventa (ej: comprar iPhone para venderlo)'
                    : 'Costo indirecto / materia prima para producir otro producto (ej: harina para hacer pan)'}
                </span>
              </div>
              <label className="category-form__switch">
                <input
                  className="category-form__switch-input"
                  type="checkbox"
                  checked={isDirectCost}
                  onChange={(e) => setIsDirectCost(e.target.checked)}
                />
                <span className="category-form__switch-slider" />
              </label>
            </div>
            </>
          )}

          {!hideFooter && (
            <div className="category-form__footer">
              <Button variant="outline" size="lg" fullWidth onClick={onCancel} type="button" disabled={loading}>
                Cancelar
              </Button>
              <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
