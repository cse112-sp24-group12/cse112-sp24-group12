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
 *
 * @param { Types.UUID } playerUUID
 */
export function setRoundWinner(playerUUID) {
  getCurrentRoundState(gameState).roundWinner = playerUUID;
  gameState.byPlayer[playerUUID].score += 1;
} /* setRoundWinner */

/**
 *
 */
export function createNewRoundState() {
  gameState.byRound.push({
    selectedCard: {},
    roundWinner: null,
  });
} /* createNewRoundState */

/**
 *
 * @param { Types.Card } selectedCard
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
 *
 * @param { Types.IndeterminateCard } selectedCard
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
 * @param { Types.ServerToClientProfile } profile
 */
export function updateProfile(profile) {
  userProfilesByUUID[profile.uuid] = profile;
  window.dispatchEvent(new Event(UPDATE_USERNAME_LISTENER_NAME));
} /* updateProfile */

/**
 *
 * @param { Types.UUID } playerUUID
 * @returns { Types.ServerToClientProfile }
 */
export function getProfile(playerUUID) {
  return userProfilesByUUID[playerUUID];
} /* getProfile */

/**
 * Fetches game score corresponding to user profile
 * with a given UUID
 * @param { Types.UUID} playerUUID
 * @returns { number } number of rounds won by player
 */
export function getScore(playerUUID) {
  return gameState.byPlayer[playerUUID].score;
} /* getScore */

/**
 * @returns { number }
 */
export function getRoundNumber() {
  return gameState.byRound.length;
} /* getRoundNumber */

/**
 *
 * @param { Types.UUID[] } playerUUIDs
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
 *
 * @param { Types.Card[] } remainingCards
 */
export function setRemainingCards(remainingCards) {
  gameState.byPlayer[getPlayerUUID()].remainingCards = remainingCards;
} /* setRemainingCards */

/**
 * 
 * @returns { Types.Card[] } 
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
 *
 */
export function setGameIsStarted() {
  gameState.isStarted = true;
} /* setGameIsStarted */
