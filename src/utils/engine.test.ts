import { describe, it, expect } from 'vitest';
import {
  calculateMetrics,
  simulateDecision,
  INITIAL_BUDGET,
  TOTAL_DAYS,
  IDEAL_DAILY_BASELINE,
} from './engine';
import type {
  Transaction,
  Commitment,
  Subscription,
  SavingsGoal,
  Category,
} from '../types/finance';

// --- Test factories ---------------------------------------------------------

const makeTransaction = (over: Partial<Transaction> = {}): Transaction => ({
  id: over.id ?? `tx-${Math.random().toString(36).slice(2)}`,
  day: over.day ?? 1,
  title: over.title ?? 'Test',
  amount: over.amount ?? 0,
  type: over.type ?? 'expense',
  category: (over.category ?? 'Food & Canteen') as Category,
  timestamp: over.timestamp ?? new Date().toISOString(),
  ...over,
});

const makeCommitment = (over: Partial<Commitment> = {}): Commitment => ({
  id: over.id ?? 'c1',
  title: over.title ?? 'Hostel Rent',
  amount: over.amount ?? 1000,
  dueDay: over.dueDay ?? 10,
  category: (over.category ?? 'Bills & Utilities') as Category,
  isPaid: over.isPaid ?? false,
  isEssential: over.isEssential ?? true,
  ...over,
});

const makeSubscription = (over: Partial<Subscription> = {}): Subscription => ({
  id: over.id ?? 's1',
  title: over.title ?? 'Netflix Premium',
  cost: over.cost ?? 500,
  billingDay: over.billingDay ?? 15,
  active: over.active ?? true,
  serviceCategory: over.serviceCategory ?? 'Video',
  icon: over.icon ?? '🎬',
  ...over,
});

const makeGoal = (over: Partial<SavingsGoal> = {}): SavingsGoal => ({
  id: over.id ?? 'g1',
  title: over.title ?? 'Vacation',
  targetAmount: over.targetAmount ?? 5000,
  currentAmount: over.currentAmount ?? 0,
  deadlineDay: over.deadlineDay ?? 30,
  emoji: over.emoji ?? '🏖️',
  color: over.color ?? 'from-emerald-500 to-teal-500',
  ...over,
});

interface MetricsParamsInput {
  currentDay?: number;
  transactions?: Transaction[];
  commitments?: Commitment[];
  subscriptions?: Subscription[];
  savingsGoals?: SavingsGoal[];
}

const emptyParams = (over: MetricsParamsInput = {}) => ({
  currentDay: over.currentDay ?? 1,
  transactions: over.transactions ?? [],
  commitments: over.commitments ?? [],
  subscriptions: over.subscriptions ?? [],
  savingsGoals: over.savingsGoals ?? [],
});

// --- Constants --------------------------------------------------------------

describe('engine constants', () => {
  it('exposes the expected budget envelope', () => {
    expect(INITIAL_BUDGET).toBe(10000);
    expect(TOTAL_DAYS).toBe(30);
    expect(IDEAL_DAILY_BASELINE).toBe(333);
  });
});

// --- calculateMetrics -------------------------------------------------------

describe('calculateMetrics', () => {
  it('computes a healthy baseline on day 1 with no activity', () => {
    const m = calculateMetrics(emptyParams());

    expect(m.totalSavingsLocked).toBe(0);
    expect(m.totalCommittedUpcoming).toBe(0);
    expect(m.burnRatePerDay).toBe(IDEAL_DAILY_BASELINE);
    expect(m.safeDailyAllowance).toBe(333);
    expect(m.isDeficitProjected).toBe(false);
    expect(m.deficitDay).toBeNull();
    expect(m.riskLevel).toBe('Safe');
    expect(m.healthScore).toBe(99);
    expect(m.grade).toBe('S');
  });

  it('reduces the liquid balance and flags a deficit after heavy spending', () => {
    const m = calculateMetrics(
      emptyParams({
        currentDay: 5,
        transactions: [makeTransaction({ day: 5, amount: 5000, category: 'Food & Canteen' })],
      })
    );

    // 10000 starting - 5000 spent
    expect(m.safeDailyAllowance).toBe(192); // floor((10000-5000)/26)
    expect(m.burnRatePerDay).toBe(1000); // 5000 / 5 days
    expect(m.isDeficitProjected).toBe(true);
    expect(m.deficitDay).toBe(10); // day 5 + 5000/1000
    expect(m.riskScore).toBe(88);
    expect(m.riskLevel).toBe('Critical (Cooked)');
    expect(m.healthScore).toBe(90);
    expect(m.grade).toBe('S');
  });

  it('locks savings out of the liquid balance', () => {
    const m = calculateMetrics(
      emptyParams({ savingsGoals: [makeGoal({ currentAmount: 2000, targetAmount: 5000 })] })
    );

    expect(m.totalSavingsLocked).toBe(2000);
    expect(m.safeDailyAllowance).toBe(266); // floor((10000-2000)/30)
  });

  it('reserves upcoming unpaid commitments due from today onward', () => {
    const m = calculateMetrics(
      emptyParams({
        currentDay: 5,
        commitments: [
          makeCommitment({ id: 'c1', amount: 1500, dueDay: 20, isPaid: false }),
          makeCommitment({ id: 'c2', amount: 900, dueDay: 3, isPaid: false }), // already passed
          makeCommitment({ id: 'c3', amount: 700, dueDay: 25, isPaid: true }), // already paid
        ],
      })
    );

    expect(m.totalCommittedUpcoming).toBe(1500);
    expect(m.safeDailyAllowance).toBe(326); // floor((10000-1500)/26)
    expect(m.isDeficitProjected).toBe(false);
  });

  it('counts active subscriptions billing within the horizon', () => {
    const m = calculateMetrics(
      emptyParams({
        currentDay: 5,
        subscriptions: [
          makeSubscription({ id: 's1', cost: 500, billingDay: 15, active: true }),
          makeSubscription({ id: 's2', cost: 400, billingDay: 2, active: true }), // already billed
          makeSubscription({ id: 's3', cost: 300, billingDay: 20, active: false }), // cancelled
        ],
      })
    );

    expect(m.totalCommittedUpcoming).toBe(500);
  });

  it('keeps a full day of runway at the end of the month', () => {
    const day30 = calculateMetrics(emptyParams({ currentDay: 30 }));
    const overdue = calculateMetrics(emptyParams({ currentDay: 31 }));

    expect(day30.safeDailyAllowance).toBe(10000); // remaining days clamped to >= 1
    expect(overdue.safeDailyAllowance).toBe(10000);
  });

  it('crashes the health score and risk level when overdrawn', () => {
    const m = calculateMetrics(
      emptyParams({
        currentDay: 15,
        transactions: [makeTransaction({ day: 15, amount: 20000, category: 'Shopping & Fashion' })],
      })
    );

    expect(m.safeDailyAllowance).toBe(0);
    expect(m.isDeficitProjected).toBe(true);
    expect(m.riskScore).toBe(100);
    expect(m.riskLevel).toBe('Critical (Cooked)');
    expect(m.healthScore).toBe(5); // clamped to the floor
    expect(m.grade).toBe('F');
  });
});

// --- simulateDecision -------------------------------------------------------

describe('simulateDecision', () => {
  const base = () =>
    emptyParams({
      currentDay: 10,
      transactions: [makeTransaction({ day: 10, amount: 3000, category: 'Food & Canteen' })],
    });

  it('reports the upside of a windfall', () => {
    const result = simulateDecision(base(), {
      title: 'Freelance gig',
      amount: 1000,
      type: 'income',
      category: 'Freelance & Income',
    });

    expect(result.balanceDelta).toBe(1000);
    expect(result.currentMetrics.safeDailyAllowance).toBe(333); // floor(7000/21)
    expect(result.simulatedMetrics.safeDailyAllowance).toBe(380); // floor(8000/21)
    expect(result.dailyAllowanceDelta).toBe(47);
    expect(result.narrativeSummary).toContain('1000');
  });

  it('warns loudly when an expense tips the user into a deficit', () => {
    const result = simulateDecision(
      emptyParams({ currentDay: 5 }),
      { title: 'Sneakers', amount: 9000, type: 'expense', category: 'Shopping & Fashion' }
    );

    expect(result.balanceDelta).toBe(-9000);
    expect(result.simulatedMetrics.isDeficitProjected).toBe(true);
    expect(result.simulatedMetrics.safeDailyAllowance).toBeLessThan(100);
    expect(result.riskDelta).toBeGreaterThan(15);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    expect(result.warnings.join(' ')).toContain('Deficit');
  });

  it('frees up cash when a subscription is toggled off', () => {
    const result = simulateDecision(
      emptyParams({
        currentDay: 5,
        subscriptions: [makeSubscription({ cost: 500, billingDay: 15, active: true })],
      }),
      {
        title: 'netflix',
        amount: 500,
        type: 'subscription_toggle',
        category: 'Entertainment & Party',
      }
    );

    expect(result.balanceDelta).toBe(0);
    expect(result.currentMetrics.totalCommittedUpcoming).toBe(500);
    expect(result.simulatedMetrics.totalCommittedUpcoming).toBe(0);
    expect(result.dailyAllowanceDelta).toBe(19); // floor(10000/26) - floor(9500/26)
  });

  it('does not mutate the caller-supplied collections', () => {
    const goals = [makeGoal({ currentAmount: 0, targetAmount: 5000 })];
    const params = emptyParams({ currentDay: 5, savingsGoals: goals });

    simulateDecision(params, {
      title: 'Lock funds',
      amount: 500,
      type: 'savings_deposit',
      category: 'Savings Lock',
    });

    expect(goals[0].currentAmount).toBe(0);
    expect(params.transactions).toHaveLength(0);
  });
});
