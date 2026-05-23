// components/sections/Funciones.tsx
"use client";

import "./Sections.css";

const funciones = [
  {
    icon: "📊",
    title: "Análisis en Tiempo Real",
    description: "Visualiza tus inversiones con gráficos interactivos y datos actualizados al segundo.",
    color: "cyan",
  },
  {
    icon: "🤖",
    title: "Automatización Inteligente",
    description: "Reglas automáticas basadas en IA para optimizar tu portfolio.",
    color: "emerald",
  },
  {
    icon: "🔒",
    title: "Seguridad Bancaria",
    description: "Cifrado de grado militar y autenticación biométrica.",
    color: "purple",
  },
  {
    icon: "📱",
    title: "Multiplataforma",
    description: "Accede desde cualquier dispositivo con sincronización en la nube.",
    color: "cyan",
  },
  {
    icon: "📈",
    title: "Predicciones IA",
    description: "Algoritmos predictivos para anticipar tendencias del mercado.",
    color: "emerald",
  },
  {
    icon: "💬",
    title: "Soporte 24/7",
    description: "Asistente virtual IA disponible en todo momento.",
    color: "purple",
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
            Todo lo que necesitas para tomar decisiones financieras inteligentes.
          </p>
        </div>

        <div className="funciones-grid">
          {funciones.map((funcion, index) => (
            <div
              key={funcion.title}
              className={`funcion-card funcion-card-${funcion.color} reveal-on-scroll`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="funcion-icon">{funcion.icon}</div>
              <h3 className="funcion-title">{funcion.title}</h3>
              <p className="funcion-description">{funcion.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}