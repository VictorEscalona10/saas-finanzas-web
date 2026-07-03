'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyCompanies } from '@/src/use-cases/company/useMyCompanies';
import { useCreateCompany } from '@/src/use-cases/company/useCreateCompany';
import { useUpdateCompany } from '@/src/use-cases/company/useUpdateCompany';
import Modal from '@/src/components/shared/Modal/Modal';
import './CompaniesScreen.css';

export default function CompaniesScreen() {
  const { companies, isLoading, refetch } = useMyCompanies();
  const { createCompany, loading: creating } = useCreateCompany();
  const { updateCompany, loading: updating } = useUpdateCompany();

  const [editingCompany, setEditingCompany] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  const activeCompanyId = companies.find((c) => !c.isSuspended && !c.isRemoved)?.id;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    const company = await createCompany(createName.trim());
    if (company) {
      setCreateName('');
      setShowCreateModal(false);
      refetch();
    }
  };

  const handleEdit = (company: { id: string; name: string; createdAt: string; isSuspended: boolean; isRemoved: boolean }) => {
    setEditingCompany({ id: company.id, name: company.name });
    setEditName(company.name);
  };

  const handleEditSubmit = async () => {
    if (!editingCompany || !editName.trim()) return;
    const company = await updateCompany(editingCompany.id, editName.trim());
    if (company) {
      setEditingCompany(null);
      setEditName('');
      refetch();
    }
  };

  const handleDeleteClick = (company: { id: string; name: string }) => {
    setDeleteTargetId(company.id);
    setDeleteTargetName(company.name);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      refetch();
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isActive = (company: typeof companies[number]) =>
    company.id === activeCompanyId && !company.isSuspended && !company.isRemoved;

  return (
    <div className="companies-screen">
      <div className="companies-screen__header">
        <div className="companies-screen__header-content">
          <h1 className="companies-screen__title">Compañías</h1>
          <p className="companies-screen__subtitle">
            Gestiona tus empresas activas y configuraciones institucionales.
          </p>
        </div>
        <div className="companies-screen__header-actions">
          <button
            className="companies-screen__create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">add_circle</span>
            Nueva Compañía
          </button>

        </div>
      </div>

      {isLoading ? (
        <div className="companies-screen__grid" role="status" aria-label="Cargando compañías">
          {[1, 2, 3].map((i) => (
            <div key={i} className="companies-screen__skeleton-card">
              <div className="companies-screen__skeleton companies-screen__skeleton--title" />
              <div className="companies-screen__skeleton companies-screen__skeleton--date" />
              <div className="companies-screen__skeleton-actions">
                <div className="companies-screen__skeleton companies-screen__skeleton--badge" />
                <div className="companies-screen__skeleton companies-screen__skeleton--icon" />
              </div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="companies-screen__empty">
          <div className="companies-screen__empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="companies-screen__empty-title">No hay compañías registradas</h2>
          <p className="companies-screen__empty-text">
            Crea tu primera compañía para comenzar a gestionar tus finanzas.
          </p>
        </div>
      ) : (
        <div className="companies-screen__grid">
          {companies.map((company) => {
            const active = isActive(company);
            return (
              <article
                key={company.id}
                className={`companies-screen__card${active ? ' companies-screen__card--active' : ''}${company.isRemoved ? ' companies-screen__card--removed' : ''}`}
              >
                {active && (
                  <div className="companies-screen__card-check" aria-label="Compañía activa">
                    <span className="material-symbols-outlined">check</span>
                  </div>
                )}

                <Link href={`/${company.id}/dashboard`} className="companies-screen__card-body">
                  <h3 className="companies-screen__card-name">{company.name}</h3>
                  <p className="companies-screen__card-date">Creada: {formatDate(company.createdAt)}</p>
                </Link>

                <div className="companies-screen__card-footer">
                  {company.isRemoved ? (
                    <span className="companies-screen__card-badge companies-screen__card-badge--removed">
                      <span className="material-symbols-outlined" aria-hidden="true">delete_outline</span>
                      Eliminada
                    </span>
                  ) : (
                    <span className={`companies-screen__card-badge${company.isSuspended ? ' companies-screen__card-badge--suspended' : ' companies-screen__card-badge--active'}`}>
                      {company.isSuspended ? 'Suspendida' : 'Activa'}
                    </span>
                  )}

                  {!company.isRemoved && (
                    <div className="companies-screen__card-actions">
                      <button
                        className="companies-screen__card-action"
                        onClick={() => handleEdit(company)}
                        title="Editar"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                      </button>
                      <button
                        className="companies-screen__card-action companies-screen__card-action--danger"
                        onClick={() => handleDeleteClick(company)}
                        disabled={deleting}
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCreateName(''); }}
        title="Crear Compañía"
      >
        <form onSubmit={handleCreate} className="companies-screen__modal-form">
          <div className="companies-screen__field">
            <input
              id="create-company-name"
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="companies-screen__field-input"
              placeholder=" "
              autoFocus
              disabled={creating}
            />
            <label htmlFor="create-company-name" className="companies-screen__field-label">
              Nombre de la compañía
            </label>
          </div>
          <div className="companies-screen__modal-actions">
            <button
              type="button"
              className="companies-screen__modal-btn companies-screen__modal-btn--secondary"
              onClick={() => { setShowCreateModal(false); setCreateName(''); }}
              disabled={creating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="companies-screen__modal-btn companies-screen__modal-btn--primary"
              disabled={creating || !createName.trim()}
            >
              {creating ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editingCompany}
        onClose={() => { setEditingCompany(null); setEditName(''); }}
        title="Editar Compañía"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="companies-screen__modal-form">
          <div className="companies-screen__field">
            <input
              id="edit-company-name"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="companies-screen__field-input"
              placeholder=" "
              autoFocus
              disabled={updating}
            />
            <label htmlFor="edit-company-name" className="companies-screen__field-label">
              Nombre de la compañía
            </label>
          </div>
          <div className="companies-screen__modal-actions">
            <button
              type="button"
              className="companies-screen__modal-btn companies-screen__modal-btn--secondary"
              onClick={() => { setEditingCompany(null); setEditName(''); }}
              disabled={updating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="companies-screen__modal-btn companies-screen__modal-btn--primary"
              disabled={updating || !editName.trim()}
            >
              {updating ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); setDeleteTargetName(''); }}
        title="Eliminar Compañía"
      >
        <p className="companies-screen__confirm-text">
          ¿Estás seguro de eliminar <strong>{deleteTargetName}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div className="companies-screen__modal-actions">
          <button
            type="button"
            className="companies-screen__modal-btn companies-screen__modal-btn--secondary"
            onClick={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); setDeleteTargetName(''); }}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="companies-screen__modal-btn companies-screen__modal-btn--danger"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
