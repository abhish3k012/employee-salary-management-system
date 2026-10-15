export const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  SGD: 'SG$'
};

export function formatCurrency(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  return `${symbol}${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2
  })}`;
}
