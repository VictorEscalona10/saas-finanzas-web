'use client';

import { useEffect, useState } from 'react';

export type PresencePhase = 'entering' | 'entered' | 'exiting';

interface PresenceState {
  isVisible: boolean;
  phase: PresencePhase;
}

/**
 * Gestiona el ciclo de vida de un overlay (modal, drawer) sin llamar `setState`
 * síncronamente dentro de un `useEffect` (patrón prevOpen de React).
 *
 * Fases:
 * - `entering`: acaba de abrirse; se usa el estado inicial para que la animación
 *   de entrada (CSS transition) arranque desde la base al pasar a `entered`.
 * - `entered`: abierto y estable.
 * - `exiting`: cerrando; se vuelve al estado inicial para reproducir la salida y
 *   se desmonta tras `exitDuration` ms (setTimeout en callback asíncrono).
 *
 * Si `enterDuration <= 0`, no hay animación de entrada: la fase se resuelve a
 * `entered` directamente durante el render (sin effect).
 *
 * Los únicos setState permitidos: (a) en el cuerpo del render vía `prevOpen`, y
 * (b) dentro de callbacks (requestAnimationFrame/setTimeout), que no disparan
 * `react-hooks/set-state-in-effect`.
 */
export function usePresence(open: boolean, exitDuration: number, enterDuration = 0): PresenceState {
  const [isVisible, setIsVisible] = useState(open);
  const [phase, setPhase] = useState<PresencePhase>(open ? 'entered' : 'entering');
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsVisible(true);
      setPhase(enterDuration > 0 ? 'entering' : 'entered');
    } else {
      setPhase('exiting');
    }
  }

  // Entrada: pasar de 'entering' a 'entered' tras doble rAF para disparar la transición CSS
  const hasEnterAnimation = enterDuration > 0;
  useEffect(() => {
    if (!isVisible || !hasEnterAnimation || phase !== 'entering') return;

    let cancelled = false;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        if (!cancelled) setPhase('entered');
      });
      if (cancelled) cancelAnimationFrame(raf2);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
    };
  }, [isVisible, hasEnterAnimation, phase]);

  // Salida: desmontar tras la animación
  useEffect(() => {
    if (!isVisible || phase !== 'exiting') return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, exitDuration);
    return () => clearTimeout(timer);
  }, [isVisible, phase, exitDuration]);

  return { isVisible, phase };
}
