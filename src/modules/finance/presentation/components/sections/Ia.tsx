// src/modules/finance/presentation/components/sections/Ia.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import "./Sections.css";

export default function Ia() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consoleMsg, setConsoleMsg] = useState("Presiona el botón de arriba para iniciar una auditoría inteligente.");
  const [isComplete, setIsComplete] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAudit = () => {
    if (isAuditing) return;
    
    setIsAuditing(true);
    setProgress(0);
    setIsComplete(false);
    setConsoleMsg("Conectando con el motor neural financiero...");
    
    let currentProgress = 0;
    
    timerRef.current = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      
      if (currentProgress < 25) {
        setConsoleMsg("Analizando correlaciones de mercado...");
      } else if (currentProgress < 50) {
        setConsoleMsg("Escaneando cartera vinculada (142,850.40 USD)...");
      } else if (currentProgress < 75) {
        setConsoleMsg("Calculando exposición al riesgo y volatilidad...");
      } else if (currentProgress < 95) {
        setConsoleMsg("Buscando oportunidades óptimas de rebalanceo...");
      } else if (currentProgress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        setProgress(100);
        setIsAuditing(false);
        setIsComplete(true);
        setConsoleMsg("Recomendación IA: Tu cartera presenta alta exposición tecnológica. Sugerimos rebalancear un 5% hacia commodities y un 3% a renta fija para mitigar el riesgo sistémico.");
      }
    }, 60);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
              Nuestros sofisticados modelos predictivos de Machine Learning escanean millones de puntos de datos económicos mundiales para ofrecerte auditorías precisas y sugerencias personalizadas en segundos.
            </p>
            
            <div className="ia-features">
              <div className="ia-feature">
                <div className="ia-feature-icon-container">🎯</div>
                <div>
                  <h4>Auditorías Predictivas Premium</h4>
                  <p>Obtén un informe exhaustivo del nivel de salud de tus finanzas con un 98.2% de precisión técnica.</p>
                </div>
              </div>
              <div className="ia-feature">
                <div className="ia-feature-icon-container">⚡</div>
                <div>
                  <h4>Procesamiento en Milisegundos</h4>
                  <p>Nuestra infraestructura distribuida analiza tendencias globales y calcula riesgos a velocidad de grado institucional.</p>
                </div>
              </div>
              <div className="ia-feature">
                <div className="ia-feature-icon-container">🔄</div>
                <div>
                  <h4>Modelado Dinámico Adaptativo</h4>
                  <p>Redes neuronales financieras que se recalibran continuamente según tus movimientos y la volatilidad real del mercado.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visual de Red Neuronal y Simulador IA */}
          <div className="ia-visual">
            <div className="ia-graph">
              {/* Mapa de red neural financiera con vectores SVG */}
              <svg className="ia-neural-svg" viewBox="0 0 400 380">
                {/* Conexiones fijas */}
                <line x1="200" y1="190" x2="80" y2="90" className="neural-line" />
                <line x1="200" y1="190" x2="320" y2="90" className="neural-line" />
                <line x1="200" y1="190" x2="100" y2="290" className="neural-line" />
                <line x1="200" y1="190" x2="300" y2="290" className="neural-line" />
                <line x1="80" y1="90" x2="320" y2="90" className="neural-line" style={{ opacity: 0.3 }} />
                <line x1="100" y1="290" x2="300" y2="290" className="neural-line" style={{ opacity: 0.3 }} />
                
                {/* Efectos de pulso en las conexiones cuando se audita */}
                {isAuditing && (
                  <>
                    <line x1="200" y1="190" x2="80" y2="90" className="neural-line-pulse" />
                    <line x1="200" y1="190" x2="320" y2="90" className="neural-line-pulse" />
                    <line x1="200" y1="190" x2="100" y2="290" className="neural-line-pulse" />
                    <line x1="200" y1="190" x2="300" y2="290" className="neural-line-pulse" />
                  </>
                )}
                
                {/* Nodos periféricos reactivos */}
                <circle cx="80" cy="90" r="7" className="neural-node" />
                <circle cx="320" cy="90" r="7" className="neural-node" />
                <circle cx="100" cy="290" r="7" className="neural-node" />
                <circle cx="300" cy="290" r="7" className="neural-node" />
                
                {/* Nodo Central (Motor Neural) */}
                <circle cx="200" cy="190" r="14" className="neural-center-node" />
                <circle cx="200" cy="190" r="24" fill="none" stroke="var(--purple-fluid)" strokeWidth="1" style={{ opacity: 0.5 }} />
              </svg>

              {/* Panel del Simulador Interactivo */}
              <div className="ia-simulation-card">
                <div className="ia-sim-header">
                  <div className="ia-sim-title">
                    <span className="ia-sim-dot"></span>
                    Simulador Auditoría IA
                  </div>
                  <button 
                    className="ia-sim-btn" 
                    onClick={startAudit}
                    disabled={isAuditing}
                  >
                    {isAuditing ? "Analizando..." : isComplete ? "Re-auditar" : "Iniciar Auditoría"}
                  </button>
                </div>
                
                <div className="ia-sim-body">
                  {/* Barra de Progreso */}
                  {(isAuditing || isComplete) && (
                    <div className="ia-progress-bar-container">
                      <div 
                        className="ia-progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Terminal de Consola */}
                  <div className={`ia-sim-console ${isAuditing ? "scanning" : ""}`}>
                    {consoleMsg}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}