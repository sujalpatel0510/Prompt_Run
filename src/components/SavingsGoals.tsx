import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Lock, 
  Unlock, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types/finance';
import { sounds } from '../utils/audio';

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[];
  liquidBalance: number;
  onDepositGoal: (goalId: string, amount: number) => void;
  onWithdrawGoal: (goalId: string, amount: number) => void;
  onAddGoal: (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
}

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

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDeposit = (goalId: string, amount: number) => {
    if (liquidBalance < amount) {
      sounds.playWarning();
      alert('Insufficient liquid cash balance to deposit this amount!');
      return;
    }
    sounds.playCoin();
    onDepositGoal(goalId, amount);

    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal && (goal.currentAmount + amount >= goal.targetAmount)) {
      triggerConfetti();
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
    <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Smart Savings Vault & Goals
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Goal Reserves & Locked Stashes
          </h3>
          <p className="text-xs text-slate-400">
            Shelter funds from impulsive spending. Total Locked: <strong className="text-amber-300 font-mono">₹{totalSaved.toLocaleString()}</strong> of ₹{totalTarget.toLocaleString()} target.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {savingsGoals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isComplete
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {goal.emoji}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {goal.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">Target by Day 30</span>
                    </div>
                  </div>

                  {isComplete ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-slate-800 text-slate-400" title="Locked from liquid spending">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}
                </div>

                {/* Amount figures */}
                <div className="flex justify-between items-baseline mb-2">
                  <div className="text-lg font-bold font-mono text-white">
                    ₹{goal.currentAmount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    of ₹{goal.targetAmount.toLocaleString()} ({progress}%)
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full bg-gradient-to-r ${goal.color || 'from-amber-500 to-orange-500'} rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Quick Deposit / Withdraw Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDeposit(goal.id, 200)}
                  disabled={liquidBalance < 200}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  title="Lock ₹200 from liquid cash into this goal"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  +₹200 Lock
                </button>

                <button
                  onClick={() => handleWithdraw(goal.id, 200)}
                  disabled={goal.currentAmount <= 0}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  title="Withdraw ₹200 back into liquid cash"
                >
                  <ArrowDownLeft className="w-3 h-3" />
                  -₹200
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Create New Savings Goal
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Festival Outfit, Gaming Mouse"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target (₹)</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseInt(e.target.value) || 500)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Emoji Icon</label>
                  <select
                    aria-label="Emoji Icon"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
