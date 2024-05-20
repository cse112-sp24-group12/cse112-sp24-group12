/** @module util */

import * as Types from './types.js';

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
 *
 * @param { Types.GameState } gameState
 * @returns
 */
export function getCurrentRoundState(gameState) {
  return gameState.byRound[gameState.byRound.length - 1];
} /* getCurrentRoundState */

/**
 * @param { string } suite
 * @param { string|number } number 
 * @returns { string }
 */
export function getCardURLFromName(suite, number) {
  if (!suite || !number) return '';

  return `./assets/images/deck_minor/${suite}/${number}.png`;
} /* getCardURLFromName */