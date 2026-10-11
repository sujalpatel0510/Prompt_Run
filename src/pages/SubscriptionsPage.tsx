import { useFinancial } from '../context/FinancialContext';
import { SubscriptionsVault } from '../components/features/SubscriptionsVault';

export function SubscriptionsPage() {
  const {
    currentDay,
    subscriptions,
    commitments,
    handleToggleSubscription,
    handleToggleCommitmentPaid,
  } = useFinancial();

  return (
    <SubscriptionsVault
      currentDay={currentDay}
      subscriptions={subscriptions}
      commitments={commitments}
      onToggleSubscription={handleToggleSubscription}
      onToggleCommitmentPaid={handleToggleCommitmentPaid}
    />
  );
}
