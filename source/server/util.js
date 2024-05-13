import * as Types from './types.js';

/**
 * Creates and returns random game code for each game instance; currently not necessarily unique
 * @returns { number } newly generated game code
 */
export function generateGameCode() {
  return Math.floor(Math.random() * 9000) + 1000;
} /* generateGameCode */

/**
 * Determines if two arrays are equal as sets
 * @param { any[] } arr1 array of objects to compare
 * @param { any[] } arr2 array of objects to compare
 * @returns { boolean } true if arrays are equal as sets; false otherwise
 */
export function areUnorderedArrsEqual(arr1, arr2) {
  return (
    arr1.every((el) => arr2.includes(el)) &&
    arr2.every((el) => arr1.includes(el))
  );
} /* areUnorderedArrsEqual */

/**
 * Ensures that card object is well-formed and valid
 * @param { Types.Card } card card object to test
 * @returns { boolean } true if card is valid; false if invalid
 */
export function isCardValid(card) {
  return (
    areUnorderedArrsEqual(Object.keys(card), ['number', 'suite']) &&
    typeof card.number === 'number' &&
    typeof card.suite === 'string'
  );
} /* isCardValid */

/**
 * Determines if two different card objects represent the same card
 * @param { Types.Card } card1 card to compare
 * @param { Types.Card } card2 card to compare
 * @returns { boolean } true if the two cards represent the same
 * card (i.e., same values); false otherwise
 */
export function areCardsEqual(card1, card2) {
  return card1.number === card2.number && card1.suite === card2.suite;
} /* areCardsEqual */

/**
 * Determines the opponent of a given player in a game instance
 * @param { Types.GameInstance } gameInstance game instance to target
 * @param { Types.WSConnection } webSocketConnection non-target player of game instance
 * @returns { Types.WSConnection } other player in game instance
 */
export function getOtherPlayer(gameInstance, webSocketConnection) {
  return gameInstance.webSocketConnections.find(
    (conn) => conn !== webSocketConnection,
  );
} /* getOtherPlayer */

/**
 * Returns the last entry in list of round states from a game instance
 * @param { Types.GameInstance } gameInstance game instance to target
 * @returns { Types.RoundState } most recent (current) round attached to gameInstance
 */
export function getCurrentRoundState(gameInstance) {
  return gameInstance.gameState.byRound[
    gameInstance.gameState.byRound.length - 1
  ];
} /* getCurrentRoundState */

/**
 * Determines which of two cards wins a round
 * @param { Types.Card } card1 card to compare
 * @param { Types.Card } card2 card to compare
 * @returns { Types.Card } winning card of card1 and card2
 */
export function getWinningCard(card1, card2) {
  // TODO: add logic to pick winner

  return card1.number > card2.number ? card1 : card2;
} /* getWinningCard */

/**
 * Creates and returns a new round state
 * @returns { Types.RoundState } blank round state
 */
export function createNewRound() {
  return {
    selectedCard: {},
    roundWinner: null,
  };
} /* createNewRound */

/**
 * Generates two sets of n mutually-unique cards
 * @param { Types.Card[] } cardList list of cards to pull from
 * @param { number } n integer size of each set
 * @returns { Types.Card[][] }  two lists of n mutually-unique cards
 */
export function generateUniqueCards(cardList, n) {
  /* shuffle cards by sorting according to random weights */
  const shuffledCardList = cardList
    .map((card) => [card, Math.random()])
    .sort(([, weight1], [, weight2]) => weight1 - weight2)
    .map(([card]) => card);

  /* choose first n and second n elements for each list */
  return [shuffledCardList.slice(0, n), shuffledCardList.slice(n, n + n)];
} /* generateUniqueCards */
