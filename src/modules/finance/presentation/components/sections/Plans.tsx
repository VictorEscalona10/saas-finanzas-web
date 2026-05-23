// components/sections/Planes.tsx
"use client";

import Link from "next/link";
import "./Sections.css";

const planes = [
  {
    name: "Starter",
    price: "$29",
    period: "/mes",
    description: "Perfecto para empezar en el mundo de las inversiones",
    features: [
      "Dashboard básico",
      "5 cuentas financieras",
      "Soporte por email",
      "Reportes mensuales",
    ],
    featured: false,
    color: "cyan",
  },
  {
    name: "Professional",
    price: "$99",
    period: "/mes",
    description: "Para inversores serios que buscan resultados",
    features: [
      "Dashboard avanzado",
      "Cuentas ilimitadas",
      "Soporte prioritario 24/7",
      "Reportes en tiempo real",
      "Análisis predictivo IA",
      "API access",
    ],
    featured: true,
    color: "emerald",
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    period: "",
    description: "Para instituciones y grandes corporaciones",
    features: [
      "Todo lo de Professional",
      "Infraestructura dedicada",
      "SLA 99.9%",
      "Consultoría personalizada",
      "Team onboarding",
      "White label solution",
    ],
    featured: false,
    color: "purple",
  },
];

export default function Plans() {
  return (
    <section id="planes" className="planes-section">
      <div className="section-container">
        <div className="section-header reveal-on-scroll">
          <span className="section-badge">Planes</span>
          <h2 className="section-title">
            Elige el plan que <span className="gradient-text">impulse tu futuro</span>
          </h2>
          <p className="section-description">
            Precios transparentes sin sorpresas. Escala a medida que creces.
          </p>
        </div>

        <div className="planes-grid">
          {planes.map((plan, index) => (
            <div
              key={plan.name}
              className={`plan-card ${plan.featured ? "plan-card-featured" : ""} reveal-on-scroll`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.featured && (
                <div className="plan-badge">Más popular</div>
              )}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="plan-price-amount">{plan.price}</span>
                  <span className="plan-price-period">{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>
              
              <div className="plan-features">
                {plan.features.map((feature) => (
                  <div key={feature} className="plan-feature">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/register"
                className={`plan-btn plan-btn-${plan.color}`}
              >
                Comenzar ahora
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}