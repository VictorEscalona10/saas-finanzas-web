'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '@/src/use-cases/auth/useLogin';
import { createClient } from '@/src/infrastructure/supabase/browser';
import Button from '@/src/components/shared/Button';
import Input from '@/src/components/shared/Input';
import './LoginForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, fieldErrors } = useLogin();

  const handleGoogleLogin = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="login-page">
      <div className="login-page__form-panel">
        <div className="login-page__brand">
          <Link href="/" className="login-page__brand-link">
            <img src="/logo.png" alt="FinanzaVzla" className="login-page__brand-logo" />
          </Link>
        </div>

        <div className="login-page__welcome">
          <h1 className="login-page__title">Welcome Back</h1>
          <p className="login-page__subtitle">
            Manage your multi-currency business finances with precision.
          </p>
        </div>

        {error && (
          <div className="login-page__error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            <div>
              <strong>Suspended Account</strong>
              <p>Your access has been temporarily restricted. Please contact compliance@finanzavzla.com.</p>
            </div>
          </div>
        )}

        <form className="login-page__form" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <div className="login-page__password-group">
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              required
              autoComplete="current-password"
            />
            <Link href="/forgot-password" className="login-page__forgot">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Login
          </Button>
        </form>

        <div className="login-page__divider">
          <span className="login-page__divider-line" />
          <span className="login-page__divider-text">Or continue with</span>
          <span className="login-page__divider-line" />
        </div>

        <button type="button" className="login-page__google-btn" onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
            <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.65902 2 5.78802 4.0355 3.15302 7.3455Z" fill="#FF3D00" />
            <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.399 18 7.1905 16.3415 6.3585 14.027L3.0975 16.5395C5.1845 19.929 8.4865 22 12 22Z" fill="#4CAF50" />
            <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
          </svg>
          Sign in with Google
        </button>

        <p className="login-page__register">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="login-page__register-link">
            Register
          </Link>
        </p>
      </div>

      <aside className="login-page__info-panel">
        <div className="login-page__deco-lock">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(95,251,214,0.08)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="login-page__deco-shield">
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="rgba(95,251,214,0.08)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <div className="login-page__info-content">
          <h2 className="login-page__info-title">
            Total Precision in <span className="login-page__info-title--accent">USD & Bolívares.</span>
          </h2>
          <p className="login-page__info-desc">
            The institutional standard for Venezuelan financial operations, integrated with real-time BCV rates.
          </p>
        </div>

        <div className="login-page__dashboard-card">
          <div className="login-page__card-header">
            <div className="login-page__card-header-left">
              <div className="login-page__card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <span className="login-page__card-label">Current Balance</span>
            </div>
            <span className="login-page__bcv-badge">BCV: 36.52</span>
          </div>

          <div className="login-page__balances-grid">
            <div className="login-page__balance-col">
              <p className="login-page__balance-label">USD Vault</p>
              <h3 className="login-page__balance-value">$ 42,850.00</h3>
            </div>
            <div className="login-page__balance-col login-page__balance-col--bordered">
              <p className="login-page__balance-label">VES Equivalent</p>
              <h3 className="login-page__balance-value login-page__balance-value--local">Bs. 1,564,882.00</h3>
            </div>
          </div>

          <div className="login-page__monthly">
            <div className="login-page__monthly-header">
              <span className="login-page__monthly-label">Monthly Volume</span>
              <span className="login-page__monthly-change">+12.4%</span>
            </div>
            <div className="login-page__chart">
              <div className="login-page__chart-bar" style={{ height: '32%' }} />
              <div className="login-page__chart-bar" style={{ height: '48%' }} />
              <div className="login-page__chart-bar" style={{ height: '40%' }} />
              <div className="login-page__chart-bar login-page__chart-bar--active" style={{ height: '56%' }} />
              <div className="login-page__chart-bar login-page__chart-bar--active" style={{ height: '64%' }} />
              <div className="login-page__chart-bar login-page__chart-bar--active" style={{ height: '44%' }} />
              <div className="login-page__chart-bar" style={{ height: '36%' }} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
