// src/modules/finance/presentation/components/sections/Contact.tsx
"use client";

import { useState } from "react";
import "./Sections.css";

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación rápida
    if (!formData.name || !formData.email) {
      alert("Por favor, completa al menos tu nombre y correo electrónico.");
      return;
    }
    
    // Simular el envío del formulario
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      plan: "",
      message: ""
    });
    setIsSubmitted(false);
  };

  return (
    <section id="contacto" className="contacto-section">
      <div className="section-container">
        <div className="section-header reveal-on-scroll">
          <span className="section-badge">Contacto</span>
          <h2 className="section-title">
            ¿Listo para <span className="gradient-text">transformar tus finanzas?</span>
          </h2>
          <p className="section-description">
            Déjanos tus datos y un consultor financiero especializado se pondrá en contacto contigo a la brevedad.
          </p>
        </div>

        <div className="contacto-wrapper reveal-on-scroll">
          <div className="contacto-form-container">
            {isSubmitted ? (
              /* Tarjeta de Éxito al Enviar */
              <div className="form-success-card">
                <div className="success-icon-container">
                  <svg viewBox="0 0 24 24" fill="none" width="40" height="40" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>¡Mensaje Enviado!</h3>
                <p>Muchas gracias por comunicarte, <strong>{formData.name}</strong>. Un especialista te contactará en menos de 24 horas.</p>
                <button 
                  className="contacto-btn" 
                  onClick={handleReset}
                  style={{ marginTop: "2rem" }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              /* Formulario de Contacto Real */
              <form className="contacto-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nombre completo</label>
                    <input 
                      type="text" 
                      id="name" 
                      placeholder="Juan Pérez" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input 
                      type="email" 
                      id="email" 
                      placeholder="juan@ejemplo.com" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      placeholder="+56 9 1234 5678" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="plan">Plan de interés</label>
                    <select 
                      id="plan"
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    >
                      <option value="">Selecciona un plan</option>
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Mensaje</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    placeholder="Cuéntanos cómo podemos ayudarte a potenciar tus finanzas..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
                
                <button type="submit" className="contacto-btn">
                  Enviar mensaje
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
          
          {/* Tarjetas de Información de Contacto con SVGs Premium */}
          <div className="contacto-info">
            <div className="info-card">
              <div className="info-icon-container">
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-details">
                <h4>Email</h4>
                <p>hola@liquidglass.com</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon-container">
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92V19a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-details">
                <h4>Teléfono</h4>
                <p>+56 2 1234 5678</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon-container">
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-details">
                <h4>Oficina</h4>
                <p>Santiago, Chile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}