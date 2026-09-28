// ============================================
// Indian Currency & Number Formatting Utilities
// Formats numbers cleanly into Crores (Cr), Lakhs (L), Thousands (K)
// ============================================

/**
 * Format currency in Indian numbering system
 * @param {number} amount In Rupees
 * @param {object} options Options { decimals = 2, showSymbol = true }
 * @returns {string} e.g. "₹255.56 Cr", "₹45.80 L", "₹85,000"
 */
export function formatIndianCurrency(amount, { decimals = 2, showSymbol = true } = {}) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const num = Math.abs(Number(amount));
  const prefix = (amount < 0 ? '-' : '') + (showSymbol ? '₹' : '');

  // 1 Crore = 10,000,000 (10^7)
  if (num >= 10000000) {
    const val = (num / 10000000).toFixed(decimals);
    // Trim trailing zeroes after decimal point if cleanly divisible, e.g. 255.00 -> 255
    const clean = val.replace(/\.00$/, '');
    return `${prefix}${clean} Cr`;
  }

  // 1 Lakh = 100,000 (10^5)
  if (num >= 100000) {
    const val = (num / 100000).toFixed(decimals);
    const clean = val.replace(/\.00$/, '');
    return `${prefix}${clean} L`;
  }

  // 1 Thousand = 1,000 (10^3)
  if (num >= 10000) {
    return `${prefix}${Math.round(num).toLocaleString('en-IN')}`;
  }

  // Below 10,000
  return `${prefix}${num.toLocaleString('en-IN', { maximumFractionDigits: decimals })}`;
}

/**
 * Format large numeric metrics (counts, population, etc.)
 * @param {number} num 
 * @returns {string} e.g. "12.4 Cr", "5.2 L", "1.5 K"
 */
export function formatIndianNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  const n = Math.abs(Number(num));
  const sign = num < 0 ? '-' : '';

  if (n >= 10000000) return `${sign}${(n / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (n >= 100000) return `${sign}${(n / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  if (n >= 1000) return `${sign}${(n / 1000).toFixed(1).replace(/\.0$/, '')} K`;
  return `${sign}${n.toLocaleString('en-IN')}`;
}

/**
 * Format Chart Ticks in Crores and Lakhs
 */
export function formatChartCurrency(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(0)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(0)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)} K`;
  return `₹${val}`;
}
