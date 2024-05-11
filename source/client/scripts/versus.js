/** @module versus */

import {
  initializeWebSocket,
  selectCard,
  joinInstance,
  startGame,
  startRound,
  attachGameCallbackFns,
} from './socket.js';

/**
 *
 * @param { instanceInfo: {
 *  gameCode: number,
 *  profileList: Profile[]
 * } } instanceInfo
 */
export function handleUpdateInstance({ gameCode, profileList } = {}) {
  const selfGameCodeReadOnlyInputEl = document.querySelector('#self_game_code');
  const lobbyProfileListEl = document.querySelector('#lobby_profile_list');

  selfGameCodeReadOnlyInputEl.value = gameCode;

  lobbyProfileListEl.replaceChildren(
    ...profileList.map(({ username }) => {
      const profileListItemEl = document.createElement('li');
      profileListItemEl.innerText = username;

      return profileListItemEl;
    }),
  );
} /* handleUpdateInstance */

/**
 *
 * @param { Card[] } drawnCardNames
 */
export function handleCardsDrawn(drawnCardNames) {
  const cardSelectEl = document.querySelector('#card_select_list');

  cardSelectEl.replaceChildren(
    ...drawnCardNames.map((drawnCardName) => {
      const drawnCardEl = document.createElement('option');
      drawnCardEl.value = JSON.stringify(drawnCardName);
      drawnCardEl.innerText = JSON.stringify(drawnCardName);
      return drawnCardEl;
    }),
  );
} /* handleCardsDrawn */

/**
 *
 */
export function handleOpponentMove() {
  const opponentCardEl = document.querySelector('#opponent_card');

  opponentCardEl.innerText = 'Played';
} /* handleOpponentMove */

/**
 *
 * @param { Card } opponentSelectedCard
 * @param { ServerToClientProfile } roundWinner
 */
export function handleRevealCards(opponentSelectedCard, roundWinner) {
  const opponentCardEl = document.querySelector('#opponent_card');
  const roundWinnerEl = document.querySelector('#round_winner');

  opponentCardEl.innerText = JSON.stringify(opponentSelectedCard);
  roundWinnerEl.innerText = roundWinner.username;
} /* handleRevealCards */

/**
 *
 */
export function handleStartRound() {
  const opponentCardEl = document.querySelector('#opponent_card');
  const roundWinnerEl = document.querySelector('#round_winner');

  opponentCardEl.innerText = '';
  roundWinnerEl.innerText = '';
} /* handleStartRound */

/**
 *
 * @param { ServerToClientProfile } gameWinner
 */
export function handleGameEnd(gameWinner) {
  const gameWinnerEl = document.querySelector('#game_winner');

  gameWinnerEl.innerText = gameWinner.username;
} /* handleGameEnd */

/**
 *
 */
function sendSelectCard() {
  const cardSelectEl = document.querySelector('#card_select_list');

  if (!cardSelectEl.value) return;

  selectCard(JSON.parse(cardSelectEl.value));

  cardSelectEl.removeChild(
    [...cardSelectEl.children].find((el) => el.value === cardSelectEl.value),
  );
} /* sendSelectCard */

/**
 * HACK : REPLACE THIS FUNCTION WITH A CALL TO PROFILE.JS FROM settings-menu BRANCH
 */
function createSelfProfile() {
  return {
    username: Math.random().toString(),
    profileImageName: 'dragon',
  };
} /* createSelfProfile */

/**
 *
 */
function sendJoinInstance() {
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');

  const gameCode = outboundGameCodeInputEl.value;
  outboundGameCodeInputEl.value = '';

  if (!gameCode) return;

  joinInstance(gameCode);
} /* sendJoinInstance */

/**
 *
 */
function sendStartGame() {
  startGame();
} /* sendStartGame */

/**
 *
 */
function sendStartRound() {
  startRound();
} /* sendStartRound */

/**
 *
 */
function init() {
  const selectCardButtonEl = document.querySelector('#card_select_button');
  const joinGameButtonEl = document.querySelector('#join_game_button');
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');
  const startGameButtonEl = document.querySelector('#start_game_button');
  const startRoundButtonEl = document.querySelector('#start_round_button');

  initializeWebSocket(createSelfProfile());

  attachGameCallbackFns({
    handleUpdateInstance,
    handleCardsDrawn,
    handleOpponentMove,
    handleRevealCards,
    handleStartRound,
    handleGameEnd,
  });

  selectCardButtonEl.addEventListener('click', sendSelectCard);
  joinGameButtonEl.addEventListener('click', sendJoinInstance);
  outboundGameCodeInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendJoinInstance();
  });
  startGameButtonEl.addEventListener('click', sendStartGame);
  startRoundButtonEl.addEventListener('click', sendStartRound);
} /* init */

document.addEventListener('DOMContentLoaded', init);
