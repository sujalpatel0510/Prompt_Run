'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, FastForward, Leaf, Activity } from 'lucide-react';
import { Transaction, Commitment, Subscription } from '../types/finance';
import { TOTAL_DAYS, INITIAL_BUDGET } from '../utils/engine';
import { sounds } from '../utils/audio';
import { Magnet, ScrollReveal, StaggerContainer } from './ui/Animations';

interface Timeline30DaysProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
  onAdvanceDay: (mode: 'normal' | 'zero') => void;
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  liquidBalance: number;
  projectedEOMBalance: number;
  safeDailyAllowance: number;
}

const chartW = 700;
const chartH = 150;
const pad = 24;
const maxVal = 10500;
const minVal = -1500;

export const Timeline30Days: React.FC<Timeline30DaysProps> = ({
  currentDay,
  onSelectDay,
  onAdvanceDay,
  transactions,
  commitments,
  subscriptions,
  liquidBalance,
  projectedEOMBalance,
  safeDailyAllowance,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const daysArray = useMemo(() => Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1), []);

  const dailyChanges = useMemo(() => {
    const changes: { [day: number]: { expenses: number; incomes: number; hasBill: boolean; billNote: string } } = {};
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      changes[d] = { expenses: 0, incomes: 0, hasBill: false, billNote: '' };
    }
    transactions.forEach((t) => {
      if (changes[t.day]) {
        if (t.type === 'expense') changes[t.day].expenses += t.amount;
        else changes[t.day].incomes += t.amount;
      }
    });
    commitments.forEach((c) => {
      if (changes[c.dueDay]) {
        changes[c.dueDay].hasBill = true;
        changes[c.dueDay].billNote = `${c.title} (₹${c.amount})`;
      }
    });
    subscriptions.forEach((s) => {
      if (s.active && changes[s.billingDay]) {
        changes[s.billingDay].hasBill = true;
        changes[s.billingDay].billNote = `${s.title} (₹${s.cost})`;
      }
    });
    return changes;
  }, [transactions, commitments, subscriptions]);

  const { historyPath, projectPath, historicalBalances, zeroLineY } = useMemo(() => {
    let running = INITIAL_BUDGET;
    const historicalBalances: number[] = [INITIAL_BUDGET];
    for (let d = 1; d <= currentDay; d++) {
      running = running + dailyChanges[d].incomes - dailyChanges[d].expenses;
      historicalBalances.push(running);
    }

    const getX = (day: number) => pad + ((day - 1) / (TOTAL_DAYS - 1)) * (chartW - 2 * pad);
    const getY = (val: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      return chartH - pad - ((clamped - minVal) / (maxVal - minVal)) * (chartH - 2 * pad);
    };

    let historyPath = `M ${getX(1)} ${getY(INITIAL_BUDGET)}`;
    for (let d = 1; d <= currentDay; d++) {
      historyPath += ` L ${getX(d)} ${getY(historicalBalances[d])}`;
    }

    let projectPath = `M ${getX(currentDay)} ${getY(liquidBalance)}`;
    for (let d = currentDay + 1; d <= TOTAL_DAYS; d++) {
      const progress = (d - currentDay) / (TOTAL_DAYS - currentDay);
      const projVal = liquidBalance + (projectedEOMBalance - liquidBalance) * progress;
      projectPath += ` L ${getX(d)} ${getY(projVal)}`;
    }

    return {
      historyPath,
      projectPath,
      historicalBalances,
      zeroLineY: getY(0),
    };
  }, [currentDay, dailyChanges, liquidBalance, projectedEOMBalance]);

  const progress = Math.round((currentDay / TOTAL_DAYS) * 100);

  return (
    <ScrollReveal direction="up" distance={40} delay={0.15}>
      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-7">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              30-Day Runway & Time Progression
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold text-white">Day-by-Day Financial Trajectory</h3>
            <p className="text-xs text-slate-400 mt-1">
              Track daily milestones, bills, and simulate stepping forward in time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Magnet padding={30} strength={3}>
              <button
                disabled={currentDay >= 30}
                onClick={() => {
                  sounds.playClick();
                  onAdvanceDay('zero');
                }}
                className="btn-secondary px-4 py-2.5 disabled:opacity-40 disabled:pointer-events-none"
                title="Advance 1 day with ₹0 spent"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>₹0 Spend Day</span>
              </button>
            </Magnet>
            <Magnet padding={30} strength={2.5}>
              <button
                disabled={currentDay >= 30}
                onClick={() => {
                  sounds.playCoin();
                  onAdvanceDay('normal');
                }}
                className="btn-primary px-5 py-2.5 disabled:opacity-40 disabled:pointer-events-none"
                title="Advance 1 day with typical canteen lunch (₹140)"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Advance Next Day</span>
              </button>
            </Magnet>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-4 lg:p-5 border border-slate-800/60 mb-7 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 flex-wrap gap-2">
            <span className="font-semibold text-slate-300">Runway Forecast Chart (₹10,000 Budget)</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Actual Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-cyan-400" />
                Projected Runway
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-0.5 bg-rose-500" />₹0 Danger Line
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-40 min-w-[500px]" role="img" aria-label="Financial trajectory chart">
              <defs>
                <linearGradient id="historyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <line x1={pad} y1={getY(10000)} x2={chartW - pad} y2={getY(10000)} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={pad} y1={getY(5000)} x2={chartW - pad} y2={getY(5000)} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={pad} y1={zeroLineY} x2={chartW - pad} y2={zeroLineY} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />

              <text x={pad} y={getY(10000) - 4} fill="#64748b" fontSize="9" fontFamily="monospace">₹10K</text>
              <text x={pad} y={getY(5000) - 4} fill="#64748b" fontSize="9" fontFamily="monospace">₹5K</text>
              <text x={pad} y={zeroLineY - 4} fill="#f43f5e" fontSize="9" fontFamily="monospace">₹0</text>

              <path
                d={projectPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                opacity="0.7"
              />

              <motion.path
                d={historyPath}
                fill="none"
                stroke="url(#historyGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                initial={prefersReducedMotion ? {} : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />

              <motion.circle
                cx={getX(currentDay)}
                cy={getY(liquidBalance)}
                r="6"
                fill="#10b981"
                stroke="#030712"
                strokeWidth="2"
                filter="url(#glow)"
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 300, damping: 20 }}
                style={{ transformOrigin: `${getX(currentDay)}px ${getY(liquidBalance)}px` }}
              />
              {!prefersReducedMotion && (
                <motion.circle
                  cx={getX(currentDay)}
                  cy={getY(liquidBalance)}
                  r="6"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1"
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 3 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  style={{ transformOrigin: `${getX(currentDay)}px ${getY(liquidBalance)}px` }}
                />
              )}
            </svg>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Click any Day to Travel / Inspect
            </span>
            <span className="text-slate-500 font-mono text-[11px]">{progress}% Month Complete</span>
          </div>

          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-400 rounded-full"
              initial={prefersReducedMotion ? { width: `${progress}%` } : { width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
            {daysArray.map((day) => {
              const isToday = day === currentDay;
              const isPast = day < currentDay;
              const dayData = dailyChanges[day];

              return (
                <motion.button
                  key={day}
                  onClick={() => {
                    sounds.playClick();
                    onSelectDay(day);
                  }}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + day * 0.015, duration: 0.25 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-xl text-center relative border flex flex-col justify-between h-[68px] focus-ring transition-colors ${
                    isToday
                      ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                      : isPast
                      ? 'bg-slate-900/90 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                  }`}
                  aria-label={`Day ${day}${isToday ? ' (current)' : ''}${dayData.hasBill ? ', has bill' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isToday ? 'text-emerald-300' : 'text-slate-300'
                      }`}
                    >
                      D{day}
                    </span>
                    {dayData.hasBill && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ring-1 ring-cyan-300/50" title={dayData.billNote} />
                    )}
                  </div>
                  <div className="text-[10px] truncate w-full">
                    {dayData.expenses > 0 ? (
                      <span className="text-rose-400 font-mono">-₹{dayData.expenses}</span>
                    ) : dayData.incomes > 0 ? (
                      <span className="text-emerald-400 font-mono">+₹{dayData.incomes}</span>
                    ) : dayData.hasBill ? (
                      <span className="text-cyan-400 font-mono">Bill</span>
                    ) : isPast ? (
                      <span className="text-slate-600">₹0</span>
                    ) : (
                      <span className="text-slate-700">--</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

function getY(val: number) {
  const clamped = Math.max(minVal, Math.min(maxVal, val));
  return chartH - pad - ((clamped - minVal) / (maxVal - minVal)) * (chartH - 2 * pad);
}

function getX(day: number) {
  return pad + ((day - 1) / (TOTAL_DAYS - 1)) * (chartW - 2 * pad);
}