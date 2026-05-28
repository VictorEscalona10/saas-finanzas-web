// src/modules/finance/presentation/components/auth/GoogleButton.tsx
'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';

interface GoogleButtonProps {
  onClick: () => Promise<void> | void;
  isLoading: boolean;
  text?: string;
}

export default function GoogleButton({ onClick, isLoading, text = 'Continuar con Google' }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="google-button"
      disabled={isLoading}
    >
      <FcGoogle size={22} />
      <span>{text}</span>
    </button>
  );
}
