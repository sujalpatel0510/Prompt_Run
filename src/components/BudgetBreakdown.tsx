'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  PieChart,
  ListOrdered,
  Plus,
  Trash2,
  Search,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Transaction, Category } from '../types/finance';
import { sounds } from '../utils/audio';
import { ScrollReveal } from './ui/Animations';

interface BudgetBreakdownProps {
  currentDay: number;
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({
  currentDay,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number>(150);
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newCategory, setNewCategory] = useState<Category>('Food & Canteen');

  const prefersReducedMotion = useReducedMotion();

  const categoryExpenses: Record<string, number> = {};
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      totalExpenses += tx.amount;
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    }
  });

  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);

  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedFilterCategory === 'all' || tx.category === selectedFilterCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => b.day - a.day);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newAmount <= 0) return;

    sounds.playCoin();
    onAddTransaction({
      day: currentDay,
      title: newTitle,
      amount: newAmount,
      type: newType,
      category: newCategory,
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <ScrollReveal direction="up" distance={40} delay={0.1}>
      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/80">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              Spending Distribution & Ledger
            </div>
            <h3 className="text-xl font-extrabold text-white">Category Breakdown & Transactions</h3>
            <p className="text-xs text-slate-400">
              Total Spent so far:{' '}
              <strong className="text-white font-mono">₹{totalExpenses.toLocaleString()}</strong> across{' '}
              {transactions.length} entries.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sounds.playClick();
              setShowAddForm(!showAddForm);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold self-start sm:self-auto transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Log Expense / Income'}</span>
          </motion.button>
        </div>

        {/* Quick Add Form Drawer */}
        <AnimatePresence initial={false}>
          {showAddForm && (
            <motion.form
              key="add-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Log Real Transaction (Recorded on Day {currentDay})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Type</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-800 p-0.5 bg-slate-950">
                      <button
                        type="button"
                        onClick={() => setNewType('expense')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                          newType === 'expense' ? 'bg-rose-500 text-on-solid' : 'text-slate-400'
                        }`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewType('income')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                          newType === 'income' ? 'bg-emerald-500 text-on-accent' : 'text-slate-400'
                        }`}
                      >
                        Income
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Title / Memo</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swiggy Momos, Metro pass"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="input-premium !py-2 !text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(parseInt(e.target.value) || 0)}
                      className="input-premium !py-2 !text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-400">Category:</label>
                    <select
                      aria-label="Transaction Category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Category)}
                      className="select-premium !w-auto !py-1.5 !text-xs"
                    >
                      {[
                        'Food & Canteen',
                        'Cafe & Boba',
                        'Travel & Metro',
                        'Study & Supplies',
                        'Shopping & Fashion',
                        'Entertainment & Party',
                        'Bills & Utilities',
                        'Health & Emergency',
                        'Freelance & Income',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn-primary self-end">
                    Add to Ledger
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Grid: Category Progress Bars (Left) & Transaction List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5" />
              Top Spend Categories
            </div>

            <div className="space-y-3">
              {sortedCategories.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No expenses logged yet.</p>
              ) : (
                sortedCategories.map(([category, amount], idx) => {
                  const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">{category}</span>
                        <span className="font-mono text-slate-400">
                          ₹{amount.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          viewport={{ once: true }}
                          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Transaction Ledger Table (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
            <div>
              {/* Search & Filter Bar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <select
                  aria-label="Filter by Category"
                  value={selectedFilterCategory}
                  onChange={(e) => setSelectedFilterCategory(e.target.value)}
                  className="select-premium !w-auto !py-1.5 !text-xs"
                >
                  <option value="all">All Categories</option>
                  <option value="Food & Canteen">Food</option>
                  <option value="Cafe & Boba">Cafe</option>
                  <option value="Travel & Metro">Travel</option>
                  <option value="Study & Supplies">Study</option>
                  <option value="Shopping & Fashion">Shopping</option>
                  <option value="Entertainment & Party">Fun</option>
                  <option value="Freelance & Income">Income</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No matching transactions found.
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/70 hover:border-slate-700 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              tx.type === 'expense'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {tx.type === 'expense' ? (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white line-clamp-1">{tx.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span className="font-mono text-indigo-400 font-bold">D{tx.day}</span>
                              <span>•</span>
                              <span>{tx.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono font-bold ${
                              tx.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              sounds.playClick();
                              onDeleteTransaction(tx.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};
