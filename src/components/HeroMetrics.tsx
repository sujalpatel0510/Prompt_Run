'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Wallet,
  ShieldAlert,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  Lock,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { FinancialHealthMetrics } from '../types/finance';
import { TOTAL_DAYS, IDEAL_DAILY_BASELINE } from '../utils/engine';
import { ScrollReveal, AnimatedCounter } from './ui/Animations';

interface HeroMetricsProps {
  currentDay: number;
  liquidBalance: number;
  metrics: FinancialHealthMetrics;
}

export const HeroMetrics: React.FC<HeroMetricsProps> = ({
  currentDay,
  liquidBalance,
  metrics,
}) => {
  const daysLeft = Math.max(1, TOTAL_DAYS - currentDay + 1);
  const prefersReducedMotion = useReducedMotion();

  const gradeColors = {
    S: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 ring-emerald-500/20',
    A: 'text-teal-400 bg-teal-500/10 border-teal-500/30 ring-teal-500/20',
    B: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 ring-cyan-500/20',
    C: 'text-amber-400 bg-amber-500/10 border-amber-500/30 ring-amber-500/20',
    F: 'text-rose-500 bg-rose-500/10 border-rose-500/30 ring-rose-500/20',
  }[metrics.grade];

  const riskConfig = {
    Safe: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bar: 'bg-emerald-500',
      tag: 'Safe Runway',
    },
    Moderate: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
      tag: 'Caution Ahead',
    },
    'High Risk': {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      bar: 'bg-orange-500',
      tag: 'Tight Squeeze',
    },
    'Critical (Cooked)': {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      bar: 'bg-rose-500',
      tag: 'Cooked / Broke Danger',
    },
  }[metrics.riskLevel];

  const allowanceRatio = metrics.safeDailyAllowance / IDEAL_DAILY_BASELINE;
  let allowanceStatus = { label: 'Solid Budget', color: 'text-emerald-400' };
  if (allowanceRatio < 0.4) allowanceStatus = { label: 'Starvation Mode', color: 'text-rose-400' };
  else if (allowanceRatio < 0.75) allowanceStatus = { label: 'Squeezed', color: 'text-amber-400' };
  else if (allowanceRatio > 1.2) allowanceStatus = { label: 'Baller Pace', color: 'text-cyan-400' };

  const barTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="space-y-4">
      <ScrollReveal direction="up" distance={30}>
        <div
          className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-center justify-between flex-wrap gap-2 transition-all ${
            metrics.isDeficitProjected
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200 glow-rose'
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 glow-emerald'
          }`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: metrics.isDeficitProjected ? [1, 1.12, 1] : 1 }}
              transition={{ repeat: metrics.isDeficitProjected ? Infinity : 0, duration: 1.6 }}
              className={`p-2 rounded-xl ${metrics.isDeficitProjected ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}
            >
              {metrics.isDeficitProjected ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </motion.div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                30-Day Monthly Forecast & Solvency
              </div>
              <div className="text-sm font-bold flex items-center gap-2 flex-wrap">
                {metrics.isDeficitProjected ? (
                  <>
                    <span className="text-rose-400">
                      Deficit Warning: You will exhaust cash on Day {metrics.deficitDay || 25}!
                    </span>
                    <span className="text-xs font-mono text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded-md">
                      -₹{Math.abs(metrics.projectedEOMBalance).toLocaleString()} shortfall
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-300">
                      Solvent! Projected Day 30 Surplus: +₹{metrics.projectedEOMBalance.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Avg Burn: ₹{metrics.burnRatePerDay}/day
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs font-medium text-slate-400 flex items-center gap-3">
            <span className="hidden sm:inline">
              Days Remaining: <strong className="text-slate-200">{daysLeft}</strong>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Upcoming Fixed Bills:{' '}
              <strong className="text-slate-200">₹{metrics.totalCommittedUpcoming.toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Primary 4 Metric Cockpit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Liquid Balance */}
        <ScrollReveal direction="up" distance={30} delay={0.05}>
          <div className="stat-card glass-panel-interactive h-full group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Liquid Cash Balance
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-extrabold font-mono tracking-tight text-white mb-2">
              ₹<AnimatedCounter value={liquidBalance} duration={1.2} />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Locked in Goals:
                </span>
                <span className="font-mono font-medium text-amber-300">
                  ₹{metrics.totalSavingsLocked.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3 text-cyan-400" /> Reserved for Bills:
                </span>
                <span className="font-mono font-medium text-cyan-300">
                  ₹{metrics.totalCommittedUpcoming.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 2: Safe Daily Allowance */}
        <ScrollReveal direction="up" distance={30} delay={0.1}>
          <div className="stat-card glass-panel-interactive h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Safe Daily Allowance
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
                ₹<AnimatedCounter value={metrics.safeDailyAllowance} duration={1.2} />
              </div>
              <span className="text-xs text-slate-400 font-medium">/ day</span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ideal Baseline:</span>
                <span className="font-mono text-slate-300">₹{IDEAL_DAILY_BASELINE}/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vibe Check:</span>
                <span className={`font-semibold ${allowanceStatus.color}`}>{allowanceStatus.label}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 3: Financial Health Score */}
        <ScrollReveal direction="up" distance={30} delay={0.15}>
          <div className="stat-card glass-panel-interactive h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Financial Health Score
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono text-white">
                  <AnimatedCounter value={metrics.healthScore} duration={1.2} />
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 }}
                className={`px-2.5 py-1 rounded-xl font-extrabold text-sm border ring-2 ${gradeColors}`}
              >
                Grade {metrics.grade}
              </motion.div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metrics.healthScore}%` }}
                  viewport={{ once: true }}
                  transition={barTransition}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Discipline & Savings</span>
                <span className="text-slate-300 font-semibold">
                  {metrics.healthScore >= 70 ? 'Thriving' : metrics.healthScore >= 50 ? 'Stable' : 'At Risk'}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 4: Financial Risk Meter */}
        <ScrollReveal direction="up" distance={30} delay={0.2}>
          <div className={`stat-card glass-panel-interactive h-full border ${riskConfig.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Risk & Volatility Meter
              </span>
              <div className={`p-2 rounded-xl border ${riskConfig.bg} ${riskConfig.border} ${riskConfig.text}`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span className={riskConfig.text}>{metrics.riskLevel}</span>
              </div>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${riskConfig.bg} ${riskConfig.text}`}>
                {metrics.riskScore}%
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                <motion.div
                  className={`h-full ${riskConfig.bar} rounded-full`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metrics.riskScore}%` }}
                  viewport={{ once: true }}
                  transition={barTransition}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Burn Risk Index</span>
                <span className={`font-medium ${riskConfig.text}`}>{riskConfig.tag}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
