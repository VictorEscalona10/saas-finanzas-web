// src/modules/finance/presentation/components/auth/AuthParticles.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface Particle {
  id: number;
  delay: string;
  duration: string;
  size: string;
  left: string;
}

export default function AuthParticles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setMounted(true);
    // Generar partículas dinámicas únicamente en el cliente para evitar discrepancias de hidratación en Next.js
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: `${i * 0.5}s`,
      duration: `${10 + Math.random() * 20}s`,
      size: `${2 + Math.random() * 4}px`,
      left: `${Math.random() * 100}%`
    }));
    setParticles(generated);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {particles.map((particle) => (
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
      ))}
    </>
  );
}
