// src/modules/finance/presentation/components/auth/login/Login.tsx
'use client';

import React, { useState } from 'react';
import { AiOutlineCloseCircle, AiOutlineLoading } from 'react-icons/ai';
import AuthParticles from '../AuthParticles';
import GoogleButton from '../GoogleButton';
import FormInput from '../FormInput';
import '../Auth.css';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): boolean => {
    let error = '';

    if (name === 'email') {
      if (!value.trim()) {
        error = 'El correo electrónico es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Correo electrónico inválido';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'La contraseña es requerida';
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar campos como tocados
    const allTouched = { email: true, password: true };
    setTouched(allTouched);

    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);

    if (!isEmailValid || !isPasswordValid) {
      const firstError = document.querySelector('.input-error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Inicio de sesión exitoso:', formData);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error en login:', error);
      setErrors((prev) => ({ ...prev, submit: 'Correo o contraseña incorrectos. Intenta de nuevo.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    try {
      console.log('Iniciar sesión con Google');
    } catch (error) {
      console.error('Error en Google Sign In:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Partículas de fondo animadas montadas dinámicamente */}
      <AuthParticles />

      <div className="liquid-glass-card">
        <div className="card-header">
          <h1 className="title">Inicia Sesión</h1>
          <p className="subtitle">Continúa tu viaje financiero</p>
        </div>

        {/* Botón Google */}
        <GoogleButton onClick={handleGoogleSignIn} isLoading={isLoading} />

        {errors.submit && (
          <div className="submit-error negative-fluid-bg">
            <AiOutlineCloseCircle size={18} />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {/* Campo Correo */}
          <FormInput
            label="Correo Electrónico"
            id="email"
            name="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            disabled={isLoading}
            required
          />

          {/* Campo Contraseña */}
          <FormInput
            label="Contraseña"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            disabled={isLoading}
            required
          />

          {/* Botón Iniciar Sesión */}
          <button
            type="submit"
            className="submit-button positive-fluid-bg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <AiOutlineLoading className="spinner" size={20} />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Link a Registro */}
          <div className="login-link">
            <span className="neutral-text">¿No tienes una cuenta?</span>{' '}
            <a href="/register" className="link-accent">
              Regístrate aquí
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}