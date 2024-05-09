/** @module debug */

import {
  handleCardsDrawn,
  handleOpponentMove,
  handleRevealCards,
  // handleRoundStart,
} from './versus.js';

const DEBUG_TEST_CARD_LIST = [
  {
    suite: 'test',
    number: 5,
  },
  {
    suite: 'test',
    number: 4,
  },
];

const DEBUG_OPPONENT_CARD = {
  suite: 'opp_suite',
  number: 6,
};

/**
 *
 */
export function toggleDebugMenu() {
  const debugMenuEl = document.querySelector('#debug_menu');

  debugMenuEl.classList.toggle('hidden');
} /* toggleDebugMenu */

/**
 *
 */
function debugCardsDrawn() {
  handleCardsDrawn(DEBUG_TEST_CARD_LIST);
} /* debugCardsDrawn */

/**
 *
 */
function debugOpponentMove() {
  handleOpponentMove();
} /* debugOpponentMove */

/**
 *
 */
function debugRevealCards() {
  handleRevealCards(DEBUG_OPPONENT_CARD, 'user');
} /* debugRevealCards */

/**
 *
 */
function init() {
  const cardsDrawnButtonEl = document.querySelector('#cards_drawn_button');
  const opponentMoveButtonEl = document.querySelector('#opponent_move_button');
  const revealCardsButtonEl = document.querySelector('#reveal_cards_button');

  cardsDrawnButtonEl.addEventListener('click', debugCardsDrawn);
  opponentMoveButtonEl.addEventListener('click', debugOpponentMove);
  revealCardsButtonEl.addEventListener('click', debugRevealCards);
} /* init */

window.addEventListener('DOMContentLoaded', init);
