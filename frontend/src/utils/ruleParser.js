/**
 * Validates a rule condition string.
 * Example valid conditions:
 *   "amount > 100 && country == \"US\""
 *   "priority == \"high\""
 *   "amount <= 50"
 *
 * @param {string} condition - The condition string to validate.
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateCondition = (condition) => {
  if (!condition || !condition.trim()) {
    return { valid: false, error: 'Condition cannot be empty' };
  }

  // Check for balanced quotes
  const doubleQuotes = (condition.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    return { valid: false, error: 'Unbalanced double quotes' };
  }

  // Check for valid operators
  const validOperators = ['==', '!=', '>', '<', '>=', '<=', '&&', '||'];
  const hasOperator = validOperators.some(op => condition.includes(op));
  if (!hasOperator) {
    return { valid: false, error: 'Condition must contain at least one comparison operator (==, !=, >, <, >=, <=)' };
  }

  return { valid: true };
};

/**
 * Parses a condition string into an array of condition parts.
 *
 * @param {string} condition - The condition string to parse.
 * @returns {Array<{ field: string, operator: string, value: string }>}
 */
export const parseCondition = (condition) => {
  if (!condition) return [];

  const parts = condition.split(/\s*(\&\&|\|\|)\s*/);
  const parsed = [];

  for (const part of parts) {
    if (part === '&&' || part === '||') continue;

    const match = part.trim().match(/^(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
    if (match) {
      parsed.push({
        field: match[1],
        operator: match[2],
        value: match[3].replace(/"/g, '').trim(),
      });
    }
  }

  return parsed;
};

/**
 * Builds a condition string from parsed parts.
 *
 * @param {Array<{ field: string, operator: string, value: string }>} parts
 * @param {string} connector - '&&' or '||'
 * @returns {string}
 */
export const buildCondition = (parts, connector = '&&') => {
  return parts
    .map(p => {
      const val = isNaN(p.value) ? `"${p.value}"` : p.value;
      return `${p.field} ${p.operator} ${val}`;
    })
    .join(` ${connector} `);
};