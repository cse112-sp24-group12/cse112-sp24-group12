/** @module util */

import * as Types from './types.js';

const MINOR_DECK_FACE_PATH_PREFIX = './assets/images/deck_minor';
const MINOR_DECK_FACE_PATH_FORMAT = 'webp';

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
 * Finds the most recent round state associated to a given game
 * @param { Types.GameState } gameState game state being targeted
 * @returns { Types.RoundState } state of current/most recent round
 */
export function getCurrentRoundState(gameState) {
  return gameState.byRound[gameState.byRound.length - 1];
} /* getCurrentRoundState */

/**
 * Determines the appropriate path to the asset for a card face
 * image associated to a particular card
 * @param { string } suite suite of target card
 * @param { string|number } number number of target card
 * @returns { string } path to image asset associated to the given suite and number
 */
export function getCardURLFromName(suite, number) {
  if (!suite || !number) return '';

  return `${MINOR_DECK_FACE_PATH_PREFIX}/${suite}/${number}.${MINOR_DECK_FACE_PATH_FORMAT}`;
} /* getCardURLFromName */

/**
 * Picks a random item from an array
 * @template A
 * @param { Array<A> } arr list of items
 * @returns { A } random item from list
 */
export function getRandFromArr(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
