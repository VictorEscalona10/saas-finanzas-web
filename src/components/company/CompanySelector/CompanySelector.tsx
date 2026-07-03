'use client';

import type { ReactNode } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@/src/components/shared/Button/Button';
import Badge from '@/src/components/shared/Badge/Badge';
import Modal from '@/src/components/shared/Modal/Modal';
import './CompanySelector.css';

export interface CompanySelectorCompany {
  id: string;
  name: string;
  createdAt: string;
  isSuspended: boolean;
  isRemoved: boolean;
}

export interface CompanySelectorProps {
  companies: CompanySelectorCompany[];
  activeCompanyId?: string;
  onSelectCompany: (companyId: string) => void;
  onCreateCompany: (name: string) => Promise<void>;
  onEditCompany: (company: CompanySelectorCompany) => void;
  onDeleteCompany: (companyId: string) => Promise<void>;
  isLoading?: boolean;
  trigger?: ReactNode;
  className?: string;
}

export default function CompanySelector({
  companies,
  activeCompanyId,
  onSelectCompany,
  onCreateCompany,
  onEditCompany,
  onDeleteCompany,
  isLoading = false,
  trigger,
  className = '',
}: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creatingError, setCreatingError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (companyId: string) => {
      onSelectCompany(companyId);
      setIsOpen(false);
    },
    [onSelectCompany]
  );

  const handleEdit = useCallback(
    (company: CompanySelectorCompany) => {
      onEditCompany(company);
      setIsOpen(false);
    },
    [onEditCompany]
  );

  const handleDeleteClick = useCallback(
    (companyId: string, companyName: string) => {
      setDeleteTargetId(companyId);
      setDeleteTargetName(companyName);
      setShowDeleteConfirm(true);
    },
    []
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargetId) return;
    setDeletingId(deleteTargetId);
    try {
      await onDeleteCompany(deleteTargetId);
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  }, [deleteTargetId, onDeleteCompany]);

  const handleCreateSubmit = useCallback(async () => {
    if (!newCompanyName.trim()) {
      setCreatingError('El nombre es obligatorio');
      return;
    }
    setCreatingError('');
    setIsCreating(true);
    try {
      await onCreateCompany(newCompanyName.trim());
      setNewCompanyName('');
      setIsCreating(false);
      setIsOpen(false);
    } catch (error) {
      setCreatingError(error instanceof Error ? error.message : 'Error al crear compañía');
      setIsCreating(false);
    }
  }, [newCompanyName, onCreateCompany]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatus = (company: CompanySelectorCompany): 'ACTIVA' | 'SUSPENDIDA' =>
    company.isSuspended ? 'SUSPENDIDA' : 'ACTIVA';

  const isActive = (company: CompanySelectorCompany): boolean =>
    !company.isSuspended && !company.isRemoved;

  const statusVariant = (status: 'ACTIVA' | 'SUSPENDIDA') => (status === 'ACTIVA' ? 'success' : 'danger');

  const statusLabel = (status: 'ACTIVA' | 'SUSPENDIDA') => (status === 'ACTIVA' ? 'Activa' : 'Suspendida');

  const triggerContent = trigger || (
    <button
      ref={triggerRef}
      className={`company-selector__trigger ${className}`}
      onClick={handleToggle}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <span className="company-selector__trigger-name">
        {activeCompany?.name || 'Seleccionar compañía'}
      </span>
      <svg className={`company-selector__trigger-chevron ${isOpen ? 'company-selector__trigger-chevron--open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );

  return (
    <div className={`company-selector ${isOpen ? 'company-selector--open' : ''}`} ref={dropdownRef}>
      <div className="company-selector__trigger-wrapper">{triggerContent}</div>

      {isOpen && (
        <div className="company-selector__dropdown" role="listbox" aria-label="Seleccionar compañía">
          <div className="company-selector__header">
            <h3 className="company-selector__title">Company Selector</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)} className="company-selector__add-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nueva Compañía
            </Button>
          </div>

          {isLoading ? (
            <div className="company-selector__loading" role="status" aria-label="Cargando compañías">
              <div className="company-selector__skeleton" />
              <div className="company-selector__skeleton" />
              <div className="company-selector__skeleton" />
            </div>
          ) : companies.length === 0 ? (
            <div className="company-selector__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p>No hay compañías registradas</p>
              <Button variant="primary" size="sm" onClick={() => setIsCreating(true)}>
                Crear primera compañía
              </Button>
            </div>
          ) : (
            <ul className="company-selector__list" role="listbox">
              {companies.map((company) => (
                <li key={company.id} className="company-selector__item" role="option" aria-selected={isActive(company)}>
                  <div className="company-selector__item-main">
                    <div className="company-selector__item-info">
                      <div className="company-selector__item-name">{company.name}</div>
                      <div className="company-selector__item-meta">
                        <span className="company-selector__item-date">Creada: {formatDate(company.createdAt)}</span>
                        <Badge variant={statusVariant(getStatus(company))} size="sm" dot>
                          {statusLabel(getStatus(company))}
                        </Badge>
                      </div>
                    </div>
                    <div className="company-selector__item-actions">
                      {isActive(company) ? (
                        <span className="company-selector__active-badge" aria-label="Compañía activa">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="3" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelect(company.id)}
                          className="company-selector__select-btn"
                        >
                          Seleccionar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(company)}
                        aria-label={`Editar ${company.name}`}
                        className="company-selector__icon-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(company.id, company.name)}
                        disabled={deletingId === company.id}
                        aria-label={`Eliminar ${company.name}`}
                        className="company-selector__icon-btn company-selector__icon-btn--danger"
                      >
                        {deletingId === company.id ? (
                          <span className="button__spinner" style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Modal
        open={isCreating}
        onClose={() => {
          setIsCreating(false);
          setNewCompanyName('');
          setCreatingError('');
        }}
        title="Crear Compañía"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateSubmit(); }} className="company-selector__create-form">
          <div className="company-selector__form-group">
            <label htmlFor="company-name" className="company-selector__form-label">
              Nombre de la compañía
            </label>
            <input
              id="company-name"
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="Ej: Mi Empresa S.A."
              className="company-selector__form-input"
              autoFocus
              disabled={isCreating}
              aria-invalid={!!creatingError}
              aria-describedby={creatingError ? 'company-name-error' : undefined}
            />
            {creatingError && (
              <p id="company-name-error" className="company-selector__form-error" role="alert">
                {creatingError}
              </p>
            )}
          </div>
          <div className="company-selector__form-actions">
            <Button type="button" variant="secondary" onClick={() => setIsCreating(false)} disabled={isCreating}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isCreating} fullWidth>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); setDeleteTargetName(''); }}
        title="Eliminar Compañía"
      >
        <p className="company-selector__confirm-text">
          ¿Estás seguro de eliminar <strong>{deleteTargetName}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div className="company-selector__confirm-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); setDeleteTargetName(''); }}
            disabled={deletingId !== null}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={deletingId !== null}
            onClick={handleDeleteConfirm}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}