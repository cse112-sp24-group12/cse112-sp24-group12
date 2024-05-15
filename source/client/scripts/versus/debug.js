/** @module debug */

import {
  handleGameStart,
  handleOpponentMove,
  handleRevealCards,
} from './versus.js';
import * as Types from './types.js';

/** @type { Types.Card[] } */
const DEBUG_TEST_CARD_LIST = [
  {
    suite: 'suite1',
    number: 5,
  },
  {
    suite: 'suite2',
    number: 4,
  },
];

/** @type { Types.Card } */
const DEBUG_OPPONENT_CARD = {
  suite: 'suite_opp',
  number: 6,
};

/** @type { Types.ServerToClientProfile } */
const DEBUG_OPPONENT_PROFILE = {
  uuid: 'debug-uuid-123',
  username: 'OpponentUser',
  profileImageName: 'dragon',
};

/**
 * Shows/hides display of debug menu
 */
export function toggleDebugMenu() {
  const debugMenuEl = document.querySelector('#debug_menu');

  debugMenuEl.classList.toggle('hidden');
} /* toggleDebugMenu */

/**
 * Simulates server-side message that cards have been drawn
 */
function debugStartGame() {
  handleGameStart(DEBUG_TEST_CARD_LIST);
} /* debugStartGame */

/**
 * Simulates server-side message that opponent moved
 */
function debugOpponentMove() {
  handleOpponentMove();
} /* debugOpponentMove */

/**
 * Simulates server-side round-end behavior
 */
function debugRevealCards() {
  handleRevealCards(DEBUG_OPPONENT_CARD, DEBUG_OPPONENT_PROFILE);
} /* debugRevealCards */

/**
 * Initializes listeners to debug menu in Versus mode
 */
export function initializeDebug() {
  const startGameButtonEl = document.querySelector('#debug_start_game_button');
  const opponentMoveButtonEl = document.querySelector(
    '#debug_opponent_move_button',
  );
  const revealCardsButtonEl = document.querySelector(
    '#debug_reveal_cards_button',
  );

  startGameButtonEl.addEventListener('click', debugStartGame);
  opponentMoveButtonEl.addEventListener('click', debugOpponentMove);
  revealCardsButtonEl.addEventListener('click', debugRevealCards);
} /* initializeDebug */
