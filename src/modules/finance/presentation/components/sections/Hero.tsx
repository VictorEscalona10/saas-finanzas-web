// src/modules/finance/presentation/components/sections/Hero.tsx
"use client";

import Link from "next/link";
import "./Sections.css";

export default function Hero() {
  return (
    <section id="inicio" className="hero-section reveal-on-scroll">
      {/* Luces y esferas líquidas 3D de fondo */}
      <div className="hero-gradient-bg"></div>
      <div className="float-glass-sphere sphere-1"></div>
      <div className="float-glass-sphere sphere-2"></div>
      <div className="float-glass-sphere sphere-3"></div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Finanzas Personales Pro
          </div>
          
          <h1 className="hero-title">
            Gestiona tus finanzas con
            <span className="hero-title-gradient"> Inteligencia Líquida</span>
          </h1>
          
          <p className="hero-description">
            La plataforma de finanzas premium que fusiona análisis predictivo avanzado, 
            inteligencia artificial de vanguardia y una interfaz de vidrio templado líquido 
            para una experiencia de inversión sin precedentes.
          </p>
          
          <div className="hero-buttons">
            <Link href="/register" className="hero-btn-primary">
              Comenzar ahora
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="#planes" className="hero-btn-secondary">
              Ver planes
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value tech-mono">$50B+</div>
              <div className="hero-stat-label">Procesado</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value tech-mono">98.4%</div>
              <div className="hero-stat-label">Satisfacción</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value tech-mono">24/7</div>
              <div className="hero-stat-label">Soporte IA</div>
            </div>
          </div>
        </div>
        
        {/* Mockup de Dashboard Financiero Interactivo Premium */}
        <div className="hero-visual">
          {/* Widget Flotante Superior Derecho: Recomendación de IA */}
          <div className="floating-widget widget-ia">
            <div className="widget-icon info">🤖</div>
            <div className="widget-details">
              <h5>Optimización IA</h5>
              <p>Recomendación: Comprar AAPL (+1.8%)</p>
            </div>
          </div>

          {/* Tarjeta Principal de Vidrio Líquido */}
          <div className="hero-glass-card">
            <div className="hero-glass-glow"></div>
            
            {/* Header del Mockup */}
            <div className="db-mockup-header">
              <div className="db-user-info">
                <div className="db-avatar">ER</div>
                <div className="db-meta">
                  <h4>Elena Rostova</h4>
                  <p>Inversora Premium</p>
                </div>
              </div>
              <div className="db-badge-active">
                <span className="db-badge-dot"></span>
                En Vivo
              </div>
            </div>

            {/* Balance del Portafolio */}
            <div className="db-balance-area">
              <div className="db-balance-label">Valor de Cartera</div>
              <div className="db-balance-val">
                <span className="db-balance-amount tech-mono">$142,850.40</span>
                <span className="db-balance-trend tech-mono">+12.4%</span>
              </div>
            </div>

            {/* Gráfico de Área Vectorial SVG */}
            <div className="db-chart-container">
              <svg className="db-svg-chart" viewBox="0 0 400 180">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#0b101d" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                
                {/* Cuadrícula de Fondo */}
                <line x1="0" y1="30" x2="400" y2="30" className="db-chart-grid-line" />
                <line x1="0" y1="80" x2="400" y2="80" className="db-chart-grid-line" />
                <line x1="0" y1="130" x2="400" y2="130" className="db-chart-grid-line" />
                
                {/* Path de Relleno del Área */}
                <path 
                  d="M0 130 C 50 110, 80 140, 130 90 C 180 40, 220 80, 270 50 C 320 20, 360 40, 400 15 L 400 180 L 0 180 Z" 
                  fill="url(#chartGlow)" 
                />
                
                {/* Línea del Gráfico */}
                <path 
                  d="M0 130 C 50 110, 80 140, 130 90 C 180 40, 220 80, 270 50 C 320 20, 360 40, 400 15" 
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  className="db-chart-path"
                  strokeDasharray="800"
                  strokeDashoffset="800"
                />

                {/* Nodos de Resalte */}
                <circle cx="130" cy="90" r="5" fill="#06b6d4" className="chart-dot-active" />
                <circle cx="270" cy="50" r="5" fill="#3b82f6" className="chart-dot-active" />
                <circle cx="400" cy="15" r="5" fill="#8b5cf6" className="chart-dot-active" />
              </svg>
            </div>
          </div>

          {/* Widget Flotante Inferior Izquierdo: Alerta de Transacción */}
          <div className="floating-widget widget-txn">
            <div className="widget-icon success">📈</div>
            <div className="widget-details">
              <h5>Adquisición Completa</h5>
              <p>15.4 ETH comprados exitosamente</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}