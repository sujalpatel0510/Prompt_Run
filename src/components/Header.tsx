'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Dices,
  Calendar,
  Share2,
  ChevronDown,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { useTheme } from '../theme/ThemeProvider';
import { Magnet } from './ui/Animations';

interface HeaderProps {
  currentDay: number;
  onSetDay: (day: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenLifeEvent: () => void;
  onResetData: () => void;
  onLoadScenario: (scenario: 'baseline' | 'day1' | 'crisis' | 'frugal') => void;
  onOpenExport: () => void;
}

const SCENARIOS = [
  { id: 'baseline', emoji: '📍', label: 'Day 8 Realistic', desc: 'Balanced live spend' },
  { id: 'day1', emoji: '🌱', label: 'Day 1 Fresh Start', desc: 'Clean ₹10,000 slate' },
  { id: 'crisis', emoji: '🚨', label: 'Day 15 Crisis', desc: 'Tight cash pressure' },
  { id: 'frugal', emoji: '🧘', label: 'Day 10 Frugal Monk', desc: 'Low-burn discipline' },
] as const;

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  onSetDay,
  soundEnabled,
  onToggleSound,
  onOpenLifeEvent,
  onResetData,
  onLoadScenario,
  onOpenExport,
}) => {
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('baseline');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setScenarioOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setScenarioOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelectScenario = (id: (typeof SCENARIOS)[number]['id']) => {
    sounds.playCoin();
    setActiveScenario(id);
    setScenarioOpen(false);
    onLoadScenario(id);
  };

  const dayProgress = (currentDay / 30) * 100;
  const activeScenarioMeta = SCENARIOS.find((s) => s.id === activeScenario) ?? SCENARIOS[0];

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/70 px-4 lg:px-8 py-3.5"
    >
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Gen-Z Tag */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <Magnet padding={12} strength={5}>
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20"
              >
                <Zap className="w-5 h-5 text-on-accent fill-[#04121f]" />
              </motion.div>
            </div>
          </Magnet>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight font-display text-white">
                Kuber<span className="gradient-text-emerald">Z</span>
              </span>
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider"
              >
                ₹10K / 30D Vibe
              </motion.span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Gen Z Financial Cockpit & Decision Simulator
            </p>
          </div>
        </div>

        {/* Day Controller & Scenarios */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
          {/* Day Stepper Pill */}
          <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner overflow-hidden">
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${dayProgress}%` }}
            />
            <Calendar className="w-3.5 h-3.5 text-emerald-400 mr-2" />
            <span className="text-xs font-semibold text-slate-400 mr-2 hidden sm:inline">Timeline:</span>
            <div className="flex items-center gap-1">
              <motion.span
                key={currentDay}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-sm font-bold text-emerald-400 font-mono"
              >
                Day {currentDay}
              </motion.span>
              <span className="text-xs text-slate-500">/ 30</span>
            </div>
            <div className="ml-3 pl-2 border-l border-slate-800 flex items-center gap-1">
              <button
                disabled={currentDay <= 1}
                onClick={() => {
                  sounds.playClick();
                  onSetDay(Math.max(1, currentDay - 1));
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous day"
              >
                -
              </button>
              <button
                disabled={currentDay >= 30}
                onClick={() => {
                  sounds.playClick();
                  onSetDay(Math.min(30, currentDay + 1));
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next day"
              >
                +
              </button>
            </div>
          </div>

          {/* Scenario Quick-Loader */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                sounds.playClick();
                setScenarioOpen((v) => !v);
              }}
              aria-haspopup="listbox"
              aria-expanded={scenarioOpen}
              className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 rounded-xl px-3 py-2 hover:border-emerald-500/40 transition-colors"
            >
              <span>{activeScenarioMeta.emoji}</span>
              <span className="hidden sm:inline">{activeScenarioMeta.label}</span>
              <motion.span animate={{ rotate: scenarioOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            <AnimatePresence>
              {scenarioOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-64 p-1.5 rounded-2xl glass-panel-elevated z-50"
                  role="listbox"
                >
                  {SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      role="option"
                      aria-selected={activeScenario === scenario.id}
                      onClick={() => handleSelectScenario(scenario.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-800/70 transition-colors group"
                    >
                      <span className="text-lg">{scenario.emoji}</span>
                      <span className="flex-1">
                        <span className="block text-xs font-bold text-slate-200">{scenario.label}</span>
                        <span className="block text-[10px] text-slate-500">{scenario.desc}</span>
                      </span>
                      {activeScenario === scenario.id && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Draw Fate Event */}
          <Magnet padding={10} strength={4}>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLifeEvent();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm transition-all"
            >
              <Dices className="w-3.5 h-3.5 text-purple-400" />
              <span>Draw Life Event</span>
            </button>
          </Magnet>

          {/* Export Report */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenExport();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium hover:border-slate-700 transition-all"
            title="Share & Export Report"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              toggleTheme();
            }}
            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all focus-ring"
            title={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={resolvedTheme}
                initial={prefersReducedMotion ? false : { rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="hidden md:inline-flex p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              sounds.playWarning();
              onResetData();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/40 transition-all"
            title="Reset Everything to Default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile quick actions */}
      <div className="flex md:hidden items-center justify-center gap-2 mt-2">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenLifeEvent();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold"
        >
          <Dices className="w-3.5 h-3.5" /> Draw Event
        </button>
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          aria-label="Toggle audio"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>
    </motion.header>
  );
};
