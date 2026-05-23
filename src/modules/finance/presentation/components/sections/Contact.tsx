// components/sections/Contacto.tsx
"use client";

import "./Sections.css";

export default function Contact() {
  return (
    <section id="contacto" className="contacto-section">
      <div className="section-container">
        <div className="section-header reveal-on-scroll">
          <span className="section-badge">Contacto</span>
          <h2 className="section-title">
            ¿Listo para{" "}
            <span className="gradient-text">transformar tus finanzas?</span>
          </h2>
          <p className="section-description">
            Déjanos tus datos y uno de nuestros asesores te contactará.
          </p>
        </div>

        <div className="contacto-wrapper reveal-on-scroll">
          <form className="contacto-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <input type="text" id="name" placeholder="Juan Pérez" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input type="email" id="email" placeholder="juan@ejemplo.com" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input type="tel" id="phone" placeholder="+56 9 1234 5678" />
              </div>
              <div className="form-group">
                <label htmlFor="plan">Plan de interés</label>
                <select id="plan">
                  <option value="">Selecciona un plan</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" rows={4} placeholder="Cuéntanos sobre tu proyecto..."></textarea>
            </div>
            
            <button type="submit" className="contacto-btn">
              Enviar mensaje
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </form>
          
          <div className="contacto-info">
            <div className="info-card">
              <div className="info-icon">📧</div>
              <h4>Email</h4>
              <p>hola@liquidglass.com</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📞</div>
              <h4>Teléfono</h4>
              <p>+56 2 1234 5678</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h4>Oficina</h4>
              <p>Santiago, Chile</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}