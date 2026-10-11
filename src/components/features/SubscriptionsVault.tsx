'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CreditCard, Check, Scissors, AlertCircle, Flame } from 'lucide-react';
import { Subscription, Commitment } from '../../types/finance';
import { sounds } from '../../utils/audio';
import { Magnet, ScrollReveal } from '../ui/Animations';

interface SubscriptionsVaultProps {
  currentDay: number;
  subscriptions: Subscription[];
  commitments: Commitment[];
  onToggleSubscription: (id: string) => void;
  onToggleCommitmentPaid: (id: string) => void;
}

export const SubscriptionsVault: React.FC<SubscriptionsVaultProps> = ({
  currentDay,
  subscriptions,
  commitments,
  onToggleSubscription,
  onToggleCommitmentPaid,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const activeSubsMonthlyCost = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.cost, 0);

  const pendingCommitmentsCost = commitments
    .filter((c) => !c.isPaid && c.dueDay >= currentDay)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScrollReveal direction="up" distance={40} delay={0.1}>
      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Obligations & Subscriptions Vault
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold text-white">
              Fixed Commitments & Recurring Burn
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Every active subscription and pending bill quietly depletes your liquid ₹10,000 cash.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60 text-xs"
            >
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Flame className="w-3 h-3 text-rose-400" />
                Subs Burn
              </div>
              <strong className="text-rose-400 font-mono text-sm">₹{activeSubsMonthlyCost}/mo</strong>
            </motion.div>
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60 text-xs"
            >
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <AlertCircle className="w-3 h-3 text-cyan-400" />
                Pending Bills
              </div>
              <strong className="text-cyan-400 font-mono text-sm">₹{pendingCommitmentsCost}</strong>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Subscriptions ({subscriptions.filter((s) => s.active).length})
              </span>
              <span className="text-[11px] text-slate-500">Toggle to pause/cut</span>
            </div>

            <div className="space-y-2.5">
              {subscriptions.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.06, duration: 0.3 }}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                    sub.active
                      ? 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.span
                      className="text-2xl"
                      whileHover={prefersReducedMotion ? {} : { scale: 1.2, rotate: 10 }}
                    >
                      {sub.icon}
                    </motion.span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="truncate">{sub.title}</span>
                        <span className="badge bg-slate-800 text-slate-400 border-0 shrink-0">
                          {sub.serviceCategory}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-medium text-slate-300">₹{sub.cost}/mo</span>
                        <span>•</span>
                        <span>Renews Day {sub.billingDay}</span>
                        {sub.billingDay < currentDay && sub.active && (
                          <span className="text-emerald-400 text-[10px] font-semibold">(Billed)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Magnet padding={15} strength={4}>
                    <motion.button
                      onClick={() => {
                        sounds.playClick();
                        onToggleSubscription(sub.id);
                      }}
                      whileTap={{ scale: 0.93 }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all focus-ring ${
                        sub.active
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                      aria-label={sub.active ? `Pause ${sub.title}` : `Resume ${sub.title}`}
                    >
                      {sub.active ? (
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3 h-3" /> Cut
                        </span>
                      ) : (
                        'Resume'
                      )}
                    </motion.button>
                  </Magnet>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Essential Commitments
              </span>
              <span className="text-[11px] text-slate-500">Reserved in budget</span>
            </div>

            <div className="space-y-2.5">
              {commitments.map((comm, index) => (
                <motion.div
                  key={comm.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.06, duration: 0.3 }}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    comm.isPaid
                      ? 'bg-emerald-950/10 border-emerald-500/20'
                      : comm.dueDay <= currentDay
                      ? 'bg-rose-950/20 border-rose-500/30 ring-1 ring-rose-500/20'
                      : 'bg-slate-900/90 border-slate-800/80'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                      <span className="truncate">{comm.title}</span>
                      {comm.isPaid ? (
                        <motion.span
                          initial={prefersReducedMotion ? {} : { scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className="badge badge-emerald"
                        >
                          Paid
                        </motion.span>
                      ) : comm.dueDay <= currentDay ? (
                        <span
                          className="badge badge-rose"
                          style={{ animation: prefersReducedMotion ? 'none' : 'pulse 2s ease-in-out infinite' }}
                        >
                          Due Now
                        </span>
                      ) : (
                        <span className="badge bg-slate-800 text-slate-400 border-0">
                          Due Day {comm.dueDay}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      <span className="font-mono font-bold text-white">₹{comm.amount}</span>
                      <span className="ml-2 text-slate-500">
                        {comm.isPaid ? 'Cleared from cash' : 'Auto-deducted on due date'}
                      </span>
                    </div>
                  </div>

                  <Magnet padding={15} strength={4}>
                    <motion.button
                      onClick={() => {
                        sounds.playClick();
                        onToggleCommitmentPaid(comm.id);
                      }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all focus-ring ${
                        comm.isPaid
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title={comm.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                      aria-label={comm.isPaid ? `Mark ${comm.title} as unpaid` : `Mark ${comm.title} as paid`}
                    >
                      {comm.isPaid ? <Check className="w-4 h-4" /> : <span className="px-1">Pay</span>}
                    </motion.button>
                  </Magnet>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};