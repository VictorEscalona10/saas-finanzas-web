'use client';

import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import {
    AiOutlineEye,
    AiOutlineEyeInvisible,
    AiOutlineCheckCircle,
    AiOutlineCloseCircle,
    AiOutlineLoading
} from 'react-icons/ai';
import '../Auth.css';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [mounted, setMounted] = useState(false); // 👈 Estado para controlar montaje

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        color: ''
    });

    // 👈 Generar partículas solo en el cliente
    const [particles, setParticles] = useState<Array<{
        id: number;
        delay: string;
        duration: string;
        size: string;
        left: string;
    }>>([]);

    useEffect(() => {
        setMounted(true);
        // Generar partículas solo después de montar en cliente
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            delay: `${i * 0.5}s`,
            duration: `${10 + Math.random() * 20}s`,
            size: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`
        }));
        setParticles(newParticles);
    }, []);

    // Validación en tiempo real
    useEffect(() => {
        if (mounted) {
            validateField('password', formData.password);
            if (formData.confirmPassword) {
                validateField('confirmPassword', formData.confirmPassword);
            }
        }
    }, [formData.password, formData.confirmPassword, mounted]);

    const validateField = (name: string, value: any) => {
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
                } else {
                    // Calcular fortaleza de contraseña
                    let strength = 0;
                    if (value.length >= 8) strength++;
                    if (value.length >= 12) strength++;
                    if (/[A-Z]/.test(value)) strength++;
                    if (/[0-9]/.test(value)) strength++;
                    if (/[^A-Za-z0-9]/.test(value)) strength++;

                    const strengthMap = {
                        0: { score: 0, message: 'Muy débil', color: '#f43f5e' },
                        1: { score: 1, message: 'Débil', color: '#f97316' },
                        2: { score: 2, message: 'Media', color: '#eab308' },
                        3: { score: 3, message: 'Fuerte', color: '#22c55e' },
                        4: { score: 4, message: 'Muy fuerte', color: '#10b981' },
                        5: { score: 5, message: 'Excelente', color: '#06b6d4' }
                    };

                    // Forzamos a TypeScript a entender que el número resultante es una clave válida de strengthMap
                    setPasswordStrength(strengthMap[Math.min(strength, 5) as keyof typeof strengthMap]);

                    if (value.length < 6) {
                        error = 'Mínimo 6 caracteres';
                    } else if (value.length > 50) {
                        error = 'Máximo 50 caracteres';
                    }
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    error = 'Confirma tu contraseña';
                } else if (value !== formData.password) {
                    error = 'Las contraseñas no coinciden';
                }
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (touched[name]) {
            validateField(name, newValue);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const validateForm = () => {
        const fieldsToValidate = ['username', 'email', 'password', 'confirmPassword'];
        let isValid = true;

        fieldsToValidate.forEach(field => {
            const value = formData[field as keyof typeof formData];
            const isFieldValid = validateField(field, value);
            if (!isFieldValid) isValid = false;
        });

        if (!formData.acceptTerms) {
            setErrors(prev => ({ ...prev, acceptTerms: 'Debes aceptar los términos y condiciones' }));
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Marcar todos los campos como tocados
        const allTouched = {
            username: true,
            email: true,
            password: true,
            confirmPassword: true
        };
        setTouched(allTouched);

        if (!validateForm()) {
            // Scroll al primer error
            const firstError = document.querySelector('.input-error');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsLoading(true);

        // Simular llamada a API
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Formulario válido:', formData);

            // Aquí iría tu lógica de registro
            // const response = await fetch('/api/register', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData)
            // });

            // Redirigir o mostrar mensaje de éxito
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error en registro:', error);
            setErrors(prev => ({ ...prev, submit: 'Error al crear la cuenta. Intenta de nuevo.' }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            // Aquí iría la lógica de autenticación con Google
            console.log('Iniciar sesión con Google');
            // window.location.href = '/api/auth/google';
        } catch (error) {
            console.error('Error en Google Sign In:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrengthBar = () => {
        const width = (passwordStrength.score / 5) * 100;
        return (
            <div className="password-strength">
                <div className="strength-bar">
                    <div
                        className="strength-fill"
                        style={{
                            width: `${width}%`,
                            backgroundColor: passwordStrength.color,
                            opacity: formData.password ? 1 : 0
                        }}
                    />
                </div>
                {formData.password && (
                    <span className="strength-text" style={{ color: passwordStrength.color }}>
                        {passwordStrength.message}
                    </span>
                )}
            </div>
        );
    };

    // 👈 No renderizar las partículas hasta que esté montado en cliente
    const renderParticles = () => {
        if (!mounted) return null;

        return particles.map((particle) => (
            <div
                key={particle.id}
                className="particle"
                style={{
                    '--delay': particle.delay,
                    '--duration': particle.duration,
                    '--size': particle.size,
                    '--left': particle.left
                } as React.CSSProperties}
            />
        ));
    };

    return (
        <div className="register-container">
            {/* Partículas de fondo animadas - Solo en cliente */}
            {renderParticles()}

            <div className="liquid-glass-card">
                <div className="card-header">

                    <h1 className="title">Inicia Sesión</h1>
                    <p className="subtitle">Continúa tu viaje financiero</p>
                </div>

                {/* Botón Google */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="google-button"
                    disabled={isLoading}
                >
                    <FcGoogle size={22} />
                    <span>Continuar con Google</span>
                </button>

                {errors.submit && (
                    <div className="submit-error negative-fluid-bg">
                        <AiOutlineCloseCircle size={18} />
                        <span>{errors.submit}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form" noValidate>


                    {/* Campo Correo */}
                    <div className="input-group">
                        <label htmlFor="email" className="input-label">
                            Correo Electrónico
                            <span className="required-star">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`liquid-input ${errors.email && touched.email ? 'input-error' : ''} ${touched.email && !errors.email && formData.email ? 'input-success' : ''}`}
                                placeholder="usuario@ejemplo.com"
                                disabled={isLoading}
                            />
                            {touched.email && !errors.email && formData.email && (
                                <AiOutlineCheckCircle className="input-icon success" size={18} />
                            )}
                        </div>
                        {errors.email && touched.email && (
                            <span className="error-message negative-fluid">
                                <AiOutlineCloseCircle size={12} />
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div className="input-group">
                        <label htmlFor="password" className="input-label">
                            Contraseña
                            <span className="required-star">*</span>
                        </label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`liquid-input ${errors.password && touched.password ? 'input-error' : ''}`}
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                            </button>
                        </div>
                        
                    </div>



                    {/* Botón Login */}
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


                    {/* Link a Login */}
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