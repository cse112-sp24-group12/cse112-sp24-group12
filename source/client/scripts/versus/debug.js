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
    suite: 'swords',
    number: 10,
  },
  {
    suite: 'pentacles',
    number: 4,
  },
];

/** @type { Types.Card } */
const DEBUG_OPPONENT_CARD = {
  suite: 'cups',
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
 * Toggles between lobby and game board views
 */
function debugToggleView() {
  const lobbyWrapperEl = document.querySelector('#lobby_menu');
  const gameBoardWrapperEl = document.querySelector('#game_board');

  lobbyWrapperEl.classList.toggle('hidden');
  gameBoardWrapperEl.classList.toggle('hidden');
} /* debugToggleView */

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
  const toggleViewButtonEl = document.querySelector('#debug_toggle_view_btn');
  const startGameButtonEl = document.querySelector('#debug_start_game_btn');
  const oppMoveButtonEl = document.querySelector('#debug_opponent_move_btn');
  const revealCardsButtonEl = document.querySelector('#debug_reveal_cards_btn');

  toggleViewButtonEl.addEventListener('click', debugToggleView);
  startGameButtonEl.addEventListener('click', debugStartGame);
  oppMoveButtonEl.addEventListener('click', debugOpponentMove);
  revealCardsButtonEl.addEventListener('click', debugRevealCards);
} /* initializeDebug */
