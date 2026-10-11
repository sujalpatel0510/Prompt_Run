import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Transaction, Category } from '../types/finance';
import { ScrollReveal, Magnet } from '../components/ui/Animations';
import { sounds } from '../utils/audio';
import { formatINR } from '../utils/format';

type SortField = 'day' | 'title' | 'amount' | 'type' | 'category' | 'timestamp';
type SortDirection = 'asc' | 'desc';

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

export function TransactionsPage() {
  const {
    transactions,
    handleAddTransaction,
    handleDeleteTransaction,
    currentDay,
  } = useFinancial();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('day');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    day: currentDay,
    title: '',
    amount: '',
    type: 'expense' as 'expense' | 'income',
    category: 'Food & Canteen' as Category,
  });

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s) ||
        t.notes?.toLowerCase().includes(s)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'timestamp' || sortField === 'day') {
        aVal = typeof aVal === 'string' ? new Date(aVal).getTime() : aVal;
        bVal = typeof bVal === 'string' ? new Date(bVal).getTime() : bVal;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    sounds.playClick();

    if (editingTx) {
      // For edit, we'd need an update function in context - for now delete and re-add
      handleDeleteTransaction(editingTx.id);
    }

    handleAddTransaction({
      day: formData.day,
      title: formData.title,
      amount,
      type: formData.type,
      category: formData.category,
    });

    setFormData({ day: currentDay, title: '', amount: '', type: 'expense', category: 'Food & Canteen' });
    setEditingTx(null);
    setShowModal(false);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      day: tx.day,
      title: tx.title,
      amount: tx.amount.toString(),
      type: tx.type,
      category: tx.category,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      sounds.playClick();
      handleDeleteTransaction(id);
    }
  };

  const resetForm = () => {
    setFormData({ day: currentDay, title: '', amount: '', type: 'expense', category: 'Food & Canteen' });
    setEditingTx(null);
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <ScrollReveal direction="up" distance={30}>
        <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Transactions</h1>
              <p className="text-sm text-slate-400 mt-1">Track every rupee — add, edit, filter, and analyze your spending</p>
            </div>
            <Magnet padding={15} strength={3}>
              <button
                onClick={() => { sounds.playClick(); resetForm(); setShowModal(true); }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </Magnet>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Income</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(totalIncome)}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Expenses</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{formatINR(totalExpense)}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Net Flow</p>
              <p className={`text-2xl font-bold mt-1 ${totalIncome >= totalExpense ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatINR(totalIncome - totalExpense)}
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search transactions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-premium pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                className="select-premium w-36"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="select-premium w-44"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  {[
                    { key: 'day', label: 'Day' },
                    { key: 'title', label: 'Title' },
                    { key: 'category', label: 'Category' },
                    { key: 'type', label: 'Type' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'timestamp', label: 'Date' },
                    { key: 'actions', label: '' },
                  ].map(col => (
                    <th key={col.key} className="pb-3 px-2 cursor-pointer hover:text-white"
                        onClick={() => col.key !== 'actions' && handleSort(col.key as SortField)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.key && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTransactions.map((tx, idx) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-800/30 hover:bg-slate-900/50"
                    >
                      <td className="py-3 px-2 font-mono text-slate-300">Day {tx.day}</td>
                      <td className="py-3 px-2 text-white font-medium">{tx.title}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                          tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {tx.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className={`py-3 px-2 font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '−'}{formatINR(tx.amount)}
                      </td>
                      <td className="py-3 px-2 text-slate-400 font-mono">
                        {new Date(tx.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1 justify-end">
                          <Magnet padding={8} strength={4}>
                            <button
                              onClick={() => handleEdit(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              aria-label="Edit transaction"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </Magnet>
                          <Magnet padding={8} strength={4}>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Magnet>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No transactions found. Add your first one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Add/Edit Modal */}
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
                <h3 className="text-lg font-bold text-white">{editingTx ? 'Edit Transaction' : 'Add Transaction'}</h3>
                <button onClick={() => { sounds.playClick(); setShowModal(false); resetForm(); }} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Day</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.day}
                      onChange={e => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
                      className="input-premium font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                      className="select-premium"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Lunch at canteen, Freelance payout"
                    className="input-premium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="input-premium font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                      className="select-premium"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <button type="button" onClick={() => { sounds.playClick(); setShowModal(false); resetForm(); }} className="btn-ghost px-5">Cancel</button>
                  <Magnet padding={15} strength={3}>
                    <button type="submit" className="btn-primary">{editingTx ? 'Save Changes' : 'Add Transaction'}</button>
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