// src/modules/finance/presentation/components/sections/Plans.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import "./Sections.css";

const plans = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    priceAnnual: 23,
    period: "/mes",
    description: "Perfecto para empezar en el mundo de las inversiones y finanzas personales.",
    features: [
      "Dashboard básico de rendimiento",
      "Hasta 5 cuentas financieras vinculadas",
      "Soporte rápido por correo electrónico",
      "Reportes de rendimiento mensuales",
      "Acceso a la app multiplataforma"
    ],
    featured: false,
    color: "cyan",
  },
  {
    id: "professional",
    name: "Professional",
    priceMonthly: 99,
    priceAnnual: 79,
    period: "/mes",
    description: "Para inversores serios y profesionales que buscan potenciar sus resultados.",
    features: [
      "Dashboard analítico avanzado",
      "Cuentas financieras ilimitadas",
      "Soporte prioritario 24/7",
      "Reportes interactivos en tiempo real",
      "Análisis predictivo impulsado por IA",
      "Acceso completo a la API para desarrolladores"
    ],
    featured: true,
    color: "emerald",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: "Personalizado",
    priceAnnual: "Personalizado",
    period: "",
    description: "Solución robusta para fondos de inversión, instituciones y corporaciones.",
    features: [
      "Todo lo incluido en Professional",
      "Infraestructura en la nube dedicada",
      "Garantía de disponibilidad (SLA 99.9%)",
      "Consultoría financiera y técnica",
      "Proceso de onboarding para equipos",
      "Solución de marca blanca disponible"
    ],
    featured: false,
    color: "purple",
  },
];

export default function Plans() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="planes" className="planes-section">
      <div className="section-container">
        <div className="section-header reveal-on-scroll">
          <span className="section-badge">Precios</span>
          <h2 className="section-title">
            Elige el plan que <span className="gradient-text">impulse tu futuro</span>
          </h2>
          <p className="section-description">
            Planes flexibles con precios transparentes sin cargos ocultos. Cambia o cancela tu plan en cualquier momento.
          </p>
        </div>

        {/* Toggle de facturación interactivo */}
        <div className="billing-toggle-container reveal-on-scroll">
          <span 
            className={`billing-label ${!isAnnual ? "active" : ""}`}
            onClick={() => setIsAnnual(false)}
          >
            Facturación Mensual
          </span>
          <button 
            className={`billing-toggle-btn ${isAnnual ? "annual" : ""}`}
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label="Toggle de facturación"
          >
            <span className="billing-toggle-dot"></span>
          </button>
          <span 
            className={`billing-label ${isAnnual ? "active" : ""}`}
            onClick={() => setIsAnnual(true)}
          >
            Facturación Anual
          </span>
          <span className="billing-discount-badge">Ahorra 20%</span>
        </div>

        <div className="planes-grid">
          {plans.map((plan, index) => {
            // Calcular precio dinámico
            let priceDisplay = "";
            let billingPeriod = plan.period;
            
            if (typeof plan.priceMonthly === "number") {
              priceDisplay = isAnnual ? `$${plan.priceAnnual}` : `$${plan.priceMonthly}`;
            } else {
              priceDisplay = plan.priceMonthly; // "Personalizado"
              billingPeriod = "";
            }

            return (
              <div
                key={plan.name}
                className={`plan-card ${plan.featured ? "plan-card-featured" : ""} reveal-on-scroll`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Aura y resplandor de fondo para la tarjeta destacada */}
                {plan.featured && (
                  <>
                    <div className="plan-badge">Más popular</div>
                    <div className="plan-featured-glow"></div>
                  </>
                )}
                
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <div className="plan-price-amount tech-mono">
                      {priceDisplay}
                      <span className="plan-price-period">{billingPeriod}</span>
                    </div>
                    {isAnnual && typeof plan.priceMonthly === "number" && (
                      <span className="plan-price-period tech-mono" style={{ fontSize: "0.75rem", color: "var(--emerald-fluid)", marginTop: "0.25rem" }}>
                        Cobrado anualmente (ahorras 20%)
                      </span>
                    )}
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                
                <div className="plan-features">
                  {plan.features.map((feature) => (
                    <div key={feature} className="plan-feature">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M20 6L9 17L4 12" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}