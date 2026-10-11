import { useFinancial } from '../context/FinancialContext';
import { formatINR } from '../utils/format';
import { Shield, TrendingUp, PiggyBank, AlertTriangle } from 'lucide-react';

const FACTORS = [
  {
    icon: TrendingUp,
    label: 'Balance & solvency (max +35)',
    description: 'Liquid balance of at least ₹6,000 scores full marks; below ₹500 penalises the score.',
  },
  {
    icon: Shield,
    label: 'Bill coverage (max +25)',
    description: 'Cash remaining after unpaid commitments and subscriptions. ₹2,500+ scores full marks.',
  },
  {
    icon: PiggyBank,
    label: 'Savings health (max +20)',
    description: 'Locked savings as a share of your goal targets. Fully-funded goals score full marks.',
  },
  {
    icon: TrendingUp,
    label: 'Daily allowance comfort (max +20)',
    description: 'Safe daily allowance of ₹300+ scores full marks; under ₹100 penalises the score.',
  },
  {
    icon: AlertTriangle,
    label: 'Projected deficit penalty (−20)',
    description: 'Applied when the forecast reaches a month-end deficit at the current burn rate.',
  },
];

const GRADES = [
  { grade: 'S', range: '90–99', label: 'Excellent', color: 'text-amber-400' },
  { grade: 'A', range: '75–89', label: 'Very good', color: 'text-emerald-400' },
  { grade: 'B', range: '60–74', label: 'Good', color: 'text-cyan-400' },
  { grade: 'C', range: '40–59', label: 'Needs attention', color: 'text-orange-400' },
  { grade: 'F', range: '5–39', label: 'Critical', color: 'text-rose-400' },
];

export function HealthPage() {
  const { metrics, liquidBalance } = useFinancial();

  const riskColor =
    metrics.riskScore > 75
      ? 'text-rose-400'
      : metrics.riskScore > 50
      ? 'text-orange-400'
      : metrics.riskScore > 25
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-1">Financial Health & Risk</h1>
        <p className="text-sm text-slate-400 mb-6">
          A transparent, deterministic budgeting indicator — not a credit score or professional
          financial assessment. Every factor below is computed from your real app state.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/50 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Health Score</p>
            <p className="text-4xl font-extrabold text-white mt-1">{metrics.healthScore}</p>
            <p className={`text-lg font-bold ${GRADES.find(g => g.grade === metrics.grade)?.color ?? ''}`}>
              Grade {metrics.grade}
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/50 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Risk Level</p>
            <p className={`text-2xl font-extrabold mt-2 ${riskColor}`}>{metrics.riskLevel}</p>
            <p className="text-xs text-slate-500 mt-1">Index {metrics.riskScore}%</p>
          </div>
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/50 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Month-End Forecast</p>
            <p className={`text-2xl font-extrabold mt-2 ${metrics.projectedEOMBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatINR(metrics.projectedEOMBalance)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.isDeficitProjected
                ? `Runs out around Day ${metrics.deficitDay ?? 30}`
                : 'Projected surplus'}
            </p>
          </div>
        </div>

        <div className="h-3 bg-slate-900 rounded-full overflow-hidden mb-8">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${metrics.healthScore}%`,
              background:
                metrics.healthScore >= 75
                  ? 'linear-gradient(90deg,#10b981,#06b6d4)'
                  : metrics.healthScore >= 50
                  ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                  : 'linear-gradient(90deg,#ef4444,#e11d48)',
            }}
          />
        </div>

        <h2 className="text-lg font-bold text-white mb-4">How the score is calculated</h2>
        <ul className="space-y-3 mb-8">
          {FACTORS.map(f => (
            <li key={f.label} className="flex gap-3 items-start glass-panel rounded-xl p-4 border border-slate-800/50">
              <f.icon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-sm">{f.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-bold text-white mb-4">Grade reference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {GRADES.map(g => (
            <div
              key={g.grade}
              className={`glass-panel rounded-xl p-4 border text-center ${
                g.grade === metrics.grade ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800/50'
              }`}
            >
              <p className={`text-2xl font-extrabold ${g.color}`}>{g.grade}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">{g.range} pts</p>
              <p className="text-xs text-slate-500 mt-0.5">{g.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-6 border-t border-slate-800/50 pt-4">
          Educational budgeting indicator only. Not a credit score, not professional financial advice.
          Values are projections based on your current pace and may change as your data changes.
        </p>
      </div>

      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
        <h2 className="text-lg font-bold text-white mb-4">Live snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <p className="text-xs text-slate-400">Liquid cash</p>
            <p className="text-lg font-bold text-white font-mono">{formatINR(liquidBalance)}</p>
          </div>
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <p className="text-xs text-slate-400">Safe daily</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">{formatINR(metrics.safeDailyAllowance)}</p>
          </div>
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <p className="text-xs text-slate-400">Burn rate</p>
            <p className="text-lg font-bold text-white font-mono">{formatINR(metrics.burnRatePerDay)}</p>
          </div>
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <p className="text-xs text-slate-400">Committed upcoming</p>
            <p className="text-lg font-bold text-amber-400 font-mono">{formatINR(metrics.totalCommittedUpcoming)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
