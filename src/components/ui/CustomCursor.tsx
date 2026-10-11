'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';

type CursorVariant = 'default' | 'hover' | 'text' | 'view' | 'down' | 'hidden';

interface CursorState {
  variant: CursorVariant;
  label: string;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, [data-cursor], label, summary';
const TEXT_SELECTOR = 'input[type="text"], input[type="number"], textarea, [contenteditable="true"]';

export const CustomCursor: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>({ variant: 'default', label: '' });
  const [isDown, setIsDown] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const ringX = useSpring(dotX, { stiffness: 350, damping: 28, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 28, mass: 0.6 });

  const glowX = useSpring(dotX, { stiffness: 120, damping: 22, mass: 1 });
  const glowY = useSpring(dotY, { stiffness: 120, damping: 22, mass: 1 });

  const lastSpawn = useRef(0);

  const getVariantFor = useCallback((target: EventTarget | null): CursorState => {
    if (!(target instanceof Element)) return { variant: 'default', label: '' };

    const cursorEl = target.closest('[data-cursor]') as HTMLElement | null;
    if (cursorEl) {
      const variant = (cursorEl.dataset.cursor as CursorVariant) || 'hover';
      return { variant, label: cursorEl.dataset.cursorLabel || '' };
    }

    const textEl = target.closest(TEXT_SELECTOR);
    if (textEl) return { variant: 'text', label: '' };

    const interactiveEl = target.closest(INTERACTIVE_SELECTOR);
    if (interactiveEl) {
      const label =
        (interactiveEl as HTMLElement).dataset.cursorLabel ||
        interactiveEl.getAttribute('aria-label') ||
        '';
      return { variant: 'hover', label: label.length <= 18 ? label : '' };
    }

    return { variant: 'default', label: '' };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    if (!finePointer || noHover || prefersReducedMotion) return;

    setEnabled(true);
    document.body.dataset.customCursor = 'true';

    const handleMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setState(getVariantFor(e.target));

      const now = performance.now();
      if (now - lastSpawn.current > 60) {
        lastSpawn.current = now;
        const id = now;
        setRipples((prev) => [...prev.slice(-8), { x: e.clientX, y: e.clientY, id }]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 700);
      }
    };

    const handleDown = (e: MouseEvent) => {
      setIsDown(true);
      const id = performance.now();
      setRipples((prev) => [...prev.slice(-8), { x: e.clientX, y: e.clientY, id }]);
      window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    };

    const handleUp = () => setIsDown(false);
    const handleLeave = () => setState({ variant: 'hidden', label: '' });
    const handleEnter = () => setState({ variant: 'default', label: '' });

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleLeave);
    document.documentElement.addEventListener('mouseenter', handleEnter);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
      document.documentElement.removeEventListener('mouseenter', handleEnter);
      delete document.body.dataset.customCursor;
    };
  }, [dotX, dotY, getVariantFor, prefersReducedMotion]);

  if (!enabled) return null;

  const { variant, label } = state;
  const isHover = variant === 'hover' || variant === 'view';
  const isText = variant === 'text';

  const ringSize = isHover ? 56 : isText ? 3 : 34;
  const ringBorder = isHover ? 1.5 : isText ? 0 : 1.5;
  const ringOpacity = variant === 'hidden' ? 0 : isHover ? 1 : 0.75;
  const ringRadius = isText ? 2 : 9999;

  const accent =
    variant === 'view'
      ? 'rgba(168, 85, 247, 0.9)'
      : isHover
      ? 'rgba(16, 185, 129, 0.95)'
      : 'rgba(16, 185, 129, 0.65)';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      aria-hidden="true"
      data-custom-cursor
    >
      <motion.div
        className="absolute top-0 left-0 rounded-full"
        style={{
          x: glowX,
          y: glowY,
          translateX: '-50%',
          translateY: '-50%',
          width: 320,
          height: 320,
          background:
            'radial-gradient(circle, rgba(16,185,129,0.10) 0%, rgba(6,182,212,0.06) 35%, transparent 70%)',
        }}
        animate={{ opacity: isHover ? 1 : 0.6, scale: isDown ? 0.85 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute top-0 left-0 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            translateX: '-50%',
            translateY: '-50%',
            border: '1px solid rgba(16,185,129,0.5)',
          }}
          initial={{ width: 8, height: 8, opacity: 0.6 }}
          animate={{ width: 64, height: 64, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: ringSize,
          height: ringSize,
          borderRadius: ringRadius,
          border: `${ringBorder}px solid ${accent}`,
          backdropFilter: isHover ? 'blur(2px)' : 'none',
          backgroundColor: isHover ? 'rgba(16,185,129,0.08)' : 'transparent',
          mixBlendMode: isText ? 'difference' : 'normal',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          borderRadius: ringRadius,
          opacity: ringOpacity,
          scale: isDown ? 0.82 : 1,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 26, mass: 0.7 }}
      >
        {label && isHover && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="whitespace-nowrap px-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300"
          >
            {label}
          </motion.span>
        )}
      </motion.div>

      <motion.div
        className="absolute top-0 left-0 rounded-full bg-emerald-400"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHover ? 0 : isText ? 0 : 6,
          height: isHover ? 0 : isText ? 0 : 6,
          opacity: variant === 'hidden' ? 0 : 1,
          scale: isDown ? 2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );
};