/** @module store */

import { UPDATE_USERNAME_LISTENER_NAME } from './types.js';
import * as Types from './types.js';
import { getPlayerUUID } from './../profile.js';
import { areCardsEqual, getCurrentRoundState } from './util.js';

/** @type { Types.ServerToClientProfile } */
const userProfilesByUUID = {};

/** @type { Types.GameState } */
const gameState = {
  byPlayer: {},
  byRound: [],
  isStarted: false,
};

/**
 * Sets the winner of the current/most recent round
 * @param { Types.UUID } playerUUID unique identifier of round winner
 */
export function setRoundWinner(playerUUID) {
  getCurrentRoundState(gameState).roundWinner = playerUUID;
  gameState.byPlayer[playerUUID].score += 1;
} /* setRoundWinner */

/**
 * Adds blank new round to the current game state
 */
export function createNewRoundState() {
  gameState.byRound.push({
    selectedCard: {},
    roundWinner: null,
  });
} /* createNewRoundState */

/**
 * For the current round, sets the client user's selected card
 * @param { Types.Card } selectedCard card selected by the client user
 */
export function setSelfSelectedCard(selectedCard) {
  const playerUUID = getPlayerUUID();

  const playerGameState = gameState.byPlayer[playerUUID];
  playerGameState.remainingCards = playerGameState.remainingCards.filter(
    (card) => !areCardsEqual(card, selectedCard),
  );

  getCurrentRoundState(gameState).selectedCard[playerUUID] = selectedCard;
} /* setSelfSelectedCard */

/**
 * For the current round, sets the opponent's selected card
 * @param { Types.IndeterminateCard } selectedCard card selected by the
 * opponent user, passed from the server
 */
export function setOppSelectedCard(selectedCard) {
  const playerUUID = getPlayerUUID();
  const oppUUID = Object.keys(gameState.byPlayer).find(
    (UUID) => UUID !== playerUUID,
  );

  getCurrentRoundState(gameState).selectedCard[oppUUID] = selectedCard;
} /* setOppSelectedCard */

/**
 * Updates profile to store by UUID and emits appropriate event listener
 * for downstream users
 * @param { Types.ServerToClientProfile } profile most-recent profile sent from
 * the server for a given user
 */
export function updateProfile(profile) {
  userProfilesByUUID[profile.uuid] = profile;
  window.dispatchEvent(new Event(UPDATE_USERNAME_LISTENER_NAME));
} /* updateProfile */

/**
 * Fetches last-read profile associated to a player sent from the server
 * @param { Types.UUID } playerUUID unique identifer whose profile is targeted
 * @returns { Types.ServerToClientProfile } profile of user
 */
export function getProfile(playerUUID) {
  return userProfilesByUUID[playerUUID];
} /* getProfile */

/**
 * Fetches game score corresponding to user profile with a given UUID
 * @param { Types.UUID} playerUUID unique identifier whose score is targeted
 * @returns { number } number of rounds won by player
 */
export function getScore(playerUUID) {
  return gameState.byPlayer[playerUUID].score;
} /* getScore */

/**
 * For the current game state, returns the current number associated
 * with the round (i.e., at the start of the game, the client is partaking
 * in round 1)
 * @returns { number } current round number of game state for client user
 */
export function getRoundNumber() {
  return gameState.byRound.length;
} /* getRoundNumber */

/**
 * For a given list of members of the lobby, initializes player game state for
 * each of them under the gameState object
 * @param { Types.UUID[] } playerUUIDs unique identifiers for each member of game
 */
export function initializePlayers(playerUUIDs) {
  gameState.byPlayer = Object.fromEntries(
    playerUUIDs.map((UUID) => [
      UUID,
      {
        score: 0,
        remainingCards: [],
      },
    ]),
  );
} /* initializePlayers */

/**
 * Sets list of remaining cards that can be played by client user
 * @param { Types.Card[] } remainingCards list of remaining card names for user
 */
export function setRemainingCards(remainingCards) {
  gameState.byPlayer[getPlayerUUID()].remainingCards = remainingCards;
} /* setRemainingCards */

/**
 * Fetches all cards that are still available in the hand of the client user
 * @returns { Types.Card[] } list of remaining card names for user
 */
export function getRemainingCards() {
  return gameState.byPlayer[getPlayerUUID()].remainingCards;
} /* getRemainingCards */

/**
 * Returns the UUIDs member to current game
 * @returns { Types.UUID[] } list of UUIDs active in game (length 2)
 */
export function getPlayerUUIDs() {
  return Object.keys(gameState.byPlayer);
} /* getPlayerUUIDs */

/**
 * Sets game-start status to true
 */
export function setGameIsStarted() {
  gameState.isStarted = true;
} /* setGameIsStarted */

/**
 * Pulls game-start status from the current game state
 * @returns { boolean } true if game is started; false otherwise
 */
export function getGameIsStarted() {
  return gameState.isStarted;
} /* getGameIsStarted */

/**
 * Attempts to update game state by forcing a new game state object
 * on top of the existing game state
 * @param { Types.GameState } newGameState game state that takes priority
 */
export function setGameState(newGameState) {
  Object.assign(gameState, newGameState);
} /* setGameState */
