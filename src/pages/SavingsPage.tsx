import { useFinancial } from '../context/FinancialContext';
import { SavingsGoals } from '../components/SavingsGoals';

export function SavingsPage() {
  const { savingsGoals, liquidBalance, handleDepositGoal, handleWithdrawGoal, handleAddGoal } = useFinancial();

  return (
    <SavingsGoals
      savingsGoals={savingsGoals}
      liquidBalance={liquidBalance}
      onDepositGoal={handleDepositGoal}
      onWithdrawGoal={handleWithdrawGoal}
      onAddGoal={handleAddGoal}
    />
  );
}
