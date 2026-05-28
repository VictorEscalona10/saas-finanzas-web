// src/modules/finance/presentation/components/sections/Functions.tsx
"use client";

import "./Sections.css";

// Definición de las funciones con sus iconos SVG premium en lugar de emojis
const funciones = [
  {
    id: "analisis",
    title: "Análisis en Tiempo Real",
    description: "Visualiza tus inversiones con gráficos interactivos avanzados y datos de mercado actualizados al segundo de forma ultrafluida.",
    color: "cyan",
    isLarge: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 7.5L13.5 12.5L9.5 8.5L4.5 13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18.5" cy="7.5" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "automatizacion",
    title: "Automatización",
    description: "Configura reglas inteligentes basadas en IA para rebalancear tu cartera de inversiones automáticamente.",
    color: "emerald",
    isLarge: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="15" cy="16" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad Bancaria",
    description: "Cifrado de extremo a extremo de grado militar y autenticación biométrica multinivel.",
    color: "purple",
    isLarge: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="11" width="14" height="10" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "multiplataforma",
    title: "Multiplataforma",
    description: "Accede de manera segura desde cualquier smartphone, tablet o computadora con sincronización en la nube al instante.",
    color: "cyan",
    isLarge: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 15V18H12V15" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <rect x="16" y="8" width="6" height="10" rx="1.5" fill="var(--deep-space)" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: "predicciones",
    title: "Predicciones de Mercado con IA",
    description: "Nuestros algoritmos predictivos escanean patrones de comportamiento históricos para anticipar tendencias macroeconómicas con gran precisión.",
    color: "emerald",
    isLarge: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
        <path d="M18 10L14.5 6.5L10.5 10.5L6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 6H18V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17C6 14 10 18 14 15 C 18 12, 20 13, 22 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "soporte",
    title: "Soporte Experto 24/7",
    description: "Disponibilidad completa de asesores financieros certificados y asistentes de IA integrados.",
    color: "purple",
    isLarge: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21.0034 12.8198 20.6951 14.1219 20.1 15.3C19.3937 16.7037 18.322 17.876 17 18.7C15.678 19.524 14.1558 19.9615 12.6 19.9688C11.1442 19.9754 9.70428 19.5842 8.44 18.83L3 20.6L4.77 15.24C4.01582 13.9757 3.62464 12.5358 3.63125 11.08C3.63847 9.52422 4.07599 8.00201 4.9 6.68C5.72401 5.35799 6.89627 4.28628 8.3 3.58C9.47813 2.98492 10.7802 2.67663 12.1 2.68C13.2669 2.68069 14.4224 2.91038 15.5 3.355C16.852 3.91406 18.0465 4.81432 18.963 5.965C19.8795 7.11568 20.4852 8.47353 20.72 9.905C20.9066 10.4287 20.9984 10.963 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function Functions() {
  return (
    <section id="funciones" className="funciones-section">
      <div className="section-container">
        <div className="section-header reveal-on-scroll">
          <span className="section-badge">Funciones</span>
          <h2 className="section-title">
            Potentes herramientas para{" "}
            <span className="gradient-text">invertir mejor</span>
          </h2>
          <p className="section-description">
            Todo lo que necesitas para gestionar, auditar y expandir tu cartera de inversiones con analíticas de nivel institucional.
          </p>
        </div>

        {/* Bento Grid Asimétrico */}
        <div className="funciones-grid">
          {funciones.map((funcion, index) => (
            <div
              key={funcion.title}
              className={`funcion-card funcion-card-${funcion.color} ${funcion.isLarge ? "bento-large" : ""} reveal-on-scroll`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="funcion-svg-container">
                {funcion.icon}
              </div>
              <div className="funcion-content">
                <h3 className="funcion-title">{funcion.title}</h3>
                <p className="funcion-description">{funcion.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}