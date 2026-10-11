import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Transaction, Category, CategoryBudget } from '../types/finance';
import { ScrollReveal, Magnet } from '../components/ui/Animations';
import { sounds } from '../utils/audio';
import { formatINR } from '../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CATEGORIES: Category[] = [
  'Food & Canteen',
  'Cafe & Boba',
  'Travel & Metro',
  'Study & Supplies',
  'Shopping & Fashion',
  'Entertainment & Party',
  'Bills & Utilities',
  'Health & Emergency',
  'Freelance & Income',
  'Savings Lock',
];

const CATEGORY_COLORS: Record<Category, string> = {
  'Food & Canteen': '#10b981',
  'Cafe & Boba': '#06b6d4',
  'Travel & Metro': '#8b5cf6',
  'Study & Supplies': '#f59e0b',
  'Shopping & Fashion': '#ec4899',
  'Entertainment & Party': '#f97316',
  'Bills & Utilities': '#64748b',
  'Health & Emergency': '#ef4444',
  'Freelance & Income': '#22c55e',
  'Savings Lock': '#a855f7',
};

export function BudgetPlannerPage() {
  const {
    transactions,
    currentDay,
    liquidBalance,
    metrics,
    handleAddTransaction,
    handleDeleteTransaction,
  } = useFinancial();

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('kuberz_budgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return CATEGORIES.filter(c => c !== 'Freelance & Income' && c !== 'Savings Lock').map(c => ({
          category: c,
          planned: 0,
        }));
      }
    }
    return CATEGORIES.filter(c => c !== 'Freelance & Income' && c !== 'Savings Lock').map(c => ({
      category: c,
      planned: 0,
    }));
  });

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({ category: '', planned: '' });

  useEffect(() => {
    localStorage.setItem('kuberz_budgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  const actualSpending = useMemo(() => {
    const spending: Record<Category, number> = {} as Record<Category, number>;
    CATEGORIES.forEach(c => { spending[c] = 0; });

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });

    return spending;
  }, [transactions]);

  const budgetData = useMemo(() => {
    return categoryBudgets.map(b => ({
      category: b.category,
      planned: b.planned,
      actual: actualSpending[b.category] || 0,
      remaining: Math.max(0, b.planned - (actualSpending[b.category] || 0)),
      percentage: b.planned > 0 ? Math.min(100, Math.round(((actualSpending[b.category] || 0) / b.planned) * 100)) : 0,
      isOver: (actualSpending[b.category] || 0) > b.planned && b.planned > 0,
    }));
  }, [categoryBudgets, actualSpending]);

  const totalPlanned = budgetData.reduce((sum, b) => sum + b.planned, 0);
  const totalActual = budgetData.reduce((sum, b) => sum + b.actual, 0);
  const totalRemaining = budgetData.reduce((sum, b) => sum + b.remaining, 0);
  const overBudgetCount = budgetData.filter(b => b.isOver).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.planned) return;

    const planned = parseFloat(formData.planned);
    if (isNaN(planned) || planned < 0) return;

    sounds.playClick();

    if (editingBudget) {
      setCategoryBudgets(prev => prev.map(b =>
        b.category === editingBudget ? { ...b, planned } : b
      ));
    } else {
      setCategoryBudgets(prev => [
        ...prev.filter(b => b.category !== formData.category),
        { category: formData.category as Category, planned },
      ]);
    }

    setFormData({ category: '', planned: '' });
    setEditingBudget(null);
    setShowModal(false);
  };

  const handleEdit = (cat: CategoryBudget) => {
    setEditingBudget(cat.category);
    setFormData({ category: cat.category, planned: cat.planned.toString() });
    setShowModal(true);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Remove budget for ${category}?`)) {
      sounds.playClick();
      setCategoryBudgets(prev => prev.filter(b => b.category !== category));
    }
  };

  const availableCategories = CATEGORIES.filter(
    c => c !== 'Freelance & Income' && c !== 'Savings Lock' &&
    !categoryBudgets.some(b => b.category === c)
  );

  return (
    <div className="space-y-6">
      <ScrollReveal direction="up" distance={30}>
        <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Budget Planner</h1>
              <p className="text-sm text-slate-400 mt-1">Set category budgets, track actual vs planned, and stay on target</p>
            </div>
            <Magnet padding={15} strength={3}>
              <button
                onClick={() => { sounds.playClick(); setFormData({ category: '', planned: '' }); setEditingBudget(null); setShowModal(true); }}
                className="btn-primary flex items-center gap-2"
                disabled={availableCategories.length === 0}
              >
                <Plus className="w-4 h-4" />
                Add Category Budget
              </button>
            </Magnet>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Budgeted</p>
              <p className="text-2xl font-bold text-white mt-1">{formatINR(totalPlanned)}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Actual Spending</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{formatINR(totalActual)}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Remaining</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(totalRemaining)}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Over Budget</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{overBudgetCount} categories</p>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData.filter(b => b.planned > 0)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} width={140} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [formatINR(Number(value ?? 0)), '']}
                />
                <Bar dataKey="planned" name="Budgeted" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={24} />
                <Bar dataKey="actual" name="Actual" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget List */}
          <div className="space-y-3">
            {budgetData.filter(b => b.planned > 0).map((b, idx) => (
              <motion.div
                key={b.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel rounded-2xl p-4 border border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[b.category] + '20' }}
                  >
                    <span className="text-xl">{getCategoryIcon(b.category)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white truncate">{b.category}</h4>
                      {b.isOver && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500/20 text-rose-400 font-bold">
                          Over Budget
                        </span>
                      )}
                      {b.planned > 0 && b.actual === 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          On Track
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, b.percentage)}%` }}
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: b.isOver ? '#ef4444' : '#10b981',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:w-80 sm:flex-shrink-0">
                  <div className="text-right w-28">
                    <p className="text-xs text-slate-400">Budgeted</p>
                    <p className="font-bold text-white font-mono">{formatINR(b.planned)}</p>
                  </div>
                  <div className="text-right w-28">
                    <p className="text-xs text-slate-400">Spent</p>
                    <p className={`font-bold font-mono ${b.isOver ? 'text-rose-400' : 'text-white'}`}>
                      {formatINR(b.actual)}
                    </p>
                  </div>
                  <div className="text-right w-28">
                    <p className="text-xs text-slate-400">Left</p>
                    <p className="font-bold text-emerald-400 font-mono">{formatINR(b.remaining)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Magnet padding={8} strength={4}>
                      <button onClick={() => handleEdit(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" aria-label="Edit budget">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </Magnet>
                    <Magnet padding={8} strength={4}>
                      <button onClick={() => handleDelete(b.category)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10" aria-label="Delete budget">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Magnet>
                  </div>
                </div>
              </motion.div>
            ))}

            {budgetData.filter(b => b.planned > 0).length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg font-medium mb-2">No budgets set yet</p>
                <p className="text-sm">Add category budgets to track your spending against targets</p>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Daily Allowance Calculator */}
      <ScrollReveal direction="up" distance={30} delay={0.1}>
        <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            Daily Allowance Calculator
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Liquid Balance</p>
              <p className="text-3xl font-bold text-white mt-1">{formatINR(liquidBalance)}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Safe Daily Allowance</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{formatINR(metrics.safeDailyAllowance)}</p>
              <p className="text-xs text-slate-500 mt-1">for {31 - currentDay} days remaining</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Projected Month-End</p>
              <p className={`text-3xl font-bold mt-1 ${metrics.projectedEOMBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatINR(metrics.projectedEOMBalance)}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Budget Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel-elevated w-full max-w-md rounded-3xl p-6 border border-slate-700/60"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">{editingBudget ? 'Edit Budget' : 'Add Category Budget'}</h3>
                <button onClick={() => { sounds.playClick(); setShowModal(false); setFormData({ category: '', planned: '' }); }} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="select-premium"
                    disabled={!!editingBudget}
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Budgeted Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formData.planned}
                    onChange={e => setFormData({ ...formData, planned: e.target.value })}
                    className="input-premium font-mono"
                    placeholder="e.g. 2000"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <button type="button" onClick={() => { sounds.playClick(); setShowModal(false); setFormData({ category: '', planned: '' }); }} className="btn-ghost px-5">Cancel</button>
                  <Magnet padding={15} strength={3}>
                    <button type="submit" className="btn-primary">{editingBudget ? 'Save Changes' : 'Add Budget'}</button>
                  </Magnet>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getCategoryIcon(category: Category): string {
  const icons: Record<Category, string> = {
    'Food & Canteen': '🍛',
    'Cafe & Boba': '🧋',
    'Travel & Metro': '🚇',
    'Study & Supplies': '📚',
    'Shopping & Fashion': '🛍️',
    'Entertainment & Party': '🎮',
    'Bills & Utilities': '💡',
    'Health & Emergency': '🏥',
    'Freelance & Income': '💻',
    'Savings Lock': '🔒',
  };
  return icons[category] || '📦';
}