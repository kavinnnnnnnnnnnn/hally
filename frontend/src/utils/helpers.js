/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format a date string to a human-readable format.
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get MUI color for a given status.
 * @param {string} status
 * @returns {string}
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'success':
    case 'completed':
      return 'success';
    case 'failed':
    case 'error':
      return 'error';
    case 'running':
    case 'in progress':
      return 'info';
    case 'inactive':
    case 'draft':
    case 'pending':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Generate a unique ID.
 * @returns {string}
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Truncate text to a given length.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};