// src/modules/finance/presentation/components/auth/PasswordStrength.tsx
'use client';

import React from 'react';

interface PasswordStrengthProps {
  value: string;
}

export default function PasswordStrength({ value }: PasswordStrengthProps) {
  if (!value) return null;

  // Calcular fortaleza de la contraseña en tiempo real
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const strengthMap = {
    0: { message: 'Muy débil', color: '#f43f5e' },
    1: { message: 'Débil', color: '#f97316' },
    2: { message: 'Media', color: '#eab308' },
    3: { message: 'Fuerte', color: '#22c55e' },
    4: { message: 'Muy fuerte', color: '#10b981' },
    5: { message: 'Excelente', color: '#06b6d4' }
  };

  const strength = strengthMap[Math.min(score, 5) as keyof typeof strengthMap];
  const width = (score / 5) * 100;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${width}%`,
            backgroundColor: strength.color,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }}
        />
      </div>
      <span className="strength-text" style={{ color: strength.color }}>
        {strength.message}
      </span>
    </div>
  );
}
