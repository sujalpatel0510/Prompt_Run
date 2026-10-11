import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { HeroMetrics } from '../components/features/HeroMetrics';
import { WhatIfSimulator } from '../components/features/WhatIfSimulator';
import { Timeline30Days } from '../components/features/Timeline30Days';
import { SubscriptionsVault } from '../components/features/SubscriptionsVault';
import { SavingsGoals } from '../components/features/SavingsGoals';
import { BudgetBreakdown } from '../components/features/BudgetBreakdown';
import { VibeCheckAdvisor } from '../components/features/VibeCheckAdvisor';
import { ScrollReveal } from '../components/ui/Animations';

export function OverviewPage() {
  const {
    currentDay,
    setCurrentDay,
    liquidBalance,
    metrics,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
    handleAddTransaction,
    handleDeleteTransaction,
    handleToggleSubscription,
    handleToggleCommitmentPaid,
    handleDepositGoal,
    handleWithdrawGoal,
    handleAddGoal,
    handleCommitDecision,
    handleAdvanceDay,
  } = useFinancial();

  return (
    <div className="space-y-6">
      <HeroMetrics
        currentDay={currentDay}
        liquidBalance={liquidBalance}
        metrics={metrics}
      />

      <ScrollReveal direction="up" distance={30} delay={0.1}>
        <WhatIfSimulator
          currentDay={currentDay}
          transactions={transactions}
          commitments={commitments}
          subscriptions={subscriptions}
          savingsGoals={savingsGoals}
          onCommitDecision={handleCommitDecision}
        />
      </ScrollReveal>

      <ScrollReveal direction="up" distance={30} delay={0.2}>
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
      </ScrollReveal>

      <ScrollReveal direction="up" distance={30} delay={0.3}>
        <SubscriptionsVault
          currentDay={currentDay}
          subscriptions={subscriptions}
          commitments={commitments}
          onToggleSubscription={handleToggleSubscription}
          onToggleCommitmentPaid={handleToggleCommitmentPaid}
        />
      </ScrollReveal>

      <ScrollReveal direction="up" distance={30} delay={0.4}>
        <SavingsGoals
          savingsGoals={savingsGoals}
          liquidBalance={liquidBalance}
          onDepositGoal={handleDepositGoal}
          onWithdrawGoal={handleWithdrawGoal}
          onAddGoal={handleAddGoal}
        />
      </ScrollReveal>

      <ScrollReveal direction="up" distance={30} delay={0.5}>
        <BudgetBreakdown
          currentDay={currentDay}
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </ScrollReveal>

      <ScrollReveal direction="up" distance={30} delay={0.6}>
        <VibeCheckAdvisor
          currentDay={currentDay}
          liquidBalance={liquidBalance}
          metrics={metrics}
          subscriptions={subscriptions}
          transactions={transactions}
        />
      </ScrollReveal>
    </div>
  );
}