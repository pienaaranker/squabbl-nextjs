/**
 * Feature flag service for database selection
 * This file provides utilities to determine which database to use (Firestore or RTDB)
 * during the migration process.
 */

// Global feature flag for database selection (default to Firestore)
let useRTDB = false;

/**
 * Set the database to use throughout the application
 * @param {boolean} useRealTimeDB - Whether to use RTDB (true) or Firestore (false)
 */
export function setDatabaseType(useRealTimeDB: boolean): void {
  useRTDB = useRealTimeDB;
  console.log(`Database set to: ${useRTDB ? 'Realtime Database' : 'Firestore'}`);
}

/**
 * Check if the application should use Realtime Database
 * @returns {boolean} Whether to use RTDB (true) or Firestore (false)
 */
export function shouldUseRTDB(): boolean {
  return useRTDB;
}

/**
 * Initialize the database selection based on configuration
 * This could be extended to read from localStorage, remote config, or other sources
 * @param {boolean} initialValue - Initial value for the database selection
 */
export function initDatabaseSelector(initialValue: boolean = false): void {
  // Get from environment variable if available
  const envValue = process.env.NEXT_PUBLIC_USE_RTDB;
  if (envValue !== undefined) {
    useRTDB = envValue === 'true';
  } else {
    useRTDB = initialValue;
  }
  
  console.log(`Database initialized to: ${useRTDB ? 'Realtime Database' : 'Firestore'}`);
}

/**
 * Database selector for use in components
 * This wraps a database operation with the appropriate implementation
 * @param {T} firestoreImpl - The Firestore implementation of an operation
 * @param {T} rtdbImpl - The Realtime Database implementation of the same operation
 * @returns {T} The selected implementation based on the current feature flag
 * 
 * @example
 * // Usage example:
 * const createGame = selectDatabase(createNewGame, createNewGameRTDB);
 * const result = await createGame(params);
 */
export function selectDatabase<T>(firestoreImpl: T, rtdbImpl: T): T {
  return useRTDB ? rtdbImpl : firestoreImpl;
}

// Initialize the selector with default value (false = use Firestore)
initDatabaseSelector(); 