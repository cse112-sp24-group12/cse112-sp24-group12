/** @module versus */

import {
  selectCard,
  joinInstance,
  startGame,
  startRound,
  attachGameCallbackFns,
} from './socket.js';
import { updateProfile } from './store.js';
import * as Types from './types.js';

/**
 * Updates display of current user lobby, including game code and active players
 * @param { {
 *  gameCode: number,
 *  profileList: Types.Profile[]
 * } } instanceInfo new info about game instance
 */
export function handleUpdateInstance({ gameCode, profileList } = {}) {
  const selfGameCodeReadOnlyInputEl = document.querySelector('#self_game_code');
  const lobbyProfileListEl = document.querySelector('#lobby_profile_list');

  selfGameCodeReadOnlyInputEl.value = gameCode;

  lobbyProfileListEl.replaceChildren(
    ...profileList.map((profile) => {
      updateProfile(profile);

      const profileListItemEl = document.createElement('li');
      const versusUsernameEl = document.createElement('versus-username');
      versusUsernameEl.setAttribute('uuid', profile.uuid);

      profileListItemEl.append(versusUsernameEl);

      return profileListItemEl;
    }),
  );
} /* handleUpdateInstance */

/**
 * Displays start of game instance, including cards being drawn
 * @param { Types.Card[] } drawnCardNames cards "drawn" by the user, passed from server
 */
export function handleGameStart(drawnCardNames) {
  const lobbyWrapperEl = document.querySelector('#lobby_menu');
  const gameBoardWrapperEl = document.querySelector('#game_board');
  const cardSelectEl = document.querySelector('#card_select_list');

  lobbyWrapperEl.classList.add('hidden');
  gameBoardWrapperEl.classList.remove('hidden');

  cardSelectEl.replaceChildren(
    ...drawnCardNames.map((drawnCardName) => {
      const drawnCardEl = document.createElement('option');
      drawnCardEl.value = JSON.stringify(drawnCardName);
      drawnCardEl.innerText = JSON.stringify(drawnCardName);
      return drawnCardEl;
    }),
  );

  handleStartRound();
} /* handleGameStart */

/**
 * Rebuilds entire game board (without animation); can be used to resolve errors
 * and in the case of re-joining instances
 * @param { * } gameState
 */
export function refreshEntireGame(gameState) {
  // TODO: build out
} /* refreshEntireGame */

/**
 * Displays fact that opponent user has played a card, without yet revealing what
 * that card is
 */
export function handleOpponentMove() {
  const opponentCardEl = document.querySelector('#opponent_card');

  opponentCardEl.innerText = 'Played';
} /* handleOpponentMove */

/**
 * Displays end-of-round information, i.e. opponent's card is revealed along with winner of the game
 * @param { Types.Card } opponentSelectedCard information of card chosen by opponent
 * @param { Types.ServerToClientProfile } roundWinner profile data of (user/opponent) who won round
 */
export function handleRevealCards(opponentSelectedCard, roundWinner) {
  const opponentCardEl = document.querySelector('#opponent_card');
  const roundWinnerEl = document.querySelector('#round_winner');

  opponentCardEl.innerText = JSON.stringify(opponentSelectedCard);
  roundWinnerEl.innerText = roundWinner.username;
} /* handleRevealCards */

/**
 * Handles reset of UI at the start of each new round
 */
export function handleStartRound() {
  const opponentCardEl = document.querySelector('#opponent_card');
  const roundWinnerEl = document.querySelector('#round_winner');

  opponentCardEl.innerText = '';
  roundWinnerEl.innerText = '';
} /* handleStartRound */

/**
 * Displays end-of-game information, namely who won
 * @param { Types.ServerToClientProfile } gameWinner profile data of (user/opponent) who won game
 */
export function handleGameEnd(gameWinner) {
  const gameWinnerEl = document.querySelector('#game_winner');

  gameWinnerEl.innerText = gameWinner.username;
} /* handleGameEnd */

/**
 * Relays card selection to server during gameplay
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
 * Relays attempt to join new game instance to server while in lobby
 */
function sendJoinInstance() {
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');

  const gameCode = outboundGameCodeInputEl.value;
  outboundGameCodeInputEl.value = '';

  if (!gameCode) return;

  joinInstance(gameCode);
} /* sendJoinInstance */

/**
 * Initializes Versus game; initializes WebSocket, connects appropriate callbacks,
 * and activates event listeners
 */
export function initializeVersus() {
  const selectCardButtonEl = document.querySelector('#card_select_button');
  const joinGameButtonEl = document.querySelector('#join_game_button');
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');
  const startGameButtonEl = document.querySelector('#start_game_button');
  const startRoundButtonEl = document.querySelector('#start_round_button');

  attachGameCallbackFns({
    handleUpdateInstance,
    handleGameStart,
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
  startGameButtonEl.addEventListener('click', startGame);
  startRoundButtonEl.addEventListener('click', startRound);
} /* function initializeVersus() {
 */
