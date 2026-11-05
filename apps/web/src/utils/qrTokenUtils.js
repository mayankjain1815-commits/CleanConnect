
export const generateBinQRToken = async (citizenId, houseAddress, lat, lng) => {
  try {
    const rawData = `${citizenId}-${houseAddress}-${lat}-${lng}-${Date.now()}-${crypto.randomUUID()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(rawData);
    
    // Create SHA-256 hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Convert buffer to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error generating QR token:', error);
    throw new Error('Failed to generate secure QR token');
  }
};

export const validateQRToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  // Valid SHA-256 hex string is exactly 64 characters long and contains only hex digits
  const hexRegex = /^[a-fA-F0-9]{64}$/;
  return hexRegex.test(token);
};

export const formatTokenDisplay = (token) => {
  if (!token || token.length < 8) return 'INVALID';
  return token.slice(-8).toUpperCase();
};
