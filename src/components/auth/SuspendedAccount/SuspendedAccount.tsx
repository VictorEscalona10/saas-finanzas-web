'use client';

import { useLogout } from '@/src/use-cases/auth/useLogout';
import './SuspendedAccount.css';

const DEFAULT_MESSAGE = 'Tu cuenta ha sido suspendida. No puedes acceder a la plataforma hasta que un administrador la reactive.';

const SUPPORT_EMAIL = 'soporte@finanzas.app';

interface SuspendedAccountProps {
  message?: string;
}

export default function SuspendedAccount({ message = DEFAULT_MESSAGE }: SuspendedAccountProps) {
  const { logout, loading } = useLogout();

  return (
    <div className="suspended-account">
      <div className="suspended-account__card">
        <div className="suspended-account__icon">
          <svg
            className="suspended-account__icon-svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        <h1 className="suspended-account__title">Cuenta Suspendida</h1>

        <p className="suspended-account__message">{message}</p>

        <p className="suspended-account__support">
          Si crees que esto es un error, contacta a{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="suspended-account__support-email">
            {SUPPORT_EMAIL}
          </a>
        </p>

        <div className="suspended-account__divider" />

        <button
          className="suspended-account__logout"
          onClick={logout}
          disabled={loading}
        >
          {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </button>
      </div>
    </div>
  );
}
