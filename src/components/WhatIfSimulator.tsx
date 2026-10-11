'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Check,
  ShoppingBag,
  DollarSign,
  PiggyBank,
  Scissors,
  AlertOctagon,
  Activity,
} from 'lucide-react';
import {
  Category,
  SimulationParams,
  SimulationComparison,
  Transaction,
  Commitment,
  Subscription,
  SavingsGoal,
} from '../types/finance';
import { simulateDecision, TOTAL_DAYS } from '../utils/engine';
import { PRESET_SIMULATIONS } from '../data/initialData';
import { sounds } from '../utils/audio';
import { Magnet, AnimatedCounter, ScrollReveal } from './ui/Animations';

interface WhatIfSimulatorProps {
  currentDay: number;
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  onCommitDecision: (decision: SimulationParams) => void;
}

const typeConfig = {
  expense: { color: 'rose', activeBg: 'bg-rose-500/20', activeBorder: 'border-rose-500/50', activeText: 'text-rose-300', icon: ShoppingBag, label: 'Spend Expense' },
  income: { color: 'emerald', activeBg: 'bg-emerald-500/20', activeBorder: 'border-emerald-500/50', activeText: 'text-emerald-300', icon: DollarSign, label: 'Freelance / Income' },
  savings_deposit: { color: 'amber', activeBg: 'bg-amber-500/20', activeBorder: 'border-amber-500/50', activeText: 'text-amber-300', icon: PiggyBank, label: 'Lock in Savings' },
  subscription_toggle: { color: 'cyan', activeBg: 'bg-cyan-500/20', activeBorder: 'border-cyan-500/50', activeText: 'text-cyan-300', icon: Scissors, label: 'Cut Subscription' },
} as const;

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentDay,
  transactions,
  commitments,
  subscriptions,
  savingsGoals,
  onCommitDecision,
}) => {
  const [title, setTitle] = useState('Weekend Hangout & Dinner');
  const [amount, setAmount] = useState<number>(650);
  const [type, setType] = useState<SimulationParams['type']>('expense');
  const [category, setCategory] = useState<Category>('Food & Canteen');
  const [committedNotice, setCommittedNotice] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const comparison: SimulationComparison = useMemo(
    () =>
      simulateDecision(
        { currentDay, transactions, commitments, subscriptions, savingsGoals },
        { title, amount, type, category }
      ),
    [currentDay, transactions, commitments, subscriptions, savingsGoals, title, amount, type, category]
  );

  const { simulatedMetrics, narrativeSummary, warnings } = comparison;

  const handleApplyPreset = (preset: (typeof PRESET_SIMULATIONS)[number]) => {
    sounds.playClick();
    setTitle(preset.title);
    setAmount(preset.amount);
    setType(preset.type);
    setCategory(preset.category);
  };

  const handleCommit = () => {
    sounds.playCoin();
    onCommitDecision({ title, amount, type, category });
    setCommittedNotice(`Decision "${title}" committed to your real budget!`);
    setTimeout(() => setCommittedNotice(null), 4000);
  };

  const impactCards = useMemo(
    () => [
      {
        id: 'allowance',
        label: 'Daily Allowance',
        value: `₹${simulatedMetrics.safeDailyAllowance}`,
        sub: '/day',
        delta: comparison.dailyAllowanceDelta,
        deltaSuffix: '/d',
        deltaPrefix: '₹',
      },
      {
        id: 'health',
        label: 'Health Score',
        value: `${simulatedMetrics.healthScore}`,
        sub: `(Grade ${simulatedMetrics.grade})`,
        delta: comparison.healthDelta,
        deltaSuffix: ' pts',
        deltaPrefix: '',
      },
      {
        id: 'risk',
        label: 'Risk Level',
        value: simulatedMetrics.riskLevel,
        sub: null,
        delta: null,
        deltaText: `Index: ${simulatedMetrics.riskScore}%`,
        deltaNegative: simulatedMetrics.riskScore > 50,
      },
    ],
    [simulatedMetrics, comparison]
  );

  return (
    <ScrollReveal direction="up" distance={40} delay={0.1}>
      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-indigo-500/15">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-600/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-7 relative z-10">
          <div>
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Sandbox Mode • Zero Real Risk
            </motion.div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              What-If Decision Simulator
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
              Test a financial move before spending a single rupee. See instant ripple
              effects across your daily allowance, savings goals, monthly forecast, and
              financial health.
            </p>
          </div>

          <AnimatePresence>
            {committedNotice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-semibold backdrop-blur-md shrink-0"
              >
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                {committedNotice}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-7 relative z-10">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Fast Simulation Presets
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESET_SIMULATIONS.map((preset, idx) => {
              const isActive = title === preset.title && amount === preset.amount;
              return (
                <motion.button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.04, duration: 0.3 }}
                  whileHover={prefersReducedMotion ? {} : { y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between min-h-[72px] focus-ring ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-400/60 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-base mb-1">
                    <span>{preset.icon}</span>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        preset.type === 'income' ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {preset.type === 'income' ? `+₹${preset.amount}` : `₹${preset.amount}`}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {preset.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          <div className="lg:col-span-5 bg-slate-900/60 rounded-2xl p-5 border border-slate-800/70 space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Configure Scenario</span>
              <span className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">Decision Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(typeConfig) as SimulationParams['type'][]).map((key) => {
                  const config = typeConfig[key];
                  const Icon = config.icon;
                  const isActive = type === key;
                  return (
                    <Magnet key={key} padding={20} strength={4}>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setType(key);
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all focus-ring ${
                          isActive
                            ? `${config.activeBg} ${config.activeBorder} ${config.activeText}`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        aria-pressed={isActive}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </button>
                    </Magnet>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="sim-title" className="text-xs font-semibold text-slate-300 mb-2 block">
                Description / Item
              </label>
              <input
                id="sim-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Zara Jacket / Freelance Logo"
                className="input-premium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="sim-amount" className="text-xs font-semibold text-slate-300">
                  Amount (₹)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 font-mono">₹</span>
                  <input
                    id="sim-amount"
                    type="number"
                    min="0"
                    max="10000"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-sm font-mono font-bold text-white text-right focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <input
                id="sim-slider"
                type="range"
                min="50"
                max="4000"
                step="50"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((amount - 50) / 3950) * 100}%, #1e293b ${((amount - 50) / 3950) * 100}%, #1e293b 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                <span>₹50</span>
                <span>₹1,500</span>
                <span>₹4,000</span>
              </div>
            </div>

            <div>
              <label htmlFor="sim-category" className="text-xs font-semibold text-slate-300 mb-2 block">
                Category
              </label>
              <select
                id="sim-category"
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="select-premium"
              >
                <option value="Food & Canteen">Food & Canteen</option>
                <option value="Cafe & Boba">Cafe & Boba</option>
                <option value="Travel & Metro">Travel & Metro</option>
                <option value="Study & Supplies">Study & Supplies</option>
                <option value="Shopping & Fashion">Shopping & Fashion</option>
                <option value="Entertainment & Party">Entertainment & Party</option>
                <option value="Bills & Utilities">Bills & Utilities</option>
                <option value="Health & Emergency">Health & Emergency</option>
                <option value="Freelance & Income">Freelance & Income</option>
                <option value="Savings Lock">Savings Lock</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/30 rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Consequence Matrix
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Current Reality vs Simulated
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {impactCards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.06, duration: 0.3 }}
                    className={`p-4 rounded-xl bg-slate-950/70 border border-slate-800/70 ${
                      idx === 2 ? 'sm:col-span-1' : ''
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5">{card.label}</div>
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-lg font-bold font-mono text-white truncate">{card.value}</span>
                      {card.sub && <span className="text-[10px] text-slate-500">{card.sub}</span>}
                    </div>
                    {card.delta !== null && card.delta !== undefined ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono">
                        {card.delta >= 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                            +{card.deltaPrefix || ''}{card.delta}{card.deltaSuffix}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center">
                            <TrendingDown className="w-3 h-3 mr-0.5" />
                            {card.deltaPrefix || ''}{card.delta}{card.deltaSuffix}
                          </span>
                        )}
                      </div>
                    ) : card.deltaText ? (
                      <div className={`text-[11px] font-mono font-bold ${card.deltaNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {card.deltaText}
                      </div>
                    ) : null}
                  </motion.div>
                ))}

                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.38, duration: 0.3 }}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/70 sm:col-span-2"
                >
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                    Day 30 Forecast Balance
                  </div>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span
                      className={`text-lg font-bold font-mono ${
                        simulatedMetrics.isDeficitProjected ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {simulatedMetrics.isDeficitProjected ? '-' : '+'}₹
                      <AnimatedCounter value={Math.abs(simulatedMetrics.projectedEOMBalance)} duration={0.6} />
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {simulatedMetrics.isDeficitProjected ? 'Deficit at EOM' : 'Surplus at EOM'}
                    </span>
                  </div>
                  <div className="text-[11px]">
                    {simulatedMetrics.isDeficitProjected ? (
                      <span className="text-rose-400 font-medium">
                        Runs out on Day {simulatedMetrics.deficitDay || 25}
                      </span>
                    ) : (
                      <span className="text-slate-400">Fully solvent through Day 30</span>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.44, duration: 0.3 }}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/70"
                >
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Goal Status</div>
                  <div className="text-xs font-bold text-slate-200 mb-1">
                    {type === 'savings_deposit'
                      ? 'Goa Fund Boosted!'
                      : type === 'expense' && amount > 1000
                      ? 'Goa Fund at Risk'
                      : 'Goals Protected'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {type === 'savings_deposit' ? `+₹${amount} locked` : 'No forced withdrawal'}
                  </div>
                </motion.div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-r" />
                <p className="text-xs text-indigo-200 leading-relaxed pl-2">{narrativeSummary}</p>
              </div>

              <AnimatePresence>
                {warnings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1.5 mb-4 overflow-hidden"
                  >
                    {warnings.map((warn, i) => (
                      <motion.div
                        key={i}
                        initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-500/30 rounded-lg px-3 py-2 flex items-center gap-2"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{warn}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Impact:</span>
                <strong
                  className={
                    comparison.dailyAllowanceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  {comparison.dailyAllowanceDelta >= 0 ? 'Expands' : 'Shrinks'} daily budget by ₹
                  {Math.abs(comparison.dailyAllowanceDelta)}/day
                </strong>
              </div>

              <Magnet padding={40} strength={2.5}>
                <button
                  onClick={handleCommit}
                  className="btn-primary w-full sm:w-auto px-6 py-3 text-sm"
                  aria-label="Commit decision to real budget"
                >
                  <Check className="w-4 h-4" />
                  Commit to Real Budget
                </button>
              </Magnet>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};