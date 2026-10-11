export type Category = 
  | 'Food & Canteen' 
  | 'Cafe & Boba' 
  | 'Travel & Metro' 
  | 'Study & Supplies' 
  | 'Shopping & Fashion' 
  | 'Entertainment & Party' 
  | 'Bills & Utilities' 
  | 'Health & Emergency' 
  | 'Freelance & Income' 
  | 'Savings Lock';

export interface Transaction {
  id: string;
  day: number;
  title: string;
  amount: number; // positive for expense, negative for income in some views, but we'll use type: 'expense' | 'income'
  type: 'expense' | 'income';
  category: Category;
  timestamp: string;
  isSimulated?: boolean;
  notes?: string;
}

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  category: Category;
  isPaid: boolean;
  isEssential: boolean;
}

export interface Subscription {
  id: string;
  title: string;
  cost: number;
  billingDay: number;
  active: boolean;
  serviceCategory: 'Music' | 'Video' | 'AI Tools' | 'Fitness' | 'Gaming';
  icon: string;
}

export interface CategoryBudget {
  category: Category;
  planned: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDay: number;
  emoji: string;
  color: string;
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  amount: number; // can be negative for unexpected expense, positive for windfall
  type: 'expense' | 'income';
  severity: 'low' | 'medium' | 'high';
  tag: string;
}

export type RiskLevel = 'Safe' | 'Moderate' | 'High Risk' | 'Critical (Cooked)';

export interface FinancialHealthMetrics {
  healthScore: number; // 0 to 100
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  safeDailyAllowance: number;
  projectedEOMBalance: number;
  isDeficitProjected: boolean;
  deficitDay: number | null;
  totalCommittedUpcoming: number;
  totalSavingsLocked: number;
  burnRatePerDay: number;
}

export interface SimulationParams {
  title: string;
  amount: number;
  type: 'expense' | 'income' | 'savings_deposit' | 'subscription_toggle';
  category: Category;
  isRecurring?: boolean;
}

export interface SimulationComparison {
  currentMetrics: FinancialHealthMetrics;
  simulatedMetrics: FinancialHealthMetrics;
  balanceDelta: number;
  dailyAllowanceDelta: number;
  healthDelta: number;
  riskDelta: number;
  eomDelta: number;
  narrativeSummary: string;
  warnings: string[];
}

export interface DayLog {
  day: number;
  openingBalance: number;
  closingBalance: number;
  expenses: number;
  incomes: number;
  safeAllowance: number;
}
