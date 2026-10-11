/**
 * Formats a database column name into a human-readable label.
 * Handles common uppercase acronyms appropriately.
 */
export const formatLabel = (key: string): string => {
  return key
    .split('_')
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'id') return 'ID';
      if (lower === 'guid') return 'GUID';
      if (lower === 'cbb') return 'CBB';
      if (lower === 'cfb') return 'CFB';
      if (lower === 'nba') return 'NBA';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
