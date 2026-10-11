import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { ScrollReveal, Magnet } from '../components/ui/Animations';
import { formatINR } from '../utils/format';

export function CommitmentsPage() {
  const {
    commitments,
    handleToggleCommitmentPaid,
    currentDay,
    metrics,
  } = useFinancial();

  const upcoming = commitments.filter(c => !c.isPaid && c.dueDay >= currentDay);
  const overdue = commitments.filter(c => !c.isPaid && c.dueDay < currentDay);
  const paid = commitments.filter(c => c.isPaid);

  const totalUpcoming = upcoming.reduce((sum, c) => sum + c.amount, 0);
  const totalOverdue = overdue.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = paid.reduce((sum, c) => sum + c.amount, 0);

  const formatDay = (day: number) => `Day ${day}`;

  return (
    <div className="space-y-6">
      <ScrollReveal direction="up" distance={30}>
        <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Financial Commitments</h1>
              <p className="text-sm text-slate-400 mt-1">Track rent, bills, and planned purchases with due dates</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Overdue</p>
                  <p className="text-xl font-bold text-rose-400">{formatINR(totalOverdue)}</p>
                </div>
              </div>
              {overdue.length > 0 && <p className="text-xs text-slate-500 mt-1">{overdue.length} commitment{overdue.length !== 1 ? 's' : ''} past due</p>}
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Upcoming</p>
                  <p className="text-xl font-bold text-amber-400">{formatINR(totalUpcoming)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{upcoming.length} commitment{upcoming.length !== 1 ? 's' : ''} due</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Paid This Month</p>
                  <p className="text-xl font-bold text-emerald-400">{formatINR(totalPaid)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{paid.length} commitment{paid.length !== 1 ? 's' : ''} completed</p>
            </div>
          </div>

          {/* Overdue Section */}
          {overdue.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Overdue Commitments
              </h3>
              <div className="space-y-2">
                {overdue.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel rounded-xl p-4 border border-rose-500/30 bg-rose-500/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-500/10">
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{c.title}</h4>
                        <p className="text-xs text-slate-400">{formatDay(c.dueDay)} • {c.category} • {c.isEssential ? 'Essential' : 'Optional'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-400 font-mono">{formatINR(c.amount)}</span>
                      <Magnet padding={8} strength={4}>
                        <button
                          onClick={() => handleToggleCommitmentPaid(c.id)}
                          className="btn-secondary bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-sm px-3 py-1.5"
                        >
                          Mark Paid
                        </button>
                      </Magnet>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Commitments
            </h3>
            <div className="space-y-2">
              {upcoming.length > 0 ? (
                upcoming.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-xl p-4 border border-slate-800/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${c.isEssential ? 'bg-amber-500/10' : 'bg-slate-800/50'}`}>
                        <Calendar className={`w-5 h-5 ${c.isEssential ? 'text-amber-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{c.title}</h4>
                        <p className="text-xs text-slate-400">{formatDay(c.dueDay)} • {c.category} • {c.isEssential ? 'Essential' : 'Optional'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 font-mono">{formatINR(c.amount)}</span>
                      <Magnet padding={8} strength={4}>
                        <button
                          onClick={() => handleToggleCommitmentPaid(c.id)}
                          className="btn-secondary bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-sm px-3 py-1.5"
                        >
                          Mark Paid
                        </button>
                      </Magnet>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-lg font-medium mb-1">No upcoming commitments</p>
                  <p className="text-sm">Add bills, rent, or planned purchases to track them</p>
                </div>
              )}
            </div>
          </div>

          {/* Paid Section */}
          {paid.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Paid This Month
              </h3>
              <div className="space-y-2">
                {paid.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-xl p-4 border border-slate-800/50 opacity-60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{c.title}</h4>
                        <p className="text-xs text-slate-400">{formatDay(c.dueDay)} • {c.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 font-mono">{formatINR(c.amount)}</span>
                      <Magnet padding={8} strength={4}>
                        <button
                          onClick={() => handleToggleCommitmentPaid(c.id)}
                          className="btn-secondary bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 text-sm px-3 py-1.5"
                        >
                          Mark Unpaid
                        </button>
                      </Magnet>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Impact on Daily Allowance */}
      <ScrollReveal direction="up" distance={30} delay={0.1}>
        <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            Impact on Your Budget
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Committed Upcoming</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{formatINR(totalUpcoming)}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Safe Daily After Commitments</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(metrics.safeDailyAllowance)}</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}