import { useFinancial } from '../context/FinancialContext';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { VibeCheckAdvisor } from '../components/VibeCheckAdvisor';

export function SimulatorPage() {
  const {
    currentDay,
    liquidBalance,
    metrics,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
    handleCommitDecision,
  } = useFinancial();

  return (
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
  );
}
