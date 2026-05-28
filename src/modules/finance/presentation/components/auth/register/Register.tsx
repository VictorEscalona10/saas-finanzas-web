// src/modules/finance/presentation/components/auth/register/Register.tsx
'use client';

import React, { useState } from 'react';
import { AiOutlineCloseCircle, AiOutlineLoading } from 'react-icons/ai';
import AuthParticles from '../AuthParticles';
import GoogleButton from '../GoogleButton';
import FormInput from '../FormInput';
import PasswordStrength from '../PasswordStrength';
import '../Auth.css';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: any): boolean => {
    let error = '';

    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = 'El nombre de usuario es requerido';
        } else if (value.length < 3) {
          error = 'Mínimo 3 caracteres';
        } else if (value.length > 20) {
          error = 'Máximo 20 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Solo letras, números y guión bajo';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Correo electrónico inválido';
        }
        break;

      case 'password':
        if (!value) {
          error = 'La contraseña es requerida';
        } else if (value.length < 6) {
          error = 'Mínimo 6 caracteres';
        } else if (value.length > 50) {
          error = 'Máximo 50 caracteres';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Confirma tu contraseña';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
        }
        break;

      case 'acceptTerms':
        if (!value) {
          error = 'Debes aceptar los términos y condiciones';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));

    if (touched[name]) {
      validateField(name, newValue);
    }
    
    // Si cambia la contraseña, revalidar confirmación para evitar desajustes
    if (name === 'password' && formData.confirmPassword) {
      setTimeout(() => {
        validateField('confirmPassword', formData.confirmPassword);
      }, 0);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateForm = (): boolean => {
    const isUsernameValid = validateField('username', formData.username);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);
    const isTermsValid = validateField('acceptTerms', formData.acceptTerms);

    return isUsernameValid && isEmailValid && isPasswordValid && isConfirmValid && isTermsValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allTouched = {
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true
    };
    setTouched(allTouched);

    if (!validateForm()) {
      const firstError = document.querySelector('.input-error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Formulario válido:', formData);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error en registro:', error);
      setErrors((prev) => ({ ...prev, submit: 'Error al crear la cuenta. Intenta de nuevo.' }));
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
          <h1 className="title">Crear Cuenta</h1>
          <p className="subtitle">Comienza tu viaje financiero</p>
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
          {/* Campo Usuario */}
          <FormInput
            label="Nombre de Usuario"
            id="username"
            name="username"
            type="text"
            placeholder="usuario_ejemplo"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            touched={touched.username}
            disabled={isLoading}
            required
          />

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
          <div className="input-group">
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
            {/* Barra medidora de fortaleza modular */}
            <PasswordStrength value={formData.password} />
          </div>

          {/* Campo Confirmar Contraseña */}
          <FormInput
            label="Confirmar Contraseña"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            disabled={isLoading}
            required
          />

          {/* Términos y Condiciones */}
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="liquid-checkbox"
                disabled={isLoading}
              />
              <span className="checkbox-text">
                Acepto los{' '}
                <a href="/terminos" className="link-accent" target="_blank">
                  Términos y Condiciones
                </a>{' '}
                y la{' '}
                <a href="/privacidad" className="link-accent" target="_blank">
                  Política de Privacidad
                </a>
                <span className="required-star">*</span>
              </span>
            </label>
            {errors.acceptTerms && touched.acceptTerms && (
              <span className="error-message negative-fluid">
                <AiOutlineCloseCircle size={12} />
                {errors.acceptTerms}
              </span>
            )}
          </div>

          {/* Botón Registrar */}
          <button
            type="submit"
            className="submit-button positive-fluid-bg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <AiOutlineLoading className="spinner" size={20} />
                <span>Creando cuenta...</span>
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>

          {/* Link a Login */}
          <div className="login-link">
            <span className="neutral-text">¿Ya tienes una cuenta?</span>{' '}
            <a href="/login" className="link-accent">
              Inicia sesión aquí
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}