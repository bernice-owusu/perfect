/**
 * Formats a currency value for Ghana Cedis (GH₵).
 * Always returns 2 decimal places (e.g. "0.80", "0.50").
 */
export const formatPrice = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "0.00";
  }
  return Number(amount).toFixed(2);
};
