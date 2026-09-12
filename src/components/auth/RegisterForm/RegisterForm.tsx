'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/src/use-cases/auth/useRegister';
import { createClient } from '@/src/infrastructure/supabase/browser';
import Button from '@/src/components/shared/Button';
import Input from '@/src/components/shared/Input';
import './RegisterForm.css';

export default function RegisterForm() {
  const handleGoogleRegister = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const { register, loading, error, fieldErrors, confirmEmail, registeredEmail } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ name, email, password, repeat_password: repeatPassword });
  };

  if (confirmEmail) {
    return (
      <div className="register-page">
        <div className="register-page__form-panel register-page__form-panel--centered">
          <div className="register-page__brand">
            <img src="/logo.png" alt="FinanzaVzla" width="28" height="28" className="register-page__brand-logo" />
            <span className="register-page__brand-name">FinanzaVzla</span>
          </div>
          <p className="register-page__subtitle">
            Hemos enviado un enlace de confirmación a <strong>{registeredEmail}</strong>.
          </p>
          <div className="register-page__confirm-email">
            Accede a tu correo para verificar tu usuario
          </div>
          <p className="register-page__login">
            ¿Ya verificaste?{' '}
            <Link href="/login" className="register-page__login-link">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-page__form-panel">
        <div className="register-page__brand">
          <Link href="/">
            <img src="/logo.png" alt="FinanzaVzla" width="28" height="28" className="register-page__brand-logo" />
          </Link>
        </div>

        <div className="register-page__welcome">
          <h1 className="register-page__title">Crea tu cuenta</h1>
          <p className="register-page__subtitle">
            Gestiona USD y VES con precisión institucional.
          </p>
        </div>

        {error && <div className="register-page__error">{error}</div>}

        <form className="register-page__form" onSubmit={handleSubmit}>
          <Input
            label="Nombre completo"
            type="text"
            placeholder="Ej. Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
            autoComplete="name"
          />

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
          />

          <Input
            label="Repetir contraseña"
            type="password"
            placeholder="••••••••"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            error={fieldErrors.repeat_password}
            required
            autoComplete="new-password"
          />

          <label className="register-page__terms">
            <input type="checkbox" className="register-page__terms-checkbox" required />
            <span className="register-page__terms-text">
              Acepto los{' '}
              <a href="#" className="register-page__terms-link">términos y condiciones</a>.
            </span>
          </label>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Crear cuenta
          </Button>
        </form>

        <div className="register-page__divider">
          <span className="register-page__divider-line" />
          <span className="register-page__divider-text">o continuar con</span>
          <span className="register-page__divider-line" />
        </div>

        <button type="button" className="register-page__google-btn" onClick={handleGoogleRegister}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
            <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.65902 2 5.78802 4.0355 3.15302 7.3455Z" fill="#FF3D00" />
            <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.399 18 7.1905 16.3415 6.3585 14.027L3.0975 16.5395C5.1845 19.929 8.4865 22 12 22Z" fill="#4CAF50" />
            <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
          </svg>
          Registrarse con Google
        </button>

        <p className="register-page__login">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="register-page__login-link">
            Iniciar sesión
          </Link>
        </p>
      </div>

      <aside className="register-page__info-panel">
        <div className="register-page__deco-building">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(100,255,218,0.06)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
          </svg>
        </div>
        <div className="register-page__deco-brand">
          <span>V</span>
        </div>

        <div className="register-page__info-content">
          <h2 className="register-page__info-title">
            Crecimiento <span className="register-page__info-title--accent">Sin Fronteras.</span>
          </h2>
          <p className="register-page__info-desc">
            La infraestructura financiera para las empresas más exigentes de la región.
          </p>
        </div>

        <div className="register-page__dashboard-card">
          <div className="register-page__card-header">
            <div className="register-page__card-header-left">
              <div className="register-page__card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <span className="register-page__card-label">Volumen de Transacciones</span>
            </div>
            <span className="register-page__card-badge">ANUAL: +42.8%</span>
          </div>

          <div className="register-page__chart">
            <svg className="register-page__chart-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#64ffda" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#64ffda" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q50,75 80,60 T150,55 T220,30 T300,35 T400,10" fill="none" stroke="#64ffda" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0,80 Q50,75 80,60 T150,55 T220,30 T300,35 T400,10 L400,100 L0,100 Z" fill="url(#chartGrad)" />
            </svg>
            <div className="register-page__chart-dot" />
          </div>

          <div className="register-page__metrics">
            <div className="register-page__metric-card">
              <p className="register-page__metric-label">Entidades Activas</p>
              <div className="register-page__metric-value-row">
                <h3 className="register-page__metric-value">1,240</h3>
                <span className="register-page__metric-change">+12%</span>
              </div>
            </div>
            <div className="register-page__metric-card">
              <p className="register-page__metric-label">Cumplimiento Verificado</p>
              <div className="register-page__metric-value-row">
                <h3 className="register-page__metric-value">100%</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="register-page__card-footer">
            <div className="register-page__card-footer-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Cifrado Bancario</span>
            </div>
            <div className="register-page__card-footer-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
              <span>Cloud Native</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
