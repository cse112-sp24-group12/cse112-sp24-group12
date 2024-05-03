/**
 * Creates and returns random game code for each game instance; currently not necessarily unique
 * 
 * @returns { number }
 */
export function generateGameCode() {
  return Math.floor(Math.random() * 9000) + 1000;
} /* generateGameCode */
