/** @module versus */

import {
  initializeWebSocket,
  selectCard,
  joinInstance,
  startGame,
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
 * @param { 'user'|'opponent' } roundWinner
 */
export function handleRevealCards(opponentSelectedCard, roundWinner) {
  const opponentCardEl = document.querySelector('#opponent_card');
  const roundWinnerEl = document.querySelector('#round_winner');

  opponentCardEl.innerText = JSON.stringify(opponentSelectedCard);
  roundWinnerEl.innerText = roundWinner;
} /* handleRevealCards */

/**
 *
 * @param { 'user'|'opponent' } gameWinner
 */
export function handleGameEnd(gameWinner) {
  const gameWinnerEl = document.querySelector('#game_winner');

  gameWinnerEl.innerText = gameWinner;
} /* handleGameEnd */

/**
 *
 */
function handleSelectCard() {
  const cardSelectEl = document.querySelector('#card_select_list');

  if (!cardSelectEl.value) return;

  selectCard(JSON.parse(cardSelectEl.value));

  cardSelectEl.removeChild([...cardSelectEl.children].find((el) => el.value === cardSelectEl.value));
} /* handleSelectCard */

/**
 * HACK : REPLACE THIS FUNCTION WITH A CALL TO PROFILE.JS FROM settings-menu BRANCH
 */
function createSelfProfile() {
  return {
    username: Math.random().toString(),
    profileImageName: 'dragon',
  };
}

/**
 *
 */
function handleJoinInstance() {
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');

  const gameCode = outboundGameCodeInputEl.value;
  outboundGameCodeInputEl.value = '';

  if (!gameCode) return;

  joinInstance(gameCode);
}

/**
 *
 */
function handleStartGame() {
  startGame();
}

/**
 *
 */
function init() {
  const selectCardButtonEl = document.querySelector('#card_select_button');
  const joinGameButtonEl = document.querySelector('#join_game_button');
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');
  const startGameButtonEl = document.querySelector('#start_game_button');

  initializeWebSocket(createSelfProfile(), {
    handleUpdateInstance,
    handleCardsDrawn,
    handleOpponentMove,
    handleRevealCards,
    handleGameEnd,
  });

  selectCardButtonEl.addEventListener('click', handleSelectCard);
  joinGameButtonEl.addEventListener('click', handleJoinInstance);
  outboundGameCodeInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleJoinInstance();
  });
  startGameButtonEl.addEventListener('click', handleStartGame);
} /* init */

document.addEventListener('DOMContentLoaded', init);
