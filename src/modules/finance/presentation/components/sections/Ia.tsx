// components/sections/InteligenciaArtificial.tsx
"use client";

import "./Sections.css";

export default function Ia() {
  return (
    <section id="ia" className="ia-section">
      <div className="section-container">
        <div className="ia-wrapper reveal-on-scroll">
          <div className="ia-content">
            <span className="section-badge">Inteligencia Artificial</span>
            <h2 className="section-title">
              El poder de la IA al{" "}
              <span className="gradient-text">servicio de tus finanzas</span>
            </h2>
            <p className="section-description">
              Nuestros algoritmos de machine learning analizan millones de datos 
              en tiempo real para ofrecerte predicciones precisas y recomendaciones 
              personalizadas.
            </p>
            
            <div className="ia-features">
              <div className="ia-feature">
                <div className="ia-feature-icon">🎯</div>
                <div>
                  <h4>Predicción con 94% de precisión</h4>
                  <p>Basado en análisis histórico y tendencias de mercado</p>
                </div>
              </div>
              <div className="ia-feature">
                <div className="ia-feature-icon">⚡</div>
                <div>
                  <h4>Análisis en milisegundos</h4>
                  <p>Procesamiento de datos ultra rápido</p>
                </div>
              </div>
              <div className="ia-feature">
                <div className="ia-feature-icon">🔄</div>
                <div>
                  <h4>Aprendizaje continuo</h4>
                  <p>Modelos que mejoran con cada transacción</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="ia-visual">
            <div className="ia-graph">
              <div className="graph-node"></div>
              <div className="graph-node"></div>
              <div className="graph-node"></div>
              <div className="graph-node"></div>
              <div className="graph-line"></div>
              <div className="graph-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}