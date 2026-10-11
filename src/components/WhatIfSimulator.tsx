import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  X, 
  AlertOctagon, 
  HelpCircle,
  Flame,
  Check,
  ShoppingBag,
  DollarSign,
  PiggyBank,
  Scissors
} from 'lucide-react';
import { 
  Category, 
  SimulationParams, 
  SimulationComparison, 
  Transaction, 
  Commitment, 
  Subscription, 
  SavingsGoal 
} from '../types/finance';
import { simulateDecision, TOTAL_DAYS } from '../utils/engine';
import { PRESET_SIMULATIONS } from '../data/initialData';
import { sounds } from '../utils/audio';

interface WhatIfSimulatorProps {
  currentDay: number;
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  onCommitDecision: (decision: SimulationParams) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentDay,
  transactions,
  commitments,
  subscriptions,
  savingsGoals,
  onCommitDecision,
}) => {
  // Current active simulation draft
  const [title, setTitle] = useState('Weekend Hangout & Dinner');
  const [amount, setAmount] = useState<number>(650);
  const [type, setType] = useState<SimulationParams['type']>('expense');
  const [category, setCategory] = useState<Category>('Food & Canteen');
  const [committedNotice, setCommittedNotice] = useState<string | null>(null);

  // Compute live simulation comparison
  const comparison: SimulationComparison = simulateDecision(
    {
      currentDay,
      transactions,
      commitments,
      subscriptions,
      savingsGoals,
    },
    {
      title,
      amount,
      type,
      category,
    }
  );

  const { currentMetrics, simulatedMetrics, narrativeSummary, warnings } = comparison;

  const handleApplyPreset = (preset: typeof PRESET_SIMULATIONS[0]) => {
    sounds.playClick();
    setTitle(preset.title);
    setAmount(preset.amount);
    setType(preset.type);
    setCategory(preset.category);
  };

  const handleCommit = () => {
    sounds.playCoin();
    onCommitDecision({
      title,
      amount,
      type,
      category,
    });
    setCommittedNotice(`Decision "${title}" committed to your real budget!`);
    setTimeout(() => setCommittedNotice(null), 4000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-indigo-500/20 shadow-2xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Sandbox Mode • Zero Real Risk
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            What-If Decision Simulator
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Test a financial move before spending a single rupee. See instant ripple effects across your daily allowance, savings goals, monthly forecast, and financial health.
          </p>
        </div>

        {/* Commitment confirmation flash */}
        {committedNotice && (
          <div className="animate-fade-in flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {committedNotice}
          </div>
        )}
      </div>

      {/* Preset Quick Chips */}
      <div className="mb-6 relative z-10">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <span>Fast Simulation Presets (Click to Test):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_SIMULATIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                title === preset.title && amount === preset.amount
                  ? 'bg-indigo-600/20 border-indigo-400/60 ring-2 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-base mb-1">
                <span>{preset.icon}</span>
                <span className={`text-[11px] font-mono font-bold ${preset.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {preset.type === 'income' ? `+₹${preset.amount}` : `₹${preset.amount}`}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                {preset.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid: Controls (Left) & Impact Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Decision Form Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Configure Scenario</span>
            <span className="text-[10px] text-indigo-400 font-mono">Live Sync</span>
          </div>

          {/* Action Type Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Decision Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setType('expense'); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Spend Expense
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setType('income'); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Freelance / Income
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setType('savings_deposit'); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'savings_deposit'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5" />
                Lock in Savings
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setType('subscription_toggle'); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'subscription_toggle'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                Cut Subscription
              </button>
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Description / Item</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Zara Jacket / Freelance Logo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Amount Slider & Direct Number Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-sm font-mono font-bold text-white text-right focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <input
              type="range"
              min="50"
              max="4000"
              step="50"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>₹50</span>
              <span>₹1,500</span>
              <span>₹4,000</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Category</label>
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
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

        {/* Right Column: Live Interconnected Impact Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/40 rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
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

            {/* Impact Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {/* Metric 1: Safe Daily Allowance */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Daily Allowance</div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-lg font-bold font-mono text-white">
                    ₹{simulatedMetrics.safeDailyAllowance}
                  </span>
                  <span className="text-[10px] text-slate-500">/day</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {comparison.dailyAllowanceDelta >= 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +₹{comparison.dailyAllowanceDelta}/d
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center">
                      <TrendingDown className="w-3 h-3 mr-0.5" /> {comparison.dailyAllowanceDelta}/d
                    </span>
                  )}
                </div>
              </div>

              {/* Metric 2: Financial Health Score */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Health Score</div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-lg font-bold font-mono text-white">
                    {simulatedMetrics.healthScore}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    (Grade {simulatedMetrics.grade})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {comparison.healthDelta >= 0 ? (
                    <span className="text-emerald-400 font-bold">
                      +{comparison.healthDelta} pts
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      {comparison.healthDelta} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Metric 3: Risk Level */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Risk Level</div>
                <div className="text-sm font-bold text-white mb-1 truncate">
                  {simulatedMetrics.riskLevel}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-slate-400">Index:</span>
                  <span className={simulatedMetrics.riskScore > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {simulatedMetrics.riskScore}%
                  </span>
                </div>
              </div>

              {/* Metric 4: Month-End Forecast */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 sm:col-span-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Day 30 Forecast Balance</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-lg font-bold font-mono ${simulatedMetrics.isDeficitProjected ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {simulatedMetrics.isDeficitProjected ? '-' : '+'}₹{Math.abs(simulatedMetrics.projectedEOMBalance).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {simulatedMetrics.isDeficitProjected ? 'Deficit at EOM' : 'Surplus at EOM'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {simulatedMetrics.isDeficitProjected ? (
                    <span className="text-rose-400 font-medium">Runs out on Day {simulatedMetrics.deficitDay || 25}</span>
                  ) : (
                    <span className="text-slate-400">Fully solvent through Day 30</span>
                  )}
                </div>
              </div>

              {/* Metric 5: Savings Goal Ripple */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Goal Status</div>
                <div className="text-xs font-bold text-slate-200 mb-1">
                  {type === 'savings_deposit' ? 'Goa Fund Boosted!' : type === 'expense' && amount > 1000 ? 'Goa Fund at Risk' : 'Goals Protected'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {type === 'savings_deposit' ? `+₹${amount} locked` : 'No forced withdrawal'}
                </div>
              </div>
            </div>

            {/* Narrative Explanation */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 mb-4">
              <p className="text-xs text-indigo-200 leading-relaxed">
                {narrativeSummary}
              </p>
            </div>

            {/* Warnings Alert list */}
            {warnings.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {warnings.map((warn, i) => (
                  <div key={i} className="text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Row: Commit or Discard */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Impact:</span>
              <strong className={comparison.dailyAllowanceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {comparison.dailyAllowanceDelta >= 0 ? 'Expands' : 'Shrinks'} daily budget by ₹{Math.abs(comparison.dailyAllowanceDelta)}/day
              </strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCommit}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                Commit to Real Budget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
