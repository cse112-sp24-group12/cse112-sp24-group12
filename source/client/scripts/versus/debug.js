/** @module debug */

import {
  handleGameStart,
  handleOpponentMove,
  handleGameEnd,
} from './versus.js';
import * as Types from './types.js';
import { getPlayerUUID } from '../profile.js';
import { getOpponentUUID } from './store.js';

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
 * Simulates game end behavior (i.e., animations)
 */
function debugGameEndYou() {
  handleGameEnd({
    uuid: getPlayerUUID(),
  });
} /* debugGameEnd */

/**
 * Simulates game end behavior (i.e., animations)
 */
function debugGameEndOpp() {
  handleGameEnd({
    uuid: getOpponentUUID(),
  });
} /* debugGameEnd */

/**
 * Initializes listeners to debug menu in Versus mode
 */
export function initializeDebug() {
  const toggleViewButtonEl = document.querySelector('#debug_toggle_view_btn');
  const startGameButtonEl = document.querySelector('#debug_start_game_btn');
  const oppMoveButtonEl = document.querySelector('#debug_opponent_move_btn');
  const gameEndYouButtonEl = document.querySelector(
    '#debug_game_end_animation_you_btn',
  );
  const gameEndOppButtonEl = document.querySelector(
    '#debug_game_end_animation_opp_btn',
  );

  toggleViewButtonEl.addEventListener('click', debugToggleView);
  startGameButtonEl.addEventListener('click', debugStartGame);
  oppMoveButtonEl.addEventListener('click', debugOpponentMove);
  gameEndYouButtonEl.addEventListener('click', debugGameEndYou);
  gameEndOppButtonEl.addEventListener('click', debugGameEndOpp);
} /* initializeDebug */
