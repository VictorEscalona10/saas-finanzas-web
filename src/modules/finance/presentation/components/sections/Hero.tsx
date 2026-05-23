// components/sections/Hero.tsx
"use client";

import Link from "next/link";
import "./Sections.css";

export default function Hero() {
  return (
    <section id="inicio" className="hero-section reveal-on-scroll">
      <div className="hero-gradient-bg"></div>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Finanzas Personal Proximamente
          </div>
          
          <h1 className="hero-title">
            Gestiona tus finanzas con
            <span className="hero-title-gradient"> Inteligencia Líquida</span>
          </h1>
          
          <p className="hero-description">
            La plataforma premium que combina análisis financiero avanzado, 
            inteligencia artificial y diseño de vidrio líquido para una experiencia 
            de inversión sin precedentes.
          </p>
          
          <div className="hero-buttons">
            <Link href="/register" className="hero-btn-primary">
              Comenzar ahora
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
            <Link href="#planes" className="hero-btn-secondary">
              Ver planes
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">$50B+</div>
              <div className="hero-stat-label">Transacciones procesadas</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">98%</div>
              <div className="hero-stat-label">Clientes satisfechos</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">24/7</div>
              <div className="hero-stat-label">Soporte IA</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-glass-card">
            <div className="hero-glass-glow"></div>
            <div className="hero-chart">
              <div className="chart-line"></div>
              <div className="chart-bars">
                <div className="chart-bar" style={{ height: "60%" }}></div>
                <div className="chart-bar" style={{ height: "80%" }}></div>
                <div className="chart-bar" style={{ height: "45%" }}></div>
                <div className="chart-bar" style={{ height: "90%" }}></div>
                <div className="chart-bar" style={{ height: "70%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}