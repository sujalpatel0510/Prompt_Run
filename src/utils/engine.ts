import { 
  Transaction, 
  Commitment, 
  Subscription, 
  SavingsGoal, 
  FinancialHealthMetrics, 
  RiskLevel,
  SimulationParams,
  SimulationComparison
} from '../types/finance';

export const INITIAL_BUDGET = 10000;
export const TOTAL_DAYS = 30;
export const IDEAL_DAILY_BASELINE = Math.round(INITIAL_BUDGET / TOTAL_DAYS); // ~₹333/day

export function calculateMetrics(params: {
  currentDay: number;
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
}): FinancialHealthMetrics {
  const { currentDay, transactions, commitments, subscriptions, savingsGoals } = params;

  // 1. Calculate historical & current balances
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavingsLocked = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Liquid balance = Starting balance + income - expenses - locked in savings goals
  const liquidBalance = INITIAL_BUDGET + totalIncome - totalExpense - totalSavingsLocked;

  // 2. Upcoming Commitments (unpaid commitments with dueDay >= currentDay)
  const upcomingCommitments = commitments
    .filter(c => !c.isPaid && c.dueDay >= currentDay)
    .reduce((sum, c) => sum + c.amount, 0);

  // Active subscriptions billing between currentDay and Day 30
  const upcomingSubscriptions = subscriptions
    .filter(s => s.active && s.billingDay >= currentDay && s.billingDay <= TOTAL_DAYS)
    .reduce((sum, s) => sum + s.cost, 0);

  const totalCommittedUpcoming = upcomingCommitments + upcomingSubscriptions;

  // 3. Days Remaining
  const daysRemaining = Math.max(1, TOTAL_DAYS - currentDay + 1);

  // 4. Safe Daily Allowance
  // What can you safely spend each day after setting aside upcoming fixed bills?
  const uncommittedCash = liquidBalance - totalCommittedUpcoming;
  const safeDailyAllowance = uncommittedCash > 0 
    ? Math.floor(uncommittedCash / daysRemaining) 
    : 0;

  // 5. Burn Rate per Day
  // Calculate average daily spend from day 1 to currentDay
  const daysPassed = Math.max(1, currentDay);
  const totalVariableSpent = transactions
    .filter(t => t.type === 'expense' && t.category !== 'Bills & Utilities')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const burnRatePerDay = currentDay === 1 ? IDEAL_DAILY_BASELINE : Math.round(totalVariableSpent / daysPassed);

  // 6. Projected EOM (End of Month) Balance
  // If user continues burning at their current burn rate for remaining days
  const projectedRemainingSpend = burnRatePerDay * (daysRemaining - 1);
  const projectedEOMBalance = liquidBalance - totalCommittedUpcoming - projectedRemainingSpend;

  const isDeficitProjected = projectedEOMBalance < 0;
  
  // Estimate on which day the user will run out of money (if deficit projected)
  let deficitDay: number | null = null;
  if (isDeficitProjected) {
    if (burnRatePerDay > 0) {
      const daysUntilBroke = Math.floor(Math.max(0, liquidBalance - totalCommittedUpcoming) / burnRatePerDay);
      deficitDay = Math.min(TOTAL_DAYS, currentDay + daysUntilBroke);
    } else {
      deficitDay = currentDay;
    }
  }

  // 7. Financial Risk Score (0 = completely safe, 100 = critical / broke)
  let riskScore = 0;
  if (liquidBalance <= 0) {
    riskScore = 100;
  } else if (uncommittedCash <= 0) {
    riskScore = 85 + Math.min(15, Math.round(Math.abs(uncommittedCash) / 100));
  } else {
    // Cushion ratio: how many days of safe allowance do you have?
    const runwayDays = burnRatePerDay > 0 ? uncommittedCash / burnRatePerDay : daysRemaining;
    const runwayRatio = runwayDays / daysRemaining;

    if (runwayRatio >= 1.2) {
      riskScore = 10;
    } else if (runwayRatio >= 1.0) {
      riskScore = 25;
    } else if (runwayRatio >= 0.7) {
      riskScore = 48;
    } else if (runwayRatio >= 0.4) {
      riskScore = 72;
    } else {
      riskScore = 88;
    }

    // Adjust risk if daily allowance is severely compressed (< ₹150)
    if (safeDailyAllowance < 150) {
      riskScore = Math.min(95, riskScore + 18);
    }
  }
  riskScore = Math.max(0, Math.min(100, riskScore));

  let riskLevel: RiskLevel = 'Safe';
  if (riskScore > 75) riskLevel = 'Critical (Cooked)';
  else if (riskScore > 50) riskLevel = 'High Risk';
  else if (riskScore > 25) riskLevel = 'Moderate';
  else riskLevel = 'Safe';

  // 8. Financial Health Score (0 to 100)
  // Holistic Gen-Z Health Index
  let healthScore = 50;

  // Factor A: Balance & Solvency (Max 35 pts)
  if (liquidBalance >= 6000) healthScore += 35;
  else if (liquidBalance >= 4000) healthScore += 28;
  else if (liquidBalance >= 2000) healthScore += 18;
  else if (liquidBalance >= 500) healthScore += 8;
  else healthScore -= 20;

  // Factor B: Bill Coverage (Max 25 pts)
  if (uncommittedCash >= 2500) healthScore += 25;
  else if (uncommittedCash >= 1000) healthScore += 18;
  else if (uncommittedCash >= 0) healthScore += 10;
  else healthScore -= 25;

  // Factor C: Savings Health (Max 20 pts)
  const totalGoalTargets = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const savingsRatio = totalGoalTargets > 0 ? totalSavingsLocked / totalGoalTargets : 0;
  healthScore += Math.min(20, Math.round(savingsRatio * 20));

  // Factor D: Daily Allowance Comfort (Max 20 pts)
  if (safeDailyAllowance >= 300) healthScore += 20;
  else if (safeDailyAllowance >= 200) healthScore += 14;
  else if (safeDailyAllowance >= 100) healthScore += 7;
  else healthScore -= 15;

  // Factor E: Deficit Penalty
  if (isDeficitProjected) {
    healthScore -= 20;
  }

  healthScore = Math.max(5, Math.min(99, Math.round(healthScore)));

  let grade: 'S' | 'A' | 'B' | 'C' | 'F' = 'B';
  if (healthScore >= 90) grade = 'S';
  else if (healthScore >= 75) grade = 'A';
  else if (healthScore >= 60) grade = 'B';
  else if (healthScore >= 40) grade = 'C';
  else grade = 'F';

  return {
    healthScore,
    grade,
    riskScore,
    riskLevel,
    safeDailyAllowance,
    projectedEOMBalance,
    isDeficitProjected,
    deficitDay,
    totalCommittedUpcoming,
    totalSavingsLocked,
    burnRatePerDay,
  };
}

export function simulateDecision(
  currentParams: {
    currentDay: number;
    transactions: Transaction[];
    commitments: Commitment[];
    subscriptions: Subscription[];
    savingsGoals: SavingsGoal[];
  },
  decision: SimulationParams
): SimulationComparison {
  const currentMetrics = calculateMetrics(currentParams);

  // Clone structures
  const simTransactions = [...currentParams.transactions];
  const simSavingsGoals = currentParams.savingsGoals.map(g => ({ ...g }));
  const simSubscriptions = currentParams.subscriptions.map(s => ({ ...s }));

  if (decision.type === 'expense') {
    simTransactions.push({
      id: 'sim-expense',
      day: currentParams.currentDay,
      title: decision.title,
      amount: decision.amount,
      type: 'expense',
      category: decision.category,
      timestamp: new Date().toISOString(),
      isSimulated: true
    });
  } else if (decision.type === 'income') {
    simTransactions.push({
      id: 'sim-income',
      day: currentParams.currentDay,
      title: decision.title,
      amount: decision.amount,
      type: 'income',
      category: decision.category,
      timestamp: new Date().toISOString(),
      isSimulated: true
    });
  } else if (decision.type === 'savings_deposit') {
    if (simSavingsGoals.length > 0) {
      simSavingsGoals[0].currentAmount += decision.amount;
    }
  } else if (decision.type === 'subscription_toggle') {
    // E.g. cancel a subscription to save recurring money
    const targetSub = simSubscriptions.find(s => s.title.toLowerCase().includes(decision.title.toLowerCase()));
    if (targetSub) {
      targetSub.active = !targetSub.active;
    }
  }

  const simulatedMetrics = calculateMetrics({
    ...currentParams,
    transactions: simTransactions,
    savingsGoals: simSavingsGoals,
    subscriptions: simSubscriptions,
  });

  const balanceDelta = decision.type === 'income' 
    ? decision.amount 
    : decision.type === 'expense' 
      ? -decision.amount 
      : decision.type === 'savings_deposit'
        ? -decision.amount
        : 0;

  const dailyAllowanceDelta = simulatedMetrics.safeDailyAllowance - currentMetrics.safeDailyAllowance;
  const healthDelta = simulatedMetrics.healthScore - currentMetrics.healthScore;
  const riskDelta = simulatedMetrics.riskScore - currentMetrics.riskScore;
  const eomDelta = simulatedMetrics.projectedEOMBalance - currentMetrics.projectedEOMBalance;

  // Generate dynamic Gen-Z narrative summary and warnings
  const warnings: string[] = [];
  let narrative = '';

  if (decision.type === 'expense') {
    if (simulatedMetrics.safeDailyAllowance < 100) {
      warnings.push(`⚠️ Squeezes your daily allowance down to a brutal ₹${simulatedMetrics.safeDailyAllowance}/day!`);
    }
    if (simulatedMetrics.isDeficitProjected && !currentMetrics.isDeficitProjected) {
      warnings.push(`🚨 CRITICAL: This decision tips you into a Month-End Deficit around Day ${simulatedMetrics.deficitDay}!`);
    }
    if (riskDelta > 15) {
      warnings.push(`📈 Spikes your financial risk by +${riskDelta}% into ${simulatedMetrics.riskLevel}.`);
    }

    if (warnings.length > 0) {
      narrative = `Spending ₹${decision.amount} on "${decision.title}" will hit your wallet hard. It cuts your daily spendable room by ₹${Math.abs(dailyAllowanceDelta)}/day for the next ${TOTAL_DAYS - currentParams.currentDay + 1} days.`;
    } else {
      narrative = `Spending ₹${decision.amount} is within your budget cushion. Your safe allowance adjusts to ₹${simulatedMetrics.safeDailyAllowance}/day with manageable risk.`;
    }
  } else if (decision.type === 'income') {
    narrative = `Awesome play! Adding ₹${decision.amount} gives you an extra ₹${dailyAllowanceDelta}/day breathing room and boosts your health score by +${healthDelta} pts.`;
  } else if (decision.type === 'savings_deposit') {
    narrative = `Locking ₹${decision.amount} into your savings builds your safety net. Liquid daily allowance drops by ₹${Math.abs(dailyAllowanceDelta)}/day, but your long-term goal moves closer!`;
  } else {
    narrative = `Cancelling recurring costs frees up ₹${Math.abs(decision.amount)} every single month, improving your daily allowance by +₹${dailyAllowanceDelta}/day.`;
  }

  return {
    currentMetrics,
    simulatedMetrics,
    balanceDelta,
    dailyAllowanceDelta,
    healthDelta,
    riskDelta,
    eomDelta,
    narrativeSummary: narrative,
    warnings,
  };
}
