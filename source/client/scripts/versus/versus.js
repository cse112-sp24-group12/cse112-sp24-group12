/** @module versus */

import {
  selectCard,
  joinInstance,
  startGame,
  startRound,
  attachGameCallbackFns,
  sendInitializationRequest,
} from './socket.js';
import {
  updateProfile,
  getScore,
  getPlayerUUIDs,
  initializePlayers,
  setRemainingCards,
  getRemainingCards,
  setNumOpponentCards,
  getNumOpponentCards,
  setGameIsStarted,
  getGameIsStarted,
  setSelfSelectedCard,
  setOppSelectedCard,
  setRoundWinner,
  createNewRoundState,
  getRoundNumber,
  getOppHasPlayedRound,
  clearGameState,
} from './store.js';
import { clearChat } from './chat.js';
import { getRandFromArr } from './util.js';
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
  setRemainingCards(drawnCardNames);
  setNumOpponentCards(drawnCardNames.length);
  setGameIsStarted();
  createCardElements();
  initializeScoreboard();
  handleStartRound();
  toggleToGameboardView();
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
      scoreCounterEl.innerText = getScore(UUID);

      const versusUsernameEl = document.createElement('versus-username');
      versusUsernameEl.setAttribute('uuid', UUID);

      scoreInfoEl.replaceChildren(versusUsernameEl, ': ', scoreCounterEl);

      return scoreInfoEl;
    }),
  );

  roundNumberEl.innerText = getRoundNumber();
  timeRemainingEl.innerText = '0 sec';
} /* initializeScoreboard */

/**
 * Populates scoreboard scores with most recent scores from store
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
 * Populates scoreboard round number with current round from store
 */
function updateScoreboardRoundNumber() {
  const roundNumberEl = document.querySelector('#round_number');

  roundNumberEl.innerText = getRoundNumber();
} /* updateScoreboardRoundNumber */

/**
 * Adds card images to the DOM at start of game
 */
function createCardElements() {
  const userCardWrapperEl = document.querySelector('#user_cards');
  const opponentCardWrapperEl = document.querySelector('#opponent_cards');

  userCardWrapperEl.replaceChildren(
    ...getRemainingCards().map((remainingCard) => {
      const versusCardEl = document.createElement('versus-card');

      versusCardEl.setAttribute('variant', 'front');
      versusCardEl.setAttribute('suite', remainingCard.suite);
      versusCardEl.setAttribute('number', remainingCard.number);

      versusCardEl.addEventListener('change', handleCardSelection);

      return versusCardEl;
    }),
  );

  opponentCardWrapperEl.replaceChildren(
    ...Array.from({ length: getNumOpponentCards() }).map(() => {
      const versusCardEl = document.createElement('versus-card');

      versusCardEl.setAttribute('variant', 'back');
      versusCardEl.toggleAttribute('disabled', true);

      return versusCardEl;
    }),
  );
} /* createCardElements */

/**
 *
 */
function toggleToGameboardView() {
  const lobbyWrapperEl = document.querySelector('#lobby_menu');
  const gameBoardWrapperEl = document.querySelector('#game_board');
  const leaveGameButtonEl = document.querySelector('#leave_game_button');
  const homeButtonEl = document.querySelector('#home_button');

  lobbyWrapperEl.classList.add('hidden');
  homeButtonEl.classList.add('hidden');
  gameBoardWrapperEl.classList.remove('hidden');
  leaveGameButtonEl.classList.remove('hidden');
} /* toggleToGameboardView */

/**
 *
 */
function toggleToLobbyView() {
  const lobbyWrapperEl = document.querySelector('#lobby_menu');
  const gameBoardWrapperEl = document.querySelector('#game_board');
  const leaveGameButtonEl = document.querySelector('#leave_game_button');
  const homeButtonEl = document.querySelector('#home_button');

  gameBoardWrapperEl.classList.add('hidden');
  leaveGameButtonEl.classList.add('hidden');
  lobbyWrapperEl.classList.remove('hidden');
  homeButtonEl.classList.remove('hidden');
} /* toggleToLobbyView */

/**
 * Rebuilds entire game board; can be used to resolve errors and in the case of
 * re-joining instances
 */
export function refreshEntireGame() {
  if (!getGameIsStarted()) return;

  initializeScoreboard();
  createCardElements();
  toggleToGameboardView();
} /* refreshEntireGame */

/**
 * Displays fact that opponent user has played a card, without yet revealing what
 * that card is
 */
export async function handleOpponentMove() {
  const oppDeckSlotEl = document.querySelector('#opponent_cards');
  const oppCardSlotEl = document.querySelector('#opp_played_card');

  const oppRemainingCardEls = oppDeckSlotEl.querySelectorAll('versus-card');
  const oppCardEl = getRandFromArr(oppRemainingCardEls);

  setOppSelectedCard('played');

  await oppCardEl.translateToContainer(oppCardSlotEl);
} /* handleOpponentMove */

/**
 * Displays end-of-round information, i.e. opponent's card is revealed along with winner of the game
 * @param { Types.Card } opponentSelectedCard information of card chosen by opponent
 * @param { Types.ServerToClientProfile } roundWinner profile data of (user/opponent) who won round
 */
export async function handleRevealCards(opponentSelectedCard, roundWinner) {
  const oppCardSlotEl = document.querySelector('#opp_played_card');
  const startRoundButtonEl = document.querySelector('#start_round_button');

  if (!getOppHasPlayedRound()) await handleOpponentMove();

  const oppVersusCardEl = oppCardSlotEl.querySelector('versus-card');

  oppVersusCardEl.setAttribute('suite', opponentSelectedCard.suite);
  oppVersusCardEl.setAttribute('number', opponentSelectedCard.number);
  oppVersusCardEl.setAttribute('variant', 'front');

  const versusUsernameEl = document.createElement('versus-username');
  versusUsernameEl.setAttribute('uuid', roundWinner.uuid);
  updateCurrentInstruction(versusUsernameEl, ' won the round!');

  startRoundButtonEl.classList.remove('hidden');

  setOppSelectedCard(opponentSelectedCard);
  setRoundWinner(roundWinner.uuid);
  updateScoreboardScores();
} /* handleRevealCards */

/**
 * Handles reset of UI at the start of each new round
 */
export function handleStartRound() {
  const startRoundButtonEl = document.querySelector('#start_round_button');
  const oppCardSlotEl = document.querySelector('#opp_played_card');
  const selfCardSlotEl = document.querySelector('#self_played_card');

  startRoundButtonEl.classList.add('hidden');

  oppCardSlotEl.replaceChildren();
  selfCardSlotEl.replaceChildren();

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
 */
function returnToLobby() {
  toggleToLobbyView();
  clearGameState();
  clearChat();
  sendInitializationRequest();
} /* returnToLobby */

/**
 *
 */
export function handleInstanceClosed() {
  const instClosedModalEl = document.querySelector('#instance_closed_modal');

  instClosedModalEl.addEventListener('close', returnToLobby);
  instClosedModalEl.showModal();
} /* handleInstanceClosed */

/**
 * Inserts new content into the instruction box, overriding any existing content
 * @param { ...(string|Node) } newChildEls new elements or strings to insert
 */
function updateCurrentInstruction(...newChildEls) {
  const currentInstructionEl = document.querySelector('#current_instruction');

  currentInstructionEl.replaceChildren(...newChildEls);
} /* updateCurrentInstruction */

/**
 * Relays card selection to server during gameplay, and relocates
 * corresponding card to center screen
 * @param { MouseEvent } e click event passed by event listener
 */
async function handleCardSelection(e) {
  const selectedVersusCardEl = e.currentTarget;
  const selectedCardInputEl = selectedVersusCardEl.querySelector('input');
  const selfPlayedCardSlotEl = document.querySelector('#self_played_card');

  const selectedCard = selectedCardInputEl.value;
  if (!selectedCard) return;

  selectCard(JSON.parse(selectedCard));
  setSelfSelectedCard(selectedCard);

  selectedVersusCardEl.toggleAttribute('disabled', true);

  updateCurrentInstruction(OPPONENT_MOVE_MESSAGE);

  await selectedVersusCardEl.translateToContainer(selfPlayedCardSlotEl);
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
 *
 */
function handleLeaveGame() {
  const confirmLeaveModalEl = document.querySelector('#confirm_leave_modal');
  const confirmLeaveButtonEl = document.querySelector('#confirm_leave_button');

  confirmLeaveButtonEl.addEventListener(
    'click',
    () => {
      confirmLeaveModalEl.close();
      returnToLobby();
    },
    { once: true },
  );

  confirmLeaveModalEl.showModal();
} /* handleLeaveGame */

/**
 * Initializes Versus game; initializes WebSocket, connects appropriate callbacks,
 * and activates event listeners
 */
export function initializeVersus() {
  const joinGameButtonEl = document.querySelector('#join_game_button');
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');
  const startGameButtonEl = document.querySelector('#start_game_button');
  const startRoundButtonEl = document.querySelector('#start_round_button');
  const leaveGameButton = document.querySelector('#leave_game_button');

  attachGameCallbackFns({
    handleUpdateInstance,
    handleGameStart,
    handleOpponentMove,
    handleRevealCards,
    handleStartRound,
    handleGameEnd,
    handleInstanceClosed,
    refreshEntireGame,
  });

  joinGameButtonEl.addEventListener('click', sendJoinInstance);
  outboundGameCodeInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendJoinInstance();
  });
  startGameButtonEl.addEventListener('click', startGame);
  startRoundButtonEl.addEventListener('click', startRound);
  leaveGameButton.addEventListener('click', handleLeaveGame);
} /* initializeVersus */
