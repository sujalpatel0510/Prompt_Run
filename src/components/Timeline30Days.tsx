import React from 'react';
import { 
  Calendar, 
  FastForward, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Transaction, Commitment, Subscription } from '../types/finance';
import { TOTAL_DAYS, INITIAL_BUDGET } from '../utils/engine';
import { sounds } from '../utils/audio';

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
  // Generate 30 day points for SVG trajectory chart
  const daysArray = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

  // Compute daily net changes from transactions
  const dailyChanges: { [day: number]: { expenses: number; incomes: number; hasBill: boolean; billNote: string } } = {};
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    dailyChanges[d] = { expenses: 0, incomes: 0, hasBill: false, billNote: '' };
  }

  transactions.forEach(t => {
    if (dailyChanges[t.day]) {
      if (t.type === 'expense') dailyChanges[t.day].expenses += t.amount;
      else dailyChanges[t.day].incomes += t.amount;
    }
  });

  commitments.forEach(c => {
    if (dailyChanges[c.dueDay]) {
      dailyChanges[c.dueDay].hasBill = true;
      dailyChanges[c.dueDay].billNote = `${c.title} (₹${c.amount})`;
    }
  });

  subscriptions.forEach(s => {
    if (s.active && dailyChanges[s.billingDay]) {
      dailyChanges[s.billingDay].hasBill = true;
      dailyChanges[s.billingDay].billNote = `${s.title} (₹${s.cost})`;
    }
  });

  // Calculate historical curve up to currentDay
  let running = INITIAL_BUDGET;
  const historicalBalances: number[] = [INITIAL_BUDGET];

  for (let d = 1; d <= currentDay; d++) {
    running = running + dailyChanges[d].incomes - dailyChanges[d].expenses;
    historicalBalances.push(running);
  }

  // Construct chart SVG points
  // Width 600, Height 140, Padding 20
  const chartW = 700;
  const chartH = 150;
  const pad = 24;
  const maxVal = 10500;
  const minVal = -1500;

  const getX = (day: number) => pad + ((day - 1) / (TOTAL_DAYS - 1)) * (chartW - 2 * pad);
  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return chartH - pad - ((clamped - minVal) / (maxVal - minVal)) * (chartH - 2 * pad);
  };

  // Historical path (Day 1 to currentDay)
  let historyPath = `M ${getX(1)} ${getY(INITIAL_BUDGET)}`;
  for (let d = 1; d <= currentDay; d++) {
    historyPath += ` L ${getX(d)} ${getY(historicalBalances[d])}`;
  }

  // Projected path (currentDay to Day 30)
  let projectPath = `M ${getX(currentDay)} ${getY(liquidBalance)}`;
  for (let d = currentDay + 1; d <= TOTAL_DAYS; d++) {
    // Linear projection towards projectedEOMBalance
    const progress = (d - currentDay) / (TOTAL_DAYS - currentDay);
    const projVal = liquidBalance + (projectedEOMBalance - liquidBalance) * progress;
    projectPath += ` L ${getX(d)} ${getY(projVal)}`;
  }

  const zeroLineY = getY(0);

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800">
      {/* Header and Step Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            30-Day Runway & Time Progression
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Day-by-Day Financial Trajectory
          </h3>
          <p className="text-xs text-slate-400">
            Track daily milestones, bills, and simulate stepping forward in time.
          </p>
        </div>

        {/* Advance Day Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentDay >= 30}
            onClick={() => {
              sounds.playClick();
              onAdvanceDay('zero');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-all"
            title="Advance 1 day with ₹0 spent (Frugal Day)"
          >
            <span>🌿 ₹0 Spend Day</span>
          </button>

          <button
            disabled={currentDay >= 30}
            onClick={() => {
              sounds.playCoin();
              onAdvanceDay('normal');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
            title="Advance 1 day with typical canteen lunch (₹140)"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Advance Next Day</span>
          </button>
        </div>
      </div>

      {/* Trajectory SVG Area Chart */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300">Runway Forecast Chart (₹10,000 Budget)</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Actual Spend
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-dashed border-cyan-400" />
              Projected Runway
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-0.5 bg-rose-500" />
              ₹0 Danger Line
            </span>
          </div>
        </div>

        {/* SVG Curve */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-36 min-w-[500px]">
            {/* Grid horizontal lines */}
            <line x1={pad} y1={getY(10000)} x2={chartW - pad} y2={getY(10000)} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={pad} y1={getY(5000)} x2={chartW - pad} y2={getY(5000)} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={pad} y1={zeroLineY} x2={chartW - pad} y2={zeroLineY} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Labels on Y */}
            <text x={pad} y={getY(10000) - 4} fill="#64748b" fontSize="9" fontFamily="monospace">₹10K</text>
            <text x={pad} y={getY(5000) - 4} fill="#64748b" fontSize="9" fontFamily="monospace">₹5K</text>
            <text x={pad} y={zeroLineY - 4} fill="#f43f5e" fontSize="9" fontFamily="monospace">₹0</text>

            {/* Projected line */}
            <path
              d={projectPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />

            {/* Historical line */}
            <path
              d={historyPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Current day indicator dot */}
            <circle
              cx={getX(currentDay)}
              cy={getY(liquidBalance)}
              r="5"
              fill="#10b981"
              stroke="#030712"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* 30-Day Calendar Strip */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Click any Day to Travel / Inspect:</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {Math.round((currentDay / TOTAL_DAYS) * 100)}% Month Complete
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {daysArray.map((day) => {
            const isToday = day === currentDay;
            const isPast = day < currentDay;
            const dayData = dailyChanges[day];

            return (
              <button
                key={day}
                onClick={() => {
                  sounds.playClick();
                  onSelectDay(day);
                }}
                className={`p-2 rounded-xl text-center transition-all relative border flex flex-col justify-between h-16 ${
                  isToday
                    ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                    : isPast
                      ? 'bg-slate-900/90 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-mono font-bold ${isToday ? 'text-emerald-300' : 'text-slate-300'}`}>
                    D{day}
                  </span>
                  {dayData.hasBill && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ring-1 ring-cyan-300" title={dayData.billNote} />
                  )}
                </div>

                {/* Day status badge */}
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
