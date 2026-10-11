import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Target, 
  PieChart, 
  Bot, 
  Layers, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  Transaction, 
  Commitment, 
  Subscription, 
  SavingsGoal, 
  LifeEvent, 
  SimulationParams 
} from './types/finance';
import { 
  INITIAL_COMMITMENTS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_TRANSACTIONS 
} from './data/initialData';
import { calculateMetrics, INITIAL_BUDGET } from './utils/engine';
import { sounds } from './utils/audio';

// UI primitives
import { CustomCursor } from './components/ui/CustomCursor';

// Components
import { Header } from './components/Header';
import { HeroMetrics } from './components/HeroMetrics';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { Timeline30Days } from './components/Timeline30Days';
import { SubscriptionsVault } from './components/SubscriptionsVault';
import { SavingsGoals } from './components/SavingsGoals';
import { BudgetBreakdown } from './components/BudgetBreakdown';
import { VibeCheckAdvisor } from './components/VibeCheckAdvisor';
import { LifeEventModal } from './components/LifeEventModal';
import { ExportModal } from './components/ExportModal';

export function App() {
  const [currentDay, setCurrentDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kuberz_day');
      return saved ? JSON.parse(saved) : 8;
    } catch {
      return 8;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('kuberz_txs');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    try {
      const saved = localStorage.getItem('kuberz_commitments');
      return saved ? JSON.parse(saved) : INITIAL_COMMITMENTS;
    } catch {
      return INITIAL_COMMITMENTS;
    }
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem('kuberz_subs');
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('kuberz_goals');
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kuberz_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Persist state changes purely clientside
  useEffect(() => {
    try {
      localStorage.setItem('kuberz_day', JSON.stringify(currentDay));
      localStorage.setItem('kuberz_txs', JSON.stringify(transactions));
      localStorage.setItem('kuberz_commitments', JSON.stringify(commitments));
      localStorage.setItem('kuberz_subs', JSON.stringify(subscriptions));
      localStorage.setItem('kuberz_goals', JSON.stringify(savingsGoals));
      localStorage.setItem('kuberz_sound', JSON.stringify(soundEnabled));
    } catch {
      // Storage quota or disabled in iframe
    }
  }, [currentDay, transactions, commitments, subscriptions, savingsGoals, soundEnabled]);

  // Active view tab: 'overview' | 'simulator' | 'timeline' | 'commitments' | 'goals'
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'timeline' | 'commitments' | 'goals'>('overview');


  // Modals
  const [isLifeEventOpen, setIsLifeEventOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Sync sound settings
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Compute live interconnected metrics
  const metrics = calculateMetrics({
    currentDay,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavingsLocked = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const liquidBalance = INITIAL_BUDGET + totalIncome - totalExpense - totalSavingsLocked;

  // Toggle Sound
  const handleToggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Reset to default
  const handleResetData = () => {
    try {
      localStorage.removeItem('kuberz_day');
      localStorage.removeItem('kuberz_txs');
      localStorage.removeItem('kuberz_commitments');
      localStorage.removeItem('kuberz_subs');
      localStorage.removeItem('kuberz_goals');
    } catch {
      // Ignore
    }
    setCurrentDay(8);
    setTransactions(INITIAL_TRANSACTIONS);
    setCommitments(INITIAL_COMMITMENTS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
  };


  // Preset Scenario Switcher
  const handleLoadScenario = (scenario: 'baseline' | 'day1' | 'crisis' | 'frugal') => {
    if (scenario === 'day1') {
      setCurrentDay(1);
      setTransactions([]);
      setSavingsGoals(INITIAL_SAVINGS_GOALS.map(g => ({ ...g, currentAmount: 0 })));
    } else if (scenario === 'crisis') {
      setCurrentDay(15);
      // High spend scenario
      setTransactions([
        ...INITIAL_TRANSACTIONS,
        {
          id: 'crisis-1',
          day: 9,
          title: 'Weekend Club Party Entry & Drinks',
          amount: 2200,
          type: 'expense',
          category: 'Entertainment & Party',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'crisis-2',
          day: 12,
          title: 'Impulsive Shopping Cart Checkout',
          amount: 1800,
          type: 'expense',
          category: 'Shopping & Fashion',
          timestamp: new Date().toISOString(),
        },
      ]);
    } else if (scenario === 'frugal') {
      setCurrentDay(10);
      setTransactions([
        {
          id: 'f-1',
          day: 2,
          title: 'Metro Pass Monthly',
          amount: 400,
          type: 'expense',
          category: 'Travel & Metro',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'f-2',
          day: 5,
          title: 'Grocery Rice & Veggies Batch Cook',
          amount: 450,
          type: 'expense',
          category: 'Food & Canteen',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'f-3',
          day: 8,
          title: 'Weekend Freelance Design Payout',
          amount: 1500,
          type: 'income',
          category: 'Freelance & Income',
          timestamp: new Date().toISOString(),
        },
      ]);
      setSavingsGoals(INITIAL_SAVINGS_GOALS.map(g => ({ ...g, currentAmount: g.targetAmount * 0.8 })));
    } else {
      handleResetData();
    }
  };

  // Advance Day
  const handleAdvanceDay = (mode: 'normal' | 'zero') => {
    if (currentDay >= 30) return;
    const nextDay = currentDay + 1;
    setCurrentDay(nextDay);

    if (mode === 'normal') {
      setTransactions(prev => [
        ...prev,
        {
          id: `daily-${nextDay}-${Date.now()}`,
          day: nextDay,
          title: `Day ${nextDay} Campus Meals & Transit`,
          amount: 140,
          type: 'expense',
          category: 'Food & Canteen',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  // Commit Decision from What-If Simulator
  const handleCommitDecision = (decision: SimulationParams) => {
    if (decision.type === 'expense' || decision.type === 'income') {
      setTransactions(prev => [
        ...prev,
        {
          id: `tx-${Date.now()}`,
          day: currentDay,
          title: decision.title,
          amount: decision.amount,
          type: decision.type as 'expense' | 'income',
          category: decision.category,
          timestamp: new Date().toISOString(),
        },
      ]);
    } else if (decision.type === 'savings_deposit') {
      // Deposit into first available goal
      if (savingsGoals.length > 0) {
        setSavingsGoals(prev => prev.map((g, i) => i === 0 ? { ...g, currentAmount: g.currentAmount + decision.amount } : g));
      }
    } else if (decision.type === 'subscription_toggle') {
      // Toggle targeted subscription
      setSubscriptions(prev => prev.map(s => {
        if (s.title.toLowerCase().includes(decision.title.toLowerCase())) {
          return { ...s, active: !s.active };
        }
        return s;
      }));
    }
  };

  // Direct Transaction Logging
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'timestamp'>) => {
    setTransactions(prev => [
      ...prev,
      {
        ...newTx,
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Subscription & Commitment actions
  const handleToggleSubscription = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleToggleCommitmentPaid = (id: string) => {
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, isPaid: !c.isPaid } : c));
  };

  // Goals actions
  const handleDepositGoal = (goalId: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  const handleWithdrawGoal = (goalId: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    setSavingsGoals(prev => [
      ...prev,
      {
        ...newGoal,
        id: `goal-${Date.now()}`,
        currentAmount: 0,
      },
    ]);
  };

  // Life Event execution
  const handleApplyLifeEvent = (event: LifeEvent, accepted: boolean) => {
    if (!accepted && event.type === 'expense') return; // User skipped FOMO

    setTransactions(prev => [
      ...prev,
      {
        id: `event-${Date.now()}`,
        day: currentDay,
        title: `⚡ ${event.title}`,
        amount: event.amount,
        type: event.type,
        category: event.type === 'income' ? 'Freelance & Income' : 'Health & Emergency',
        timestamp: new Date().toISOString(),
        notes: event.description,
      },
    ]);
  };

  return (
    <div className="relative isolate min-h-screen text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <CustomCursor />

      {/* Ambient background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-purple-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(16,185,129,0.08),transparent_55%)]" />
      </div>

      {/* Top Application Header */}
      <Header
        currentDay={currentDay}
        onSetDay={setCurrentDay}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenLifeEvent={() => setIsLifeEventOpen(true)}
        onResetData={handleResetData}
        onLoadScenario={handleLoadScenario}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Hero Cockpit */}
        <HeroMetrics
          currentDay={currentDay}
          liquidBalance={liquidBalance}
          metrics={metrics}
        />

        {/* View Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
            {[
              { id: 'overview', label: 'All-In-One Cockpit', icon: Layers },
              { id: 'simulator', label: 'What-If Simulator', icon: Sparkles, badge: 'Core' },
              { id: 'timeline', label: '30-Day Timeline', icon: Calendar },
              { id: 'commitments', label: 'Subscriptions & Bills', icon: CreditCard },
              { id: 'goals', label: 'Savings Goals', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-slate-950 text-emerald-400' : 'bg-indigo-500/20 text-indigo-300'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Gen-Z Financial Engine Active</span>
          </div>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <WhatIfSimulator
              currentDay={currentDay}
              transactions={transactions}
              commitments={commitments}
              subscriptions={subscriptions}
              savingsGoals={savingsGoals}
              onCommitDecision={handleCommitDecision}
            />
            <VibeCheckAdvisor
              currentDay={currentDay}
              liquidBalance={liquidBalance}
              metrics={metrics}
              subscriptions={subscriptions}
              transactions={transactions}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <Timeline30Days
              currentDay={currentDay}
              onSelectDay={setCurrentDay}
              onAdvanceDay={handleAdvanceDay}
              transactions={transactions}
              commitments={commitments}
              subscriptions={subscriptions}
              liquidBalance={liquidBalance}
              projectedEOMBalance={metrics.projectedEOMBalance}
              safeDailyAllowance={metrics.safeDailyAllowance}
            />
            <BudgetBreakdown
              currentDay={currentDay}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {activeTab === 'commitments' && (
          <div className="space-y-6">
            <SubscriptionsVault
              currentDay={currentDay}
              subscriptions={subscriptions}
              commitments={commitments}
              onToggleSubscription={handleToggleSubscription}
              onToggleCommitmentPaid={handleToggleCommitmentPaid}
            />
            <WhatIfSimulator
              currentDay={currentDay}
              transactions={transactions}
              commitments={commitments}
              subscriptions={subscriptions}
              savingsGoals={savingsGoals}
              onCommitDecision={handleCommitDecision}
            />
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <SavingsGoals
              savingsGoals={savingsGoals}
              liquidBalance={liquidBalance}
              onDepositGoal={handleDepositGoal}
              onWithdrawGoal={handleWithdrawGoal}
              onAddGoal={handleAddGoal}
            />
            <VibeCheckAdvisor
              currentDay={currentDay}
              liquidBalance={liquidBalance}
              metrics={metrics}
              subscriptions={subscriptions}
              transactions={transactions}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* The Flagship What-If Simulator right upfront */}
            <WhatIfSimulator
              currentDay={currentDay}
              transactions={transactions}
              commitments={commitments}
              subscriptions={subscriptions}
              savingsGoals={savingsGoals}
              onCommitDecision={handleCommitDecision}
            />

            {/* 30-Day Timeline & Trajectory Chart */}
            <Timeline30Days
              currentDay={currentDay}
              onSelectDay={setCurrentDay}
              onAdvanceDay={handleAdvanceDay}
              transactions={transactions}
              commitments={commitments}
              subscriptions={subscriptions}
              liquidBalance={liquidBalance}
              projectedEOMBalance={metrics.projectedEOMBalance}
              safeDailyAllowance={metrics.safeDailyAllowance}
            />

            {/* Subscriptions & Fixed Commitments */}
            <SubscriptionsVault
              currentDay={currentDay}
              subscriptions={subscriptions}
              commitments={commitments}
              onToggleSubscription={handleToggleSubscription}
              onToggleCommitmentPaid={handleToggleCommitmentPaid}
            />

            {/* Savings Goals Vault */}
            <SavingsGoals
              savingsGoals={savingsGoals}
              liquidBalance={liquidBalance}
              onDepositGoal={handleDepositGoal}
              onWithdrawGoal={handleWithdrawGoal}
              onAddGoal={handleAddGoal}
            />

            {/* Spending Breakdown & Ledger */}
            <BudgetBreakdown
              currentDay={currentDay}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />

            {/* Gen-Z AI Roaster & Advisor */}
            <VibeCheckAdvisor
              currentDay={currentDay}
              liquidBalance={liquidBalance}
              metrics={metrics}
              subscriptions={subscriptions}
              transactions={transactions}
            />
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative w-full border-t border-slate-800/70 bg-slate-950/70 backdrop-blur-xl py-6 px-4 lg:px-8 mt-12 text-center text-xs text-slate-500 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Kuber<span className="text-emerald-400">Z</span> Financial Engine</span>
            <span className="text-slate-600">•</span>
            <span>Built for PROMPT RUN 2026 Hackathon</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Automated Evaluation Ready • React 19 + TypeScript + Tailwind</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LifeEventModal
        isOpen={isLifeEventOpen}
        onClose={() => setIsLifeEventOpen(false)}
        onApplyEvent={handleApplyLifeEvent}
        currentDay={currentDay}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentDay={currentDay}
        liquidBalance={liquidBalance}
        metrics={metrics}
        transactions={transactions}
        savingsGoals={savingsGoals}
      />
    </div>
  );
}

export default App;
