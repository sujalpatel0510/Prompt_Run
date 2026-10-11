import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  useSpring,
  useMotionValue,
  useReducedMotion,
  AnimatePresence,
  type MotionValue,
} from 'framer-motion';

type CursorVariant = 'default' | 'hover' | 'text' | 'hidden';

interface CursorState {
  variant: CursorVariant;
  label: string;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [role="link"], input, select, textarea, [data-cursor], label, summary';
const TEXT_SELECTOR = 'input[type="text"], input[type="number"], textarea, [contenteditable="true"]';

const MAX_LABEL = 22;
const TRAIL_LEVELS = 7;

function truncate(value: string, max = MAX_LABEL): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

/**
 * Wrapper that pins a child to a pointer position. Tracking (x/y motion
 * values) lives ONLY on this wrapper — children use plain CSS offsets, so
 * framer-motion transform aliases (x vs translateX) can never fight.
 */
const AtPointer: React.FC<{
  x: MotionValue<number>;
  y: MotionValue<number>;
  children: React.ReactNode;
}> = ({ x, y, children }) => (
  <motion.div
    className="absolute top-0 left-0"
    style={{ x, y, willChange: 'transform' }}
  >
    {children}
  </motion.div>
);

/**
 * One link in the comet-trail chain: springs toward the position in front of
 * it, shrinking and fading with depth so the trail reads as motion "behind"
 * the cursor. Pure motion values — zero re-renders while the pointer moves.
 */
const TrailDot: React.FC<{
  x: MotionValue<number>;
  y: MotionValue<number>;
  level: number;
}> = ({ x, y, level }) => {
  const stiffness = 340 - level * 36;
  const sx = useSpring(x, { stiffness, damping: 26, mass: 0.45 });
  const sy = useSpring(y, { stiffness, damping: 26, mass: 0.45 });

  const size = Math.max(2, 8 - level);
  const opacity = Math.max(0.06, 0.34 - level * 0.04);

  return (
    <>
      <AtPointer x={sx} y={sy}>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size,
            height: size,
            background: 'var(--cursor-accent)',
            opacity,
          }}
        />
      </AtPointer>
      {level + 1 < TRAIL_LEVELS && <TrailDot x={sx} y={sy} level={level + 1} />}
    </>
  );
};

/**
 * "Tooltip orb" cursor with a comet trail:
 * - The pointer core tracks the mouse instantly; 7 chained spring dots trail
 *   behind it, so sweeping the mouse leaves a visible fading comet animation.
 * - Hovering any interactive element morphs the core into a ring and springs a
 *   contextual tooltip chip in beside the real pointer (aria-label, element
 *   text, or a default like "Click" / "Type here").
 *
 * Position is driven entirely by motion values; React state only commits when
 * the hover variant or tooltip text actually changes.
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

  const coreX = useMotionValue(-100);
  const coreY = useMotionValue(-100);
  // Soft halo: medium lag so the glow sweeps just behind the pointer.
  const glowX = useSpring(coreX, { stiffness: 160, damping: 22, mass: 0.7 });
  const glowY = useSpring(coreY, { stiffness: 160, damping: 22, mass: 0.7 });

  const lastVariantKey = useRef('');

  const getVariantFor = useCallback((target: EventTarget | null): CursorState => {
    if (!(target instanceof Element)) return { variant: 'default', label: '' };

    const cursorEl = target.closest('[data-cursor]') as HTMLElement | null;
    if (cursorEl) {
      const variant = (cursorEl.dataset.cursor as CursorVariant) || 'hover';
      return { variant, label: truncate(cursorEl.dataset.cursorLabel || '') };
    }

    if (target.closest(TEXT_SELECTOR)) return { variant: 'text', label: 'Type here' };

    const interactiveEl = target.closest(INTERACTIVE_SELECTOR);
    if (interactiveEl) {
      const explicit = (interactiveEl as HTMLElement).dataset.cursorLabel;
      const aria = interactiveEl.getAttribute('aria-label');
      const text = interactiveEl.textContent || '';
      const label = truncate(explicit || aria || text);
      return { variant: 'hover', label };
    }

    return { variant: 'default', label: '' };
  }, []);

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    document.body.dataset.customCursor = 'true';

    const handleMove = (e: MouseEvent) => {
      coreX.set(e.clientX);
      coreY.set(e.clientY);

      const next = getVariantFor(e.target);
      const key = `${next.variant}|${next.label}`;
      if (key !== lastVariantKey.current) {
        lastVariantKey.current = key;
        setState(next);
      }
    };

    const handleDown = (e: MouseEvent) => {
      setIsDown(true);
      coreX.set(e.clientX);
      coreY.set(e.clientY);
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
  }, [enabled, coreX, coreY, getVariantFor, prefersReducedMotion]);

  if (!enabled || prefersReducedMotion) return null;

  const { variant, label } = state;
  const isHover = variant === 'hover';
  const isText = variant === 'text';
  const hidden = variant === 'hidden';
  const showTooltip = isHover || isText;
  const tooltipText = isText ? 'Type here' : label || 'Click';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      aria-hidden="true"
    >
      {/* Comet trail — each dot lags the one in front of it */}
      {!hidden && <TrailDot x={coreX} y={coreY} level={0} />}

      {/* Soft halo sweeping just behind the pointer */}
      <AtPointer x={glowX} y={glowY}>
        <motion.div
          className="absolute rounded-full"
          style={{
            x: '-50%',
            y: '-50%',
            background: 'radial-gradient(circle, var(--cursor-accent) 0%, transparent 70%)',
          }}
          animate={{
            width: hidden ? 0 : isHover ? 72 : 48,
            height: hidden ? 0 : isHover ? 72 : 48,
            opacity: hidden ? 0 : isHover ? 0.5 : 0.35,
            scale: isDown ? 0.85 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        />
      </AtPointer>

      {/* Click ripple */}
      <AtPointer x={coreX} y={coreY}>
        <motion.div
          key={pulse}
          className="absolute rounded-full border"
          style={{ x: '-50%', y: '-50%', borderColor: 'var(--cursor-accent)' }}
          initial={{ width: 10, height: 10, opacity: 0.5 }}
          animate={{ width: 64, height: 64, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      </AtPointer>

      {/* Core: dot at rest, ring over interactive targets, caret over text */}
      <AtPointer x={coreX} y={coreY}>
        <motion.div
          className="absolute rounded-full"
          style={{ x: '-50%', y: '-50%' }}
          animate={{
            width: hidden ? 0 : isText ? 2 : isHover ? 30 : 8,
            height: hidden ? 0 : isText ? 24 : isHover ? 30 : 8,
            borderRadius: isText ? 2 : 9999,
            background: isHover || isText ? 'transparent' : 'var(--cursor-accent)',
            border: isHover || isText ? '1.5px solid var(--cursor-accent)' : '0px solid transparent',
            opacity: hidden ? 0 : 1,
            scale: isDown ? 0.75 : 1,
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        />
      </AtPointer>

      {/* Tooltip — wrapper tracks the pointer; the chip offsets with plain CSS,
          so its own y/scale pop animation can never hijack tracking. */}
      <AtPointer x={coreX} y={coreY}>
        <AnimatePresence>
          {showTooltip && (
            <motion.span
              key={tooltipText}
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.6 }}
              className="absolute left-5 top-6 whitespace-nowrap rounded-xl border px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-lg"
              style={{
                background: 'var(--cursor-chip-bg)',
                color: 'var(--cursor-chip-text)',
                borderColor: 'var(--cursor-accent)',
              }}
            >
              {tooltipText}
            </motion.span>
          )}
        </AnimatePresence>
      </AtPointer>
    </div>
  );
};
