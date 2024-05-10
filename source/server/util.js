/**
 * Creates and returns random game code for each game instance; currently not necessarily unique
 * @returns { number }
 */
export function generateGameCode() {
  return Math.floor(Math.random() * 9000) + 1000;
} /* generateGameCode */

/**
 * Determines if two arrays
 * @param { any[] } arr1
 * @param { any[] } arr2
 * @returns { boolean }
 */
export function areUnorderedArrsEqual(arr1, arr2) {
  return (
    arr1.every((el) => arr2.includes(el)) &&
    arr2.every((el) => arr1.includes(el))
  );
} /* areUnorderedArrsEqual */

/**
 *
 * @param { Card } card
 * @returns { boolean }
 */
export function isCardValid(card) {
  return (
    areUnorderedArrsEqual(Object.keys(card), ['number', 'suite']) &&
    typeof card.number === 'number' &&
    typeof card.suite === 'string'
  );
} /* isCardValid */

/**
 *
 * @param { Card } card1
 * @param { Card } card2
 * @returns { boolean }
 */
export function areCardsEqual(card1, card2) {
  return card1.number === card2.number && card1.suite === card2.suite;
} /* areCardsEqual */

/**
 *
 * @param { GameInstance } gameInstance
 * @param { connection } webSocketConnection
 * @returns { connection } other player in game instance
 */
export function getOtherPlayer(gameInstance, webSocketConnection) {
  return gameInstance.webSocketConnections.find(
    (conn) => conn !== webSocketConnection,
  );
} /* getOtherPlayer */

/**
 *
 * @param { GameInstance } gameInstance
 * @returns { RoundState }
 */
export function getCurrentRoundState(gameInstance) {
  return gameInstance.gameState.byRound[
    gameInstance.gameState.byRound.length - 1
  ];
} /* getCurrentRoundState */

/**
 *
 * @param { Card } card1
 * @param { Card } card2
 * @returns { Card }
 */
export function getWinningCard(card1, card2) {
  // TODO: add logic to pick winner

  return card1.number > card2.number ? card1 : card2;
} /* getWinningCard */

/**
 * 
 */
export function createNewRound() {
  return {
    selectedCard: {},
    roundWinner: null,
  }
} /* */