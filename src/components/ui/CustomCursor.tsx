import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';

type CursorVariant = 'default' | 'hover' | 'text' | 'hidden';

interface CursorState {
  variant: CursorVariant;
  label: string;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, [data-cursor], label, summary';
const TEXT_SELECTOR = 'input[type="text"], input[type="number"], textarea, [contenteditable="true"]';

/**
 * "Precision ring" cursor: an instant centre dot plus a spring-lagged outline
 * ring that expands over interactive targets and collapses to a caret over
 * text fields. Only cheap motion values move per frame; React state commits
 * only when the hover variant actually changes.
 */
export const CustomCursor: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(hover: none)').matches
    );
  });
  const [state, setState] = useState<CursorState>({ variant: 'default', label: '' });
  const [isDown, setIsDown] = useState(false);
  const [pulse, setPulse] = useState(0);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  // The ring trails the dot with a softer spring for a layered feel.
  const ringX = useSpring(dotX, { stiffness: 260, damping: 24, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 260, damping: 24, mass: 0.6 });

  const lastVariantKey = useRef('');

  const getVariantFor = useCallback((target: EventTarget | null): CursorState => {
    if (!(target instanceof Element)) return { variant: 'default', label: '' };

    const cursorEl = target.closest('[data-cursor]') as HTMLElement | null;
    if (cursorEl) {
      const variant = (cursorEl.dataset.cursor as CursorVariant) || 'hover';
      return { variant, label: cursorEl.dataset.cursorLabel || '' };
    }

    if (target.closest(TEXT_SELECTOR)) return { variant: 'text', label: '' };

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
    if (!enabled || prefersReducedMotion) return;

    document.body.dataset.customCursor = 'true';

    const handleMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);

      const next = getVariantFor(e.target);
      const key = `${next.variant}|${next.label}`;
      if (key !== lastVariantKey.current) {
        lastVariantKey.current = key;
        setState(next);
      }
    };

    const handleDown = (e: MouseEvent) => {
      setIsDown(true);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setPulse((p) => p + 1);
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
  }, [enabled, dotX, dotY, getVariantFor, prefersReducedMotion]);

  if (!enabled || prefersReducedMotion) return null;

  const { variant, label } = state;
  const isHover = variant === 'hover';
  const isText = variant === 'text';
  const hidden = variant === 'hidden';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      aria-hidden="true"
    >
      {/* Spring-lagged outline ring */}
      <motion.div
        className="absolute top-0 left-0 rounded-full border-[1.5px]"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%', borderColor: 'var(--cursor-accent)' }}
        animate={{
          width: hidden ? 0 : isText ? 2 : isHover ? 52 : 28,
          height: hidden ? 0 : isText ? 22 : isHover ? 52 : 28,
          borderRadius: isText ? 1 : 9999,
          opacity: hidden ? 0 : isHover ? 1 : 0.75,
          scale: isDown ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.7 }}
      />

      {/* Click pulse — spawned only on mousedown */}
      <motion.div
        key={pulse}
        className="absolute top-0 left-0 rounded-full border"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%', borderColor: 'var(--cursor-accent)' }}
        initial={{ width: 8, height: 8, opacity: 0.55 }}
        animate={{ width: 56, height: 56, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Optional label chip */}
      {label && isHover && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 whitespace-nowrap px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          style={{
            x: ringX,
            y: ringY,
            translateX: '8px',
            translateY: '22px',
            background: 'var(--cursor-chip-bg)',
            color: 'var(--cursor-chip-text)',
          }}
        >
          {label}
        </motion.span>
      )}

      {/* Instant centre dot */}
      <motion.div
        className="absolute top-0 left-0 rounded-full"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%', background: 'var(--cursor-accent)' }}
        animate={{
          width: hidden || isHover || isText ? 0 : 5,
          height: hidden || isHover || isText ? 0 : 5,
          opacity: hidden ? 0 : 1,
          scale: isDown ? 1.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 520, damping: 30 }}
      />
    </div>
  );
};
