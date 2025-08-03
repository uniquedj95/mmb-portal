/**
 * Formats a number as a currency string.
 *
 * @param amount - The numeric value to format.
 * @param currency - The currency code (e.g., 'USD', 'EUR'). Defaults to 'MWK'.
 * @param locale - The locale string for formatting (e.g., 'en-US', 'fr-FR'). Defaults to 'en-US'.
 * @param useSymbol - Whether to use the currency symbol (K) instead of the currency code. Defaults to true.
 * @returns The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'MWK',
  locale: string = 'en-US',
  useSymbol: boolean = true
): string {
  if (useSymbol && currency === 'MWK') {
    // Use K prefix for Malawi Kwacha
    return `K${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Converts a decimal number to a percentage string.
 *
 * @param decimal - The decimal number to convert (e.g., 0.8).
 * @param fractionDigits - The number of decimal places to include in the percentage. Defaults to 0.
 * @returns The formatted percentage string (e.g., "80%").
 */
export function toPercentage(decimal: number, fractionDigits: number = 0): string {
  return (decimal * 100).toFixed(fractionDigits) + '%';
}