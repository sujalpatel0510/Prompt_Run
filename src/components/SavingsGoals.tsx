'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Target, Plus, Lock, CheckCircle2, ArrowUpRight, ArrowDownLeft, X, AlertTriangle } from 'lucide-react';
import { SavingsGoal } from '../types/finance';
import { sounds } from '../utils/audio';
import { Magnet, ScrollReveal, AnimatedCounter } from './ui/Animations';

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[];
  liquidBalance: number;
  onDepositGoal: (goalId: string, amount: number) => void;
  onWithdrawGoal: (goalId: string, amount: number) => void;
  onAddGoal: (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
}

// canvas-confetti is loaded on demand: it is only needed when a goal is
// completed, so it stays out of the initial bundle.
const triggerConfetti = async () => {
  const { default: confetti } = await import('canvas-confetti');
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#06b6d4', '#a855f7', '#f59e0b'] });
};

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  savingsGoals,
  liquidBalance,
  onDepositGoal,
  onWithdrawGoal,
  onAddGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(2000);
  const [newEmoji, setNewEmoji] = useState('🎒');
  const [error, setError] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Accessibility: while the create-goal dialog is open, trap Escape to close it
  // and move focus into the dialog.
  useEffect(() => {
    if (!showAddModal) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showAddModal]);

  const handleDeposit = (goalId: string, amount: number) => {
    if (liquidBalance < amount) {
      sounds.playWarning();
      setError('Not enough liquid cash to lock that amount. Free up some balance first.');
      window.setTimeout(() => setError(''), 4000);
      return;
    }
    sounds.playCoin();
    onDepositGoal(goalId, amount);
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (goal && goal.currentAmount + amount >= goal.targetAmount) {
      void triggerConfetti();
      sounds.playSuccess();
    }
  };

  const handleWithdraw = (goalId: string, amount: number) => {
    sounds.playClick();
    onWithdrawGoal(goalId, amount);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sounds.playSuccess();
    onAddGoal({
      title: newTitle,
      targetAmount: newTarget,
      deadlineDay: 30,
      emoji: newEmoji,
      color: 'from-pink-500 to-rose-500',
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <ScrollReveal direction="up" distance={40} delay={0.1}>
      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Smart Savings Vault & Goals
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold text-white">Goal Reserves & Locked Stashes</h3>
            <p className="text-xs text-slate-400 mt-1">
              Shelter funds from impulsive spending. Total Locked:{' '}
              <strong className="text-amber-300 font-mono">₹{totalSaved.toLocaleString()}</strong> of ₹
              {totalTarget.toLocaleString()} target.
            </p>
          </div>

          <Magnet padding={25} strength={3}>
            <button
              onClick={() => {
                sounds.playClick();
                setShowAddModal(true);
              }}
              className="btn-secondary border-amber-500/30 text-amber-300 hover:text-amber-200 px-4 py-2.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Goal</span>
            </button>
          </Magnet>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -8, height: 0 }}
              className="mb-5 overflow-hidden"
              role="alert"
            >
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {savingsGoals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isComplete = goal.currentAmount >= goal.targetAmount;

            return (
              <motion.div
                key={goal.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }}
                className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between relative overflow-hidden ${
                  isComplete
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                {isComplete && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none"
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                )}

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <motion.span
                        className="text-2xl p-2.5 rounded-xl bg-slate-900 border border-slate-800"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.2, rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        {goal.emoji}
                      </motion.span>
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{goal.title}</h4>
                        <span className="text-[10px] text-slate-400">Target by Day 30</span>
                      </div>
                    </div>

                    {isComplete ? (
                      <motion.span
                        initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                        className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      </motion.span>
                    ) : (
                      <span className="p-1.5 rounded-full bg-slate-800/80" title="Locked from liquid spending">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-baseline mb-3">
                    <div className="text-xl font-bold font-mono text-white">
                      ₹<AnimatedCounter value={goal.currentAmount} duration={0.8} />
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      of ₹{goal.targetAmount.toLocaleString()} ({progress}%)
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${goal.color || 'from-amber-500 to-orange-500'} rounded-full`}
                      initial={prefersReducedMotion ? { width: `${progress}%` } : { width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.4 }}
                    />
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-800/60 flex items-center justify-between gap-2.5 relative">
                  <Magnet padding={10} strength={5}>
                    <motion.button
                      onClick={() => handleDeposit(goal.id, 200)}
                      disabled={liquidBalance < 200}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-colors focus-ring"
                      title="Lock ₹200 from liquid cash into this goal"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      +₹200 Lock
                    </motion.button>
                  </Magnet>

                  <Magnet padding={10} strength={5}>
                    <motion.button
                      onClick={() => handleWithdraw(goal.id, 200)}
                      disabled={goal.currentAmount <= 0}
                      whileTap={{ scale: 0.95 }}
                      className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-colors focus-ring"
                      title="Withdraw ₹200 back into liquid cash"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                      -₹200
                    </motion.button>
                  </Magnet>
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="glass-panel-elevated w-full max-w-md rounded-3xl p-6 border border-slate-700/60 relative overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-goal-title"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-5">
                  <h3 id="add-goal-title" className="text-lg font-bold text-white flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <Target className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    Create New Savings Goal
                  </h3>
                  <Magnet padding={10} strength={4}>
                    <button
                      ref={closeButtonRef}
                      onClick={() => setShowAddModal(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-ring"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Magnet>
                </div>

                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div>
                    <label htmlFor="goal-name" className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Goal Name
                    </label>
                    <input
                      id="goal-name"
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Festival Outfit, Gaming Mouse"
                      className="input-premium"
                      style={{ borderColor: undefined }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="goal-target" className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Target (₹)
                      </label>
                      <input
                        id="goal-target"
                        type="number"
                        min="100"
                        max="10000"
                        required
                        value={newTarget}
                        onChange={(e) => setNewTarget(parseInt(e.target.value) || 500)}
                        className="input-premium font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="goal-emoji" className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Emoji Icon
                      </label>
                      <select
                        id="goal-emoji"
                        aria-label="Emoji Icon"
                        value={newEmoji}
                        onChange={(e) => setNewEmoji(e.target.value)}
                        className="select-premium"
                      >
                        <option value="🏖️">🏖️ Vacation</option>
                        <option value="🎧">🎧 Gadgets</option>
                        <option value="👟">👟 Kicks</option>
                        <option value="🎒">🎒 Study</option>
                        <option value="💻">💻 Tech</option>
                        <option value="🎸">🎸 Music</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2.5">
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost px-5">
                      Cancel
                    </button>
                    <Magnet padding={15} strength={3}>
                      <button type="submit" className="btn-primary">
                        Create Goal
                      </button>
                    </Magnet>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
};