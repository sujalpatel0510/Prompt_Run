import React from 'react';
import { 
  CreditCard, 
  Check, 
  X, 
  Calendar, 
  AlertCircle, 
  Flame, 
  ShieldCheck,
  Scissors
} from 'lucide-react';
import { Subscription, Commitment } from '../types/finance';
import { sounds } from '../utils/audio';

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
  const activeSubsMonthlyCost = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + s.cost, 0);

  const pendingCommitmentsCost = commitments
    .filter(c => !c.isPaid && c.dueDay >= currentDay)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Obligations & Subscriptions Vault
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Fixed Commitments & Recurring Burn
          </h3>
          <p className="text-xs text-slate-400">
            Every active subscription and pending bill quietly depletes your liquid ₹10,000 cash.
          </p>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Subs Burn:</span>{' '}
            <strong className="text-rose-400 font-mono">₹{activeSubsMonthlyCost}/mo</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Pending Bills:</span>{' '}
            <strong className="text-cyan-400 font-mono">₹{pendingCommitmentsCost}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Recurring Subscriptions */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Subscriptions ({subscriptions.filter(s => s.active).length})
            </span>
            <span className="text-[11px] text-slate-400">Toggle to pause/cut</span>
          </div>

          <div className="space-y-2.5">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  sub.active
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sub.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{sub.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
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

                <button
                  onClick={() => {
                    sounds.playClick();
                    onToggleSubscription(sub.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sub.active
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {sub.active ? 'Pause / Cut' : 'Resume'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Fixed Commitments (Rent, Wi-Fi, Recharge) */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Essential Commitments
            </span>
            <span className="text-[11px] text-slate-400">Reserved in budget</span>
          </div>

          <div className="space-y-2.5">
            {commitments.map((comm) => (
              <div
                key={comm.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  comm.isPaid
                    ? 'bg-emerald-950/10 border-emerald-500/20'
                    : comm.dueDay <= currentDay
                      ? 'bg-rose-950/20 border-rose-500/30 ring-1 ring-rose-500/20'
                      : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{comm.title}</span>
                    {comm.isPaid ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                        Paid
                      </span>
                    ) : comm.dueDay <= currentDay ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-semibold animate-pulse">
                        Due Now
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        Due Day {comm.dueDay}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono font-bold text-white">₹{comm.amount}</span>
                    <span className="ml-2 text-slate-500">
                      {comm.isPaid ? 'Cleared from cash' : 'Auto-deducted on due date'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onToggleCommitmentPaid(comm.id);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    comm.isPaid
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title={comm.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                >
                  {comm.isPaid ? <Check className="w-4 h-4" /> : <span className="text-[11px] px-1">Pay</span>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
