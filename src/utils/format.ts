/** Indian Rupee formatter used everywhere in the app. */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  return inrFormatter.format(Math.round(amount));
}

export function formatSignedINR(amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return sign + formatINR(Math.abs(amount));
}
