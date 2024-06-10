/** @module store */

import { UPDATE_USERNAME_LISTENER_NAME, WORLD_EVENTS } from './types.js';
import * as Types from './types.js';
import { getPlayerUUID } from './../profile.js';
import { areCardsEqual, getCurrentRoundState } from './util.js';

/** @type { Types.ServerToClientProfile } */
const userProfilesByUUID = {};

/** @type { Types.GameState } */
let gameState = {
  byPlayer: {},
  byRound: [],
  isStarted: false,
  gameWinner: null,
};

/**
 * Sets the winner of the current/most recent round
 * @param { Types.UUID } playerUUID unique identifier of round winner
 */
export function setRoundWinnerUUID(playerUUID) {
  getCurrentRoundState(gameState).roundWinner = playerUUID;
  gameState.byPlayer[playerUUID].score += 1;
} /* setRoundWinner */

/**
 * Fetches UUID of user that won the current round
 * @returns { Types.UUID } unique ID corresponding to round winner
 */
export function getRoundWinnerUUID() {
  return getCurrentRoundState(gameState).roundWinner;
} /* getRoundWinnerUUID */

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
 * Fetches world event associated to current round
 * @returns { string } value of WORLD_EVENT enum
 */
export function getCurrentWorldEvent() {
  return getCurrentRoundState(gameState).worldEvent ?? WORLD_EVENTS.NONE;
} /* getCurrentWorldEvent */

/**
 * Fetches card selected by the user during the current round
 * @returns { Types.Card|null } card selected by the user in the current round,
 * or null if no card has been selected
 */
export function getSelfSelectedCard() {
  return getCurrentRoundState(gameState).selectedCard[getPlayerUUID()] ?? null;
} /* getSelfSelectedCard */

/**
 * Determines the UUID of the opponent player by finding the first (only)
 * UUID that doesn't match the client user
 * @returns { Types.UUID } UUID of opponent user
 */
export function getOpponentUUID() {
  const playerUUID = getPlayerUUID();
  return Object.keys(gameState.byPlayer).find((UUID) => UUID !== playerUUID);
} /* getOpponentUUID */

/**
 * For the current round, sets the opponent's selected card and tosses out
 * a random card from the opponent's remaining cards (b/c they are anonymized anyways)
 * @param { Types.IndeterminateCard } selectedCard card selected by the
 * opponent user, passed from the server
 */
export function setOppSelectedCard(selectedCard) {
  const opponentUUID = getOpponentUUID();

  getCurrentRoundState(gameState).selectedCard[opponentUUID] = selectedCard;
  gameState.byPlayer[opponentUUID].remainingCards.pop();
} /* setOppSelectedCard */

/**
 * For the current round, returns whether or not the opponent player has already
 * played a card
 * @returns { boolean } true if opponent has played this round; false otherwise
 */
export function getOppHasPlayedRound() {
  return !!getCurrentRoundState(gameState).selectedCard[getOpponentUUID()];
} /* getOppHasPlayedRound */

/**
 * For the current round, returns whether or not the client user has already
 * played a card
 * @returns { boolean } true if client user has played this round; false otherwise
 */
export function getSelfHasPlayedRound() {
  return !!getCurrentRoundState(gameState).selectedCard[getPlayerUUID()];
} /* getOppHasPlayedRound */

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
        ...gameState.byPlayer[UUID],
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
 * Fetches the number of cards that the opponent still has (cards themselves
 * are still unknown)
 * @returns { number } number of cards that opponent has in hand
 */
export function getNumOpponentCards() {
  return gameState.byPlayer[getOpponentUUID()].remainingCards.length;
} /* getNumOpponentCards */

/**
 * Sets an anonymized list of cards of same length as numOpponentCards in the data store
 * for future access
 * @param { number } numOpponentCards number of remaining cards that the opponent has
 */
export function setNumOpponentCards(numOpponentCards) {
  gameState.byPlayer[getOpponentUUID()].remainingCards = Array.from({
    length: numOpponentCards,
  });
} /* setNumOpponentCards */

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
 * Sets unique ID of user that won the game
 * @param { Types.UUID } gameWinnerUUID unique ID of game winner
 */
export function setGameWinnerUUID(gameWinnerUUID) {
  gameState.gameWinner = gameWinnerUUID;
} /* setGameWinner */

/**
 * Fetches UUID of user that won the game
 * @returns { Types.UUID } unique ID of game winner
 */
export function getGameWinnerUUID() {
  return gameState.gameWinner;
} /* getGameWinner */

/**
 * Attempts to update game state by forcing a new game state object
 * on top of the existing game state
 * @param { Types.GameState } newGameState game state that takes priority
 */
export function setGameState(newGameState) {
  gameState = { ...gameState, ...newGameState };
} /* setGameState */

/**
 *
 */
export function clearGameState() {
  Object.assign(gameState, {
    byPlayer: {},
    byRound: [],
    isStarted: false,
    gameWinner: null,
  });
} /* clearGameState */
