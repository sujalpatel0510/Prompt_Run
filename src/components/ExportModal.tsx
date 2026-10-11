import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Download, 
  Award, 
  Wallet, 
  HeartPulse,
  Target
} from 'lucide-react';
import { FinancialHealthMetrics, Transaction, SavingsGoal } from '../types/finance';
import { sounds } from '../utils/audio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  liquidBalance: number;
  metrics: FinancialHealthMetrics;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currentDay,
  liquidBalance,
  metrics,
  transactions,
  savingsGoals,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  const reportText = `⚡ KUBER-Z FINANCIAL HEALTH REPORT (Day ${currentDay}/30)
==================================================
💰 Starting Baseline: ₹10,000
💵 Liquid Cash Balance: ₹${liquidBalance.toLocaleString()}
🎯 Locked in Savings Goals: ₹${totalSaved.toLocaleString()}
🛡️ Safe Daily Allowance: ₹${metrics.safeDailyAllowance}/day
🩺 Financial Health Score: ${metrics.healthScore}/100 (Grade ${metrics.grade})
⚠️ Financial Risk Level: ${metrics.riskLevel} (${metrics.riskScore}%)
🔮 Day 30 Forecast: ${metrics.isDeficitProjected ? `Deficit (-₹${Math.abs(metrics.projectedEOMBalance)})` : `Surplus (+₹${metrics.projectedEOMBalance})`}
📊 Total Expenses Logged: ₹${totalSpent.toLocaleString()}
💸 Side Hustle Incomes: ₹${totalIncome.toLocaleString()}
==================================================
Generated on KuberZ — Gen-Z Financial Decision Engine`;

  const handleCopy = () => {
    sounds.playCoin();
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    sounds.playClick();
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuberz-report-day-${currentDay}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 lg:p-8 border border-slate-700 shadow-2xl animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
          <Share2 className="w-3.5 h-3.5" />
          Day {currentDay} Financial Report Card
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-2">
          Your 30-Day Solvency Vibe Check
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          A certified snapshot of your ₹10,000 budget run, financial health grade, and savings progress.
        </p>

        {/* Card visual */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs text-slate-300 mb-6">
          <div className="flex justify-between pb-2 border-b border-slate-800 text-white font-bold">
            <span>KuberZ Solvency Pass</span>
            <span className="text-emerald-400">Grade {metrics.grade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Liquid Cash:</span>
            <span className="text-white font-bold">₹{liquidBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Safe Daily Allowance:</span>
            <span className="text-cyan-400 font-bold">₹{metrics.safeDailyAllowance}/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Locked in Goals:</span>
            <span className="text-amber-400 font-bold">₹{totalSaved.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Financial Risk:</span>
            <span className={metrics.riskScore > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {metrics.riskLevel} ({metrics.riskScore}%)
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400">Day 30 Forecast:</span>
            <span className={metrics.isDeficitProjected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {metrics.isDeficitProjected ? `Deficit -₹${Math.abs(metrics.projectedEOMBalance)}` : `Surplus +₹${metrics.projectedEOMBalance}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
