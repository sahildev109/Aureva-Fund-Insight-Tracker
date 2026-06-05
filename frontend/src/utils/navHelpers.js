/**
 * Parse 'dd-mm-yyyy' string to JS Date
 */
export function parseMFDate(str) {
  const [d, m, y] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Filter and format NAV data array for Recharts
 * @param {Array} rawData - MFapi data[] (newest-first)
 * @param {string} range - '1Y' | '3Y' | '5Y' | 'All'
 * @returns {Array<{ date: string, nav: number }>} oldest-first
 */
export function filterByRange(rawData, range) {
  const now = new Date();
  const cutoff = new Date(now);

  if (range === '1Y') cutoff.setFullYear(now.getFullYear() - 1);
  else if (range === '3Y') cutoff.setFullYear(now.getFullYear() - 3);
  else if (range === '5Y') cutoff.setFullYear(now.getFullYear() - 5);
  else cutoff.setFullYear(1970); // 'All'

  return rawData
    .filter(entry => parseMFDate(entry.date) >= cutoff)
    .sort((a, b) => parseMFDate(a.date) - parseMFDate(b.date)) // oldest first
    .map(entry => ({
      date: entry.date,
      nav: parseFloat(entry.nav), // MFapi returns nav as string
    }));
}
