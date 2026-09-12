'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './landing.css';

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('landing-reveal--visible');
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="landing-reveal">{children}</div>;
}

export default function Home() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const prices = {
    monthly: { basic: '$49', suffix: '/mes', pro: '$199', enterprise: 'Custom' },
    annual: { basic: '$470', suffix: '/año', pro: '$1,910', enterprise: 'Custom' },
  } as const;

  const p = prices[billing];

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <div className="landing-nav__brand">
            <Link href="/">
              <img src="/logo.png" alt="FinanzaVzla" className="landing-nav__logo-img" />
            </Link>
          </div>
          <nav className="landing-nav__links">
            <a className="landing-nav__link landing-nav__link--active" href="#features">Funcionalidades</a>
            <a className="landing-nav__link" href="#ia">IA Integrada</a>
            <a className="landing-nav__link" href="#pricing">Precios</a>
            <a className="landing-nav__link" href="#support">Soporte</a>
          </nav>
          <div className="landing-nav__actions">
            <Link className="landing-nav__login" href="/login">Login</Link>
            <Link className="landing-nav__cta" href="/register">Acceder a tu cuenta</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="landing-hero" id="hero">
          <div className="landing-hero__glow" />
          <div className="landing-hero__grid">
            <div className="landing-hero__left">
              <div className="landing-hero__pill">
                <svg className="landing-hero__pill-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="landing-hero__pill-text">Seguridad de Nivel Institucional</span>
              </div>
              <h1 className="landing-hero__title">
                Tu capital merece una <span className="landing-hero__title--accent">Bóveda Digital</span> impenetrable.
              </h1>
              <p className="landing-hero__desc">
                FinanzaVzla gestiona tus activos financieros con cifrado avanzado y análisis predictivo en tiempo real. La infraestructura preferida por fondos de cobertura y bancos privados.
              </p>
              <div className="landing-hero__actions">
                <Link className="landing-hero__btn-primary" href="/register">
                  Empezar ahora
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <a className="landing-hero__btn-secondary" href="#">Agendar Demo</a>
              </div>
            </div>

            <div className="landing-hero__right">
              <div className="landing-chart-card">
                <div className="landing-chart__header">
                  <div className="landing-chart__header-left">
                    <div className="landing-chart__icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <span className="landing-chart__label">Portfolio en Vivo</span>
                  </div>
                  <span className="landing-chart__badge">USD/VES: 36.52</span>
                </div>

                <div className="landing-chart__svg-wrap">
                  <svg className="landing-chart__svg" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,85 Q30,70 60,75 T120,50 T180,55 T240,25 T300,30 T400,8" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0,85 Q30,70 60,75 T120,50 T180,55 T240,25 T300,30 T400,8 L400,100 L0,100 Z" fill="url(#heroChartGrad)" />
                  </svg>
                  <div className="landing-chart__dot" />
                </div>

                <div className="landing-chart__balances">
                  <div className="landing-chart__balance">
                    <p className="landing-chart__balance-label">USD Vault</p>
                    <h3 className="landing-chart__balance-value">$ 42,850.00</h3>
                  </div>
                  <div className="landing-chart__balance landing-chart__balance--bordered">
                    <p className="landing-chart__balance-label">VES Equivalent</p>
                    <h3 className="landing-chart__balance-value landing-chart__balance-value--accent">Bs. 1,564,882.00</h3>
                  </div>
                </div>

                <div className="landing-chart__volume">
                  <div className="landing-chart__volume-header">
                    <span className="landing-chart__volume-label">Volumen Mensual</span>
                    <span className="landing-chart__volume-change">+12.4%</span>
                  </div>
                  <div className="landing-chart__bars">
                    <div className="landing-chart__bar" style={{ height: '32%' }} />
                    <div className="landing-chart__bar" style={{ height: '48%' }} />
                    <div className="landing-chart__bar" style={{ height: '40%' }} />
                    <div className="landing-chart__bar landing-chart__bar--active" style={{ height: '56%' }} />
                    <div className="landing-chart__bar landing-chart__bar--active" style={{ height: '64%' }} />
                    <div className="landing-chart__bar landing-chart__bar--active" style={{ height: '44%' }} />
                    <div className="landing-chart__bar" style={{ height: '36%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <ScrollReveal>
          <section className="landing-features" id="features">
            <div className="landing-features__header">
              <h2 className="landing-features__title">Blindaje 360° para tu ecosistema</h2>
              <p className="landing-features__desc">
                Tecnología propietaria diseñada para mitigar riesgos sistémicos y operativos en mercados globales.
              </p>
            </div>
            <div className="landing-features__grid">
              <div className="landing-feature-card">
                <div className="landing-feature-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="landing-feature-card__title">Cifrado Avanzado</h3>
                <p className="landing-feature-card__desc">
                  Protocolos AES-512 con rotación dinámica de llaves. Tus datos son indescifrables incluso para hardware de próxima generación.
                </p>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className="landing-feature-card__title">Auditoría en Vivo</h3>
                <p className="landing-feature-card__desc">
                  Trazabilidad absoluta de cada transacción con logs inmutables protegidos por tecnología ledger distribuida.
                </p>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                  </svg>
                </div>
                <h3 className="landing-feature-card__title">API Unificada</h3>
                <p className="landing-feature-card__desc">
                  Integración fluida con SWIFT, redes blockchain y sistemas ERP tradicionales mediante una sola pasarela segura.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* IA Section */}
        <ScrollReveal>
          <section className="landing-ia" id="ia">
            <div className="landing-ia__inner">
              <div className="landing-ia__terminal">
                <div className="landing-ia__scanline" />
                <div className="landing-ia__terminal-content">
                  <div className="landing-ia__log landing-ia__log--active">
                    <div className="landing-ia__log-dot" />
                    <span className="landing-ia__log-text">DETECTANDO ANOMALÍA...</span>
                  </div>
                  <div className="landing-ia__log">
                    <div className="landing-ia__log-dot landing-ia__log-dot--dim" />
                    <span className="landing-ia__log-text landing-ia__log-text--dim">BLOQUEANDO IP: 192.168.1.104</span>
                  </div>
                  <div className="landing-ia__log">
                    <div className="landing-ia__log-dot landing-ia__log-dot--dim" />
                    <span className="landing-ia__log-text landing-ia__log-text--dim">REGLA DE CUMPLIMIENTO APLICADA</span>
                  </div>
                </div>
              </div>
              <div className="landing-ia__right">
                <h2 className="landing-ia__title">FinanzaVzla IA: Inteligencia que se anticipa</h2>
                <p className="landing-ia__desc">
                  Nuestra red neuronal entrena con billones de puntos de datos financieros para identificar patrones de fraude, lavado de activos y riesgos de mercado antes de que afecten tu liquidez.
                </p>
                <ul className="landing-ia__list">
                  <li className="landing-ia__list-item">
                    <svg className="landing-ia__list-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Prevención de Fraude en 0.2ms
                  </li>
                  <li className="landing-ia__list-item">
                    <svg className="landing-ia__list-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Scoring Crediticio Alternativo
                  </li>
                  <li className="landing-ia__list-item">
                    <svg className="landing-ia__list-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Optimización de Tesorería Predictiva
                  </li>
                </ul>
                <a className="landing-ia__link" href="#">Explorar documentación técnica</a>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Pricing */}
        <ScrollReveal>
          <section className="landing-pricing" id="pricing">
            <div className="landing-pricing__header">
              <h2 className="landing-pricing__title">Planes que escalan contigo</h2>
              <div className="landing-pricing__toggle">
                <button
                  className={`landing-pricing__toggle-btn ${billing === 'monthly' ? 'landing-pricing__toggle-btn--active' : ''}`}
                  onClick={() => setBilling('monthly')}
                >
                  Mensual
                </button>
                <button
                  className={`landing-pricing__toggle-btn ${billing === 'annual' ? 'landing-pricing__toggle-btn--active' : ''}`}
                  onClick={() => setBilling('annual')}
                >
                  Anual (-20%)
                </button>
              </div>
            </div>
            <div className="landing-pricing__grid">
              <div className="landing-pricing-card">
                <p className="landing-pricing-card__tier">Startups</p>
                <h3 className="landing-pricing-card__name">Básico</h3>
                <div className="landing-pricing-card__price">
                  {p.basic} <span className="landing-pricing-card__price-suffix">{p.suffix}</span>
                </div>
                <ul className="landing-pricing-card__features">
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon landing-pricing-card__feature-icon--dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Hasta 5 usuarios
                  </li>
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon landing-pricing-card__feature-icon--dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Cifrado Standard AES
                  </li>
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon landing-pricing-card__feature-icon--dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Soporte por Email
                  </li>
                </ul>
                <button className="landing-pricing-card__btn">Elegir Plan</button>
              </div>

              <div className="landing-pricing-card landing-pricing-card--featured">
                <div className="landing-pricing-card__badge">Recomendado</div>
                <p className="landing-pricing-card__tier landing-pricing-card__tier--highlight">Crecimiento</p>
                <h3 className="landing-pricing-card__name">Profesional</h3>
                <div className="landing-pricing-card__price">
                  {p.pro} <span className="landing-pricing-card__price-suffix">{p.suffix}</span>
                </div>
                <ul className="landing-pricing-card__features">
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Usuarios Ilimitados
                  </li>
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    IA de Prevención Antifraude
                  </li>
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Auditoría en Tiempo Real
                  </li>
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Soporte 24/7 Prioritario
                  </li>
                </ul>
                <Link className="landing-pricing-card__btn landing-pricing-card__btn--primary" href="/register">Empezar ahora</Link>
              </div>

              <div className="landing-pricing-card">
                <p className="landing-pricing-card__tier">Global</p>
                <h3 className="landing-pricing-card__name">Enterprise</h3>
                <div className="landing-pricing-card__price">
                  {p.enterprise}
                </div>
                <p className="landing-pricing-card__desc">
                  Soluciones a medida para bancos centrales e instituciones financieras sistémicas.
                </p>
                <ul className="landing-pricing-card__features">
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon landing-pricing-card__feature-icon--dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    SLA del 99.999%
                  </li>
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon landing-pricing-card__feature-icon--dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Despliegue On-Premise
                  </li>
                  <li className="landing-pricing-card__feature">
                    <svg className="landing-pricing-card__feature-icon landing-pricing-card__feature-icon--dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Gerente de Cuenta Dedicado
                  </li>
                </ul>
                <button className="landing-pricing-card__btn">Contactar Ventas</button>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Testimonial */}
        <ScrollReveal>
          <section className="landing-testimonial" id="support">
            <div className="landing-testimonial__inner">
              <div className="landing-testimonial__quote">
                <p className="landing-testimonial__text">
                  &ldquo;FinanzaVzla no es solo una herramienta, es la columna vertebral de nuestra gestión de tesorería global. La velocidad y seguridad son incomparables.&rdquo;
                </p>
                <div className="landing-testimonial__author">
                  <div className="landing-testimonial__avatar" />
                  <div>
                    <p className="landing-testimonial__name">Alexander Vance</p>
                    <p className="landing-testimonial__role">CTO, Capital Horizon</p>
                  </div>
                </div>
              </div>
              <div className="landing-testimonial__logos">
                <div className="landing-testimonial__logo">
                  <div className="landing-testimonial__logo-box landing-testimonial__logo-box--square" />
                  <span className="landing-testimonial__logo-name">MORGAN-V</span>
                </div>
                <div className="landing-testimonial__logo">
                  <div className="landing-testimonial__logo-box landing-testimonial__logo-box--rounded" />
                  <span className="landing-testimonial__logo-name">LUMINA</span>
                </div>
                <div className="landing-testimonial__logo">
                  <div className="landing-testimonial__logo-box landing-testimonial__logo-box--rotated" />
                  <span className="landing-testimonial__logo-name">QUANTUM</span>
                </div>
                <div className="landing-testimonial__logo">
                  <div className="landing-testimonial__logo-box" />
                  <span className="landing-testimonial__logo-name">SECURE-X</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__grid">
            <div>
              <div className="landing-footer__brand">
                <img src="/logo.png" alt="FinanzaVzla" className="landing-footer__brand-logo" />
                <span className="landing-footer__brand-name">FinanzaVzla</span>
              </div>
              <p className="landing-footer__brand-desc">
                Redefiniendo la custodia de activos digitales para la era de la computación avanzada.
              </p>
            </div>
            <div>
              <h4 className="landing-footer__col-title">Producto</h4>
              <ul className="landing-footer__links">
                <li><a className="landing-footer__link" href="#">Seguridad</a></li>
                <li><a className="landing-footer__link" href="#">IA Engine</a></li>
                <li><a className="landing-footer__link" href="#">Conectividad</a></li>
                <li><a className="landing-footer__link" href="#">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="landing-footer__col-title">Compañía</h4>
              <ul className="landing-footer__links">
                <li><a className="landing-footer__link" href="#">Sobre Nosotros</a></li>
                <li><a className="landing-footer__link" href="#">Carreras</a></li>
                <li><a className="landing-footer__link" href="#">Blog</a></li>
                <li><a className="landing-footer__link" href="#">Prensa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="landing-footer__col-title">Legal &amp; Compliance</h4>
              <ul className="landing-footer__links">
                <li><a className="landing-footer__link" href="#">Terms of Service</a></li>
                <li><a className="landing-footer__link" href="#">Privacy Policy</a></li>
                <li><a className="landing-footer__link" href="#">Compliance</a></li>
                <li><a className="landing-footer__link" href="#">GDPR Summary</a></li>
              </ul>
            </div>
          </div>
          <div className="landing-footer__bottom">
            <p className="landing-footer__copy">
              &copy; 2024 FinanzaVzla. BCV USD/VES: 36.52. All rights reserved.
            </p>
            <span className="landing-footer__status">SISTEMA OPERATIVO: ONLINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
