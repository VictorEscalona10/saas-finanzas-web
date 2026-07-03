'use client';

import { useRouter } from 'next/navigation';
import { useCompany } from '@/src/use-cases/company/useCompany';
import './CompanyDetail.css';

export default function CompanyDetail({ companyId }: { companyId: string }) {
  const router = useRouter();
  const { company, isLoading, error } = useCompany(companyId);

  if (isLoading) {
    return (
      <div className="company-detail">
        <div className="company-detail__loading">
          <div className="company-detail__spinner" />
          <p className="company-detail__loading-text">Cargando compañía...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-detail">
        <button className="company-detail__back" onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
        <div className="company-detail__error">
          <div className="company-detail__error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="company-detail__error-text">{error || 'Compañía no encontrada'}</p>
        </div>
      </div>
    );
  }

  const statusClass = company.isRemoved
    ? 'company-detail__card--removed'
    : company.isSuspended
      ? 'company-detail__card--suspended'
      : 'company-detail__card--active';

  const iconClass = company.isRemoved || company.isSuspended
    ? 'company-detail__icon--removed'
    : '';

  const statusLabel = company.isRemoved
    ? 'Eliminada'
    : company.isSuspended
      ? 'Suspendida'
      : 'Activa';

  const statusBadgeClass = company.isRemoved
    ? 'company-detail__badge--removed'
    : company.isSuspended
      ? 'company-detail__badge--suspended'
      : 'company-detail__badge--active';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="company-detail">
      <button className="company-detail__back" onClick={() => router.push('/companies')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Volver a compañías
      </button>

      <div className={`company-detail__card ${statusClass}`}>
        <div className="company-detail__banner">
          <div className="company-detail__banner-info">
            <div className={`company-detail__icon ${iconClass}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <h1 className="company-detail__name">{company.name}</h1>
            </div>
          </div>
          <span className={`company-detail__badge ${statusBadgeClass}`}>
            {statusLabel}
          </span>
        </div>

        <div className="company-detail__body">
          <div>
            <h2 className="company-detail__section-title">Información General</h2>
            <div className="company-detail__info-grid">
              <div className="company-detail__info-item">
                <span className="company-detail__info-label">ID</span>
                <span className="company-detail__info-value">{company.id}</span>
              </div>
              <div className="company-detail__info-item">
                <span className="company-detail__info-label">Estado</span>
                <span className="company-detail__info-value">{statusLabel}</span>
              </div>
              <div className="company-detail__info-item">
                <span className="company-detail__info-label">Fecha de creación</span>
                <span className="company-detail__info-value">{formatDate(company.createdAt)}</span>
              </div>
              <div className="company-detail__info-item">
                <span className="company-detail__info-label">Última actualización</span>
                <span className="company-detail__info-value">{formatDateTime(company.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
