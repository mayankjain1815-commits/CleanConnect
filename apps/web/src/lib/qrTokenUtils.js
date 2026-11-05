
/**
 * Generates a SHA-256 hash token for a bin QR code.
 * @param {string} citizenId - The citizen's unique identifier.
 * @param {string} address - The citizen's house address.
 * @returns {Promise<string>} A promise that resolves to the 64-character hex string hash.
 */
export const generateBinQRToken = async (citizenId, address) => {
  try {
    if (!citizenId || !address) {
      throw new Error('Citizen ID and address are required to generate a token.');
    }
    const rawData = `${citizenId}-${address}-${Date.now()}-${crypto.randomUUID()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(rawData);
    
    // Create SHA-256 hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Convert buffer to hex string
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error generating QR token:', error);
    throw new Error('Failed to generate secure QR token');
  }
};

/**
 * Validates that a token is a non-empty string matching the SHA-256 format.
 * @param {string} token - The token to validate.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
export const validateQRToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  // Valid SHA-256 hex string is exactly 64 characters long and contains only hex digits
  const hexRegex = /^[a-fA-F0-9]{64}$/;
  return hexRegex.test(token);
};

/**
 * Safely extracts and returns the last 8 characters of the token for UI display.
 * @param {string} token - The full token string.
 * @returns {string} The last 8 characters, upper-cased, or 'INVALID' if the token is bad.
 */
export const formatTokenDisplay = (token) => {
  if (!token || typeof token !== 'string' || token.length < 8) return 'INVALID';
  return token.slice(-8).toUpperCase();
};
