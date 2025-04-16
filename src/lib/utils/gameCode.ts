/**
 * Utility functions for game code generation and validation
 */

/**
 * Generates a random 4-character alphanumeric code
 * Only uses easily distinguishable characters (no 0/O, 1/I/l, etc.)
 */
export function generateGameCode(): string {
  // Use unambiguous characters to avoid confusion
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

/**
 * Validates a game code format
 * @param code - The code to validate
 * @returns boolean indicating if the code is valid
 */
export function isValidGameCode(code: string): boolean {
  // Check if code is exactly 4 characters and only contains valid characters
  return /^[A-Z2-9]{4}$/.test(code);
}

/**
 * Formats a game code for display (all uppercase)
 * @param code - The code to format
 * @returns formatted code
 */
export function formatGameCode(code: string): string {
  return code.toUpperCase();
} 