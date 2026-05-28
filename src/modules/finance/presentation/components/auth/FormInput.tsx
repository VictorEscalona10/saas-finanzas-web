// src/modules/finance/presentation/components/auth/FormInput.tsx
'use client';

import React, { useState } from 'react';
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle
} from 'react-icons/ai';

interface FormInputProps {
  label: string;
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export default function FormInput({
  label,
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled = false,
  required = false
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  const hasError = touched && !!error;
  const isSuccess = touched && !error && !!value;

  const wrapperClass = isPassword ? 'password-wrapper' : 'input-wrapper';
  const inputClass = `liquid-input ${hasError ? 'input-error' : ''} ${isSuccess ? 'input-success' : ''}`;

  return (
    <div className="input-group">
      <label htmlFor={id} className="input-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      
      <div className={wrapperClass}>
        <input
          type={resolvedType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass}
          placeholder={placeholder}
          disabled={disabled}
        />
        
        {/* Toggle de visibilidad de contraseña si es de tipo password */}
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </button>
        )}

        {/* Icono de éxito para entradas correctas (excepto contraseñas) */}
        {!isPassword && isSuccess && (
          <AiOutlineCheckCircle className="input-icon success" size={18} />
        )}
      </div>

      {/* Mensaje de error de validación */}
      {hasError && (
        <span className="error-message negative-fluid">
          <AiOutlineCloseCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
}
