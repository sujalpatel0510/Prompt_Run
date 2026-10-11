import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Transaction,
  Commitment,
  Subscription,
  SavingsGoal,
  LifeEvent,
  SimulationParams,
} from '../types/finance';
import {
  INITIAL_COMMITMENTS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import { calculateMetrics, INITIAL_BUDGET } from '../utils/engine';
import { sounds } from '../utils/audio';

interface FinancialContextValue {
  // State
  currentDay: number;
  setCurrentDay: React.Dispatch<React.SetStateAction<number>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  commitments: Commitment[];
  setCommitments: React.Dispatch<React.SetStateAction<Commitment[]>>;
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  savingsGoals: SavingsGoal[];
  setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;

  // Derived
  metrics: ReturnType<typeof calculateMetrics>;
  liquidBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavingsLocked: number;

  // Actions
  handleAddTransaction: (newTx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  handleDeleteTransaction: (id: string) => void;
  handleToggleSubscription: (id: string) => void;
  handleToggleCommitmentPaid: (id: string) => void;
  handleDepositGoal: (goalId: string, amount: number) => void;
  handleWithdrawGoal: (goalId: string, amount: number) => void;
  handleAddGoal: (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  handleCommitDecision: (decision: SimulationParams) => void;
  handleApplyLifeEvent: (event: LifeEvent, accepted: boolean) => void;
  handleResetData: () => void;
  handleLoadScenario: (scenario: 'baseline' | 'day1' | 'crisis' | 'frugal') => void;
  handleAdvanceDay: (mode: 'normal' | 'zero') => void;
}

const FinancialContext = createContext<FinancialContextValue | null>(null);

function readStored<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    const parsed: unknown = JSON.parse(saved);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const isArray = Array.isArray;

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [currentDay, setCurrentDay] = useState<number>(() =>
    readStored('kuberz_day', 8, (v): v is number => typeof v === 'number' && Number.isFinite(v))
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readStored<Transaction[]>('kuberz_txs', INITIAL_TRANSACTIONS, isArray)
  );

  const [commitments, setCommitments] = useState<Commitment[]>(() =>
    readStored<Commitment[]>('kuberz_commitments', INITIAL_COMMITMENTS, isArray)
  );

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    readStored<Subscription[]>('kuberz_subs', INITIAL_SUBSCRIPTIONS, isArray)
  );

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    readStored<SavingsGoal[]>('kuberz_goals', INITIAL_SAVINGS_GOALS, isArray)
  );

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() =>
    readStored('kuberz_sound', true, (v): v is boolean => typeof v === 'boolean')
  );

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

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

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

  const handleAddTransaction = useCallback((newTx: Omit<Transaction, 'id' | 'timestamp'>) => {
    setTransactions(prev => [
      ...prev,
      {
        ...newTx,
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleToggleSubscription = useCallback((id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }, []);

  const handleToggleCommitmentPaid = useCallback((id: string) => {
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, isPaid: !c.isPaid } : c));
  }, []);

  const handleDepositGoal = useCallback((goalId: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
  }, []);

  const handleWithdrawGoal = useCallback((goalId: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));
  }, []);

  const handleAddGoal = useCallback((newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    setSavingsGoals(prev => [
      ...prev,
      {
        ...newGoal,
        id: `goal-${Date.now()}`,
        currentAmount: 0,
      },
    ]);
  }, []);

  const handleCommitDecision = useCallback((decision: SimulationParams) => {
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
      if (savingsGoals.length > 0) {
        setSavingsGoals(prev => prev.map((g, i) => i === 0 ? { ...g, currentAmount: g.currentAmount + decision.amount } : g));
      }
    } else if (decision.type === 'subscription_toggle') {
      setSubscriptions(prev => prev.map(s => {
        if (s.title.toLowerCase().includes(decision.title.toLowerCase())) {
          return { ...s, active: !s.active };
        }
        return s;
      }));
    }
  }, [currentDay, savingsGoals]);

  const handleApplyLifeEvent = useCallback((event: LifeEvent, accepted: boolean) => {
    if (!accepted && event.type === 'expense') return;
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
  }, [currentDay]);

  const handleResetData = useCallback(() => {
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
  }, []);

  const handleLoadScenario = useCallback((scenario: 'baseline' | 'day1' | 'crisis' | 'frugal') => {
    if (scenario === 'day1') {
      setCurrentDay(1);
      setTransactions([]);
      setSavingsGoals(INITIAL_SAVINGS_GOALS.map(g => ({ ...g, currentAmount: 0 })));
    } else if (scenario === 'crisis') {
      setCurrentDay(15);
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
  }, [handleResetData]);

  const handleAdvanceDay = useCallback((mode: 'normal' | 'zero') => {
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
  }, [currentDay]);

  const value: FinancialContextValue = {
    currentDay,
    setCurrentDay,
    transactions,
    setTransactions,
    commitments,
    setCommitments,
    subscriptions,
    setSubscriptions,
    savingsGoals,
    setSavingsGoals,
    soundEnabled,
    setSoundEnabled,
    metrics,
    liquidBalance,
    totalIncome,
    totalExpense,
    totalSavingsLocked,
    handleAddTransaction,
    handleDeleteTransaction,
    handleToggleSubscription,
    handleToggleCommitmentPaid,
    handleDepositGoal,
    handleWithdrawGoal,
    handleAddGoal,
    handleCommitDecision,
    handleApplyLifeEvent,
    handleResetData,
    handleLoadScenario,
    handleAdvanceDay,
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}