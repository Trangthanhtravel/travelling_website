/**
 * Format a number as VND currency with thousand separators
 * @param amount - The amount to format
 * @returns Formatted string with VND currency symbol
 */
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0 VND';
  }

  // Format number with thousand separators (commas)
  const formatted = Math.round(numAmount).toLocaleString('en-US');

  return `${formatted} VND`;
};

/**
 * Format a number with thousand separators without currency symbol
 * @param amount - The amount to format
 * @returns Formatted string with commas
 */
export const formatNumber = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0';
  }

  return Math.round(numAmount).toLocaleString('en-US');
};

