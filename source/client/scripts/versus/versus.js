/** @module versus */

import {
  selectCard,
  joinInstance,
  startGame,
  startRound,
  attachGameCallbackFns,
} from './socket.js';
import {
  updateProfile,
  getScore,
  getPlayerUUIDs,
  initializePlayers,
  setRemainingCards,
  getRemainingCards,
  setGameIsStarted,
  setSelfSelectedCard,
  setOppSelectedCard,
  setRoundWinner,
  createNewRoundState,
  getRoundNumber,
} from './store.js';
import * as Types from './types.js';

const OPPONENT_MOVE_MESSAGE = "Waiting for opponent's move...";
const USER_MOVE_MESSAGE = 'Select and play a card';

/**
 * Updates display of current user lobby, including game code and active players
 * @param { {
 *  gameCode: number,
 *  profileList: Types.ServerToClientProfile[]
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

  initializePlayers(profileList.map((profile) => profile.uuid));
} /* handleUpdateInstance */

/**
 * Displays start of game instance, including cards being drawn
 * @param { Types.Card[] } drawnCardNames cards "drawn" by the user, passed from server
 */
export function handleGameStart(drawnCardNames) {
  const lobbyWrapperEl = document.querySelector('#lobby_menu');
  const gameBoardWrapperEl = document.querySelector('#game_board');

  lobbyWrapperEl.classList.add('hidden');
  gameBoardWrapperEl.classList.remove('hidden');

  setRemainingCards(drawnCardNames);
  setGameIsStarted();

  createCardElements();
  initializeScoreboard();

  handleStartRound();
} /* handleGameStart */

/**
 * Initializes score, round, and time remaining counters
 * located on the game board
 */
function initializeScoreboard() {
  const scoreInfoWrapperEl = document.querySelector('#score_info');
  const roundNumberEl = document.querySelector('#round_number');
  const timeRemainingEl = document.querySelector('#time_remaining');

  scoreInfoWrapperEl.replaceChildren(
    ...getPlayerUUIDs().map((UUID) => {
      const scoreInfoEl = document.createElement('p');
      const scoreCounterEl = document.createElement('span');
      scoreCounterEl.innerText = '0';

      const versusUsernameEl = document.createElement('versus-username');
      versusUsernameEl.setAttribute('uuid', UUID);

      scoreInfoEl.replaceChildren(versusUsernameEl, ': ', scoreCounterEl);

      return scoreInfoEl;
    }),
  );

  roundNumberEl.innerText = '0';
  timeRemainingEl.innerText = '0 sec';
} /* initializeScoreboard */

/**
 *
 */
function updateScoreboardScores() {
  const scoreInfoWrapperEl = document.querySelector('#score_info');
  const scoreInfoEls = scoreInfoWrapperEl.querySelectorAll('p');

  [...scoreInfoEls].forEach((scoreInfoEl) => {
    const versusUsernameEl = scoreInfoEl.querySelector('versus-username');
    const scoreCounterEl = scoreInfoEl.querySelector('span');

    scoreCounterEl.innerText = getScore(versusUsernameEl.getAttribute('uuid'));
  });
} /* updateScoreboardScores */

/**
 *
 */
function updateScoreboardRoundNumber() {
  const roundNumberEl = document.querySelector('#round_number');

  roundNumberEl.innerText = getRoundNumber();
} /* */

/**
 * Adds card images to the DOM at start of game
 * @param { Types.Card[] } drawnCardNames cards "drawn" by the user, passed from the server
 */
function createCardElements() {
  const cardWrapperEl = document.querySelector('#user_cards');
  const drawnCardTemplateEl = document.querySelector('#card-template');

  cardWrapperEl.replaceChildren(
    ...getRemainingCards().map((drawnCardName, i) => {
      const drawnCardEl = drawnCardTemplateEl.content.cloneNode(true);

      const cardInputEl = drawnCardEl.querySelector('input');
      const cardLabelEl = drawnCardEl.querySelector('label');
      const cardContentEl = drawnCardEl.querySelector('.front-card');

      const htmlIdName = `drawn_card_${i}`;

      cardLabelEl.htmlFor = htmlIdName;
      cardInputEl.id = htmlIdName;
      cardInputEl.value = JSON.stringify(drawnCardName);
      cardContentEl.innerText = JSON.stringify(drawnCardName);

      cardInputEl.addEventListener('change', handleCardSelection);

      return drawnCardEl;
    }),
  );
} /* createCardElements */

/**
 * Rebuilds entire game board (without animation); can be used to resolve errors
 * and in the case of re-joining instances
 */
export function refreshEntireGame() {
  // TODO: build out
} /* refreshEntireGame */

/**
 * Displays fact that opponent user has played a card, without yet revealing what
 * that card is
 */
export function handleOpponentMove() {
  const opponentPlayedCardEl = document.querySelector('#opp_played_card');

  opponentPlayedCardEl.style.backgroundColor = 'red'; // TODO : remove

  setOppSelectedCard('played');
} /* handleOpponentMove */

/**
 * Displays end-of-round information, i.e. opponent's card is revealed along with winner of the game
 * @param { Types.Card } opponentSelectedCard information of card chosen by opponent
 * @param { Types.ServerToClientProfile } roundWinner profile data of (user/opponent) who won round
 */
export function handleRevealCards(opponentSelectedCard, roundWinner) {
  const opponentPlayedCardEl = document.querySelector('#opp_played_card');
  const startRoundButtonEl = document.querySelector('#start_round_button');

  opponentPlayedCardEl.style.backgroundColor = 'white'; // TODO : remove
  opponentPlayedCardEl.innerText = JSON.stringify(opponentSelectedCard);

  const versusUsernameEl = document.createElement('versus-username');
  versusUsernameEl.setAttribute('uuid', roundWinner.uuid);
  updateCurrentInstruction(versusUsernameEl, ' won the game!');

  startRoundButtonEl.classList.remove('hidden');

  setOppSelectedCard(opponentPlayedCardEl);
  setRoundWinner(roundWinner.uuid);
  updateScoreboardScores();
} /* handleRevealCards */

/**
 * Handles reset of UI at the start of each new round
 */
export function handleStartRound() {
  const startRoundButtonEl = document.querySelector('#start_round_button');
  const opponentPlayedCardEl = document.querySelector('#opp_played_card');
  const selfPlayedCardSlotEl = document.querySelector('#self_played_card');

  startRoundButtonEl.classList.add('hidden');

  opponentPlayedCardEl.style.backgroundColor = '';
  opponentPlayedCardEl.innerText = '';

  selfPlayedCardSlotEl.replaceChildren();

  updateCurrentInstruction(USER_MOVE_MESSAGE);
  createNewRoundState();

  updateScoreboardRoundNumber();
} /* handleStartRound */

/**
 * Displays end-of-game information, namely who won
 * @param { Types.ServerToClientProfile } gameWinner profile data of (user/opponent) who won game
 */
export function handleGameEnd(gameWinner) {
  const startRoundButtonEl = document.querySelector('#start_round_button');

  startRoundButtonEl.classList.add('hidden');

  const versusUsernameEl = document.createElement('versus-username');
  versusUsernameEl.setAttribute('uuid', gameWinner.uuid);
  updateCurrentInstruction(versusUsernameEl, ' won the game!');
} /* handleGameEnd */

/**
 *
 * @param { (string|Node)[] } newChildEls
 */
function updateCurrentInstruction(...newChildEls) {
  const currentInstructionEl = document.querySelector('#current_instruction');

  currentInstructionEl.replaceChildren(...newChildEls);
} /* updateCurrentInstruction */

/**
 * Relays card selection to server during gameplay, and relocates
 * corresponding card to center screen
 */
function handleCardSelection() {
  const cardInputEls = document.querySelectorAll('input[name="selected_card"]');
  const selectedCardInputEl = [...cardInputEls].find((el) => el.checked);
  const selectedParentCardEl = selectedCardInputEl.closest('.user-card');
  const selfPlayedCardSlotEl = document.querySelector('#self_played_card');

  const selectedCard = selectedCardInputEl.value;
  if (!selectedCard) return;

  selectCard(JSON.parse(selectedCard));
  setSelfSelectedCard(selectedCard);

  selectedCardInputEl.remove();
  selectedParentCardEl.remove();

  selfPlayedCardSlotEl.replaceChildren(selectedParentCardEl);
  updateCurrentInstruction(OPPONENT_MOVE_MESSAGE);
} /* handleCardSelection */

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

  joinGameButtonEl.addEventListener('click', sendJoinInstance);
  outboundGameCodeInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendJoinInstance();
  });
  startGameButtonEl.addEventListener('click', startGame);
  startRoundButtonEl.addEventListener('click', startRound);
} /* function initializeVersus() {
 */
