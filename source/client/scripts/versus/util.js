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
} /* getRandFromArr */

/**
 * Gets world event information associated to the name
 * @param { string } worldEventName value of WORLD_EVENTS enum
 * @returns {{
 *  imgPath: string,
 *  eventName: string,
 *  eventDescription: string
 * }} object containing information associated to the world event
 */
export function getWorldEventInfo(worldEventName) {
  switch (worldEventName) {
    case Types.WORLD_EVENTS.LOWER_WINS:
      return {
        imgPath: './assets/images/game_legend.webp',
        eventName: 'Lower is Better',
        eventDescription: 'The card with the lower power level wins!',
      };
    case Types.WORLD_EVENTS.SUITE_REVERSED:
      return {
        imgPath: './assets/images/game_legend_reversed.webp',
        eventName: 'Suite Reverse',
        eventDescription: 'The order of the winning suites gets reversed!',
      };
    case Types.WORLD_EVENTS.SUITE_BOOST_WANDS:
      return {
        imgPath: './assets/images/game_legend_wands_boost.webp',
        eventName: 'Wands are Boosted',
        eventDescription: 'Wands are much stronger this round!',
      };
    case Types.WORLD_EVENTS.SUITE_BOOST_CUPS:
      return {
        imgPath: './assets/images/game_legend_cups_boost.webp',
        eventName: 'Cups are Boosted',
        eventDescription: 'Cups are much stronger this round!',
      };
    case Types.WORLD_EVENTS.SUITE_BOOST_SWORDS:
      return {
        imgPath: './assets/images/game_legend_swords_boost.webp',
        eventName: 'Swords are Boosted',
        eventDescription: 'Swords are much stronger this round!',
      };
    case Types.WORLD_EVENTS.SUITE_BOOST_PENTACLES:
      return {
        imgPath: './assets/images/game_legend_pentacles_boost.webp',
        eventName: 'Pentacles are Boosted',
        eventDescription: 'Pentacles are much stronger this round!',
      };
    case Types.WORLD_EVENTS.RANDOM_VALUE:
      return {
        imgPath: './assets/images/game_legend.webp',
        eventName: 'Random Values',
        eventDescription: "Your cards' values are randomized this round!",
      };
    case Types.WORLD_EVENTS.RANDOM_SUITE:
      return {
        imgPath: './assets/images/game_legend.webp',
        eventName: 'Random Suites',
        eventDescription: "Your cards' suites are randomized this round!",
      };
    default:
      return {
        imgPath: './assets/images/game_legend.webp',
        eventName: 'Default',
        eventDescription:
          'Wands beat cups, cups beat swords, swords beat wands, and pentacles are neutral',
      };
  }
} /* getWorldEventInfo */
