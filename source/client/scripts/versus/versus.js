/** @module versus */

import {
  selectCard,
  joinInstance,
  startGame,
  attachGameCallbackFns,
  sendInitializationRequest,
} from './socket.js';
import {
  updateProfile,
  getScore,
  initializePlayers,
  setRemainingCards,
  getRemainingCards,
  setNumOpponentCards,
  getNumOpponentCards,
  setGameIsStarted,
  getGameIsStarted,
  setSelfSelectedCard,
  setOppSelectedCard,
  setRoundWinnerUUID,
  getRoundWinnerUUID,
  createNewRoundState,
  getRoundNumber,
  getOppHasPlayedRound,
  getSelfHasPlayedRound,
  clearGameState,
  setGameWinnerUUID,
  getGameWinnerUUID,
  getOpponentUUID,
} from './store.js';
import { clearChat } from './chat.js';
import { getRandFromArr } from './util.js';
import { getPlayerUUID } from './../profile.js';
import * as Types from './types.js';

const OPPONENT_MOVE_MESSAGE = "Waiting for opponent's move...";
const USER_MOVE_MESSAGE = 'Select and play a card';

const NUM_ROUNDS = 5;

/**
 * TimeoutID for use by copyGameCodeToClipboard()
 * @type { number|undefined }
 */
let copyGameCodeTimeoutID;

/**
 * Promise that will resolve when the current card animation process
 * is complete, for use with other out-of-context animation functions
 * @type { Promise<void> }
 */
let currentAnimationPromise;

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
  const startGameButtonEl = document.querySelector('#start_game_button');

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

  if (profileList.length === 2) {
    startGameButtonEl.disabled = false;
    startGameButtonEl.focus();
  } else {
    startGameButtonEl.disabled = true;
  }
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

  scoreInfoWrapperEl.replaceChildren(
    ...[getOpponentUUID(), getPlayerUUID()].map((UUID) => {
      const scoreInfoEl = document.createElement('p');
      const scoreCounterEl = document.createElement('span');
      scoreCounterEl.innerText = getScore(UUID);

      const versusUsernameEl = document.createElement('versus-username');
      versusUsernameEl.setAttribute('uuid', UUID);

      scoreInfoEl.replaceChildren(versusUsernameEl, scoreCounterEl);

      return scoreInfoEl;
    }),
  );

  roundNumberEl.innerText = getRoundNumber();
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

  const delayIncrement = 0.5;

  userCardWrapperEl.replaceChildren(
    ...getRemainingCards().map((remainingCard, index) => {
      const versusCardEl = document.createElement('versus-card');

      versusCardEl.setAttribute('variant', 'front');
      versusCardEl.setAttribute('suite', remainingCard.suite);
      versusCardEl.setAttribute('number', remainingCard.number);

      versusCardEl.addEventListener('click', handleCardSelection);

      // Add a class to the card to trigger the animation only if it's the first call
      versusCardEl.classList.add('player-card');
      versusCardEl.style.animationDelay = `${index * delayIncrement}s`; // Apply constant delay increment
      versusCardEl.addEventListener('animationend', () => {
        versusCardEl.classList.remove('player-card');
      });

      return versusCardEl;
    }),
  );

  opponentCardWrapperEl.replaceChildren(
    ...Array.from({ length: getNumOpponentCards() }).map(
      (remainingCard, index) => {
        const versusCardEl = document.createElement('versus-card');

        versusCardEl.setAttribute('variant', 'back');
        versusCardEl.toggleAttribute('disabled', true);

        // Add a class to the card to trigger the animation only if it's the first call
        versusCardEl.classList.add('player-card');
        versusCardEl.style.animationDelay = `${index * delayIncrement}s`; // Apply constant delay increment
        versusCardEl.addEventListener('animationend', () => {
          versusCardEl.classList.remove('player-card');
        });

        return versusCardEl;
      },
    ),
  );
} /* createCardElements */

/**
 * Switch to view of game board
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
 * Switch to view of lobby, and focus on game code input element
 */
function toggleToLobbyView() {
  const lobbyWrapperEl = document.querySelector('#lobby_menu');
  const gameBoardWrapperEl = document.querySelector('#game_board');
  const leaveGameButtonEl = document.querySelector('#leave_game_button');
  const homeButtonEl = document.querySelector('#home_button');
  const outBoundGameCodeInputEl = document.querySelector('#outbound_game_code');

  gameBoardWrapperEl.classList.add('hidden');
  leaveGameButtonEl.classList.add('hidden');
  lobbyWrapperEl.classList.remove('hidden');
  homeButtonEl.classList.remove('hidden');

  outBoundGameCodeInputEl.focus();
} /* toggleToLobbyView */

/**
 * Rebuilds entire game board; can be used to resolve errors and in the case of
 * re-joining instances
 */
export function refreshEntireGame() {
  if (!getGameIsStarted()) return;

  initializeScoreboard();
  createCardElements();

  // if (/* cards have been played this round */) {
  //   /* display cards */
  // }

  const gameWinnerUUID = getGameWinnerUUID();
  const roundWinnerUUID = getRoundWinnerUUID();
  if (gameWinnerUUID) {
    displayWinner(gameWinnerUUID, 'game');
  } else if (roundWinnerUUID) {
    displayWinner(roundWinnerUUID, 'round');
  }

  toggleToGameboardView();
} /* refreshEntireGame */

/**
 * Displays fact that opponent user has played a card, without yet revealing what
 * that card is
 * @param {{ ignoreAwait: boolean }} [options]
 */
export async function handleOpponentMove({ ignoreAwait } = {}) {
  if (!ignoreAwait) await currentAnimationPromise;

  const oppDeckSlotEl = document.querySelector('#opponent_cards');
  const oppCardSlotEl = document.querySelector('#opp_played_card');

  const oppRemainingVersusCardEls =
    oppDeckSlotEl.querySelectorAll('versus-card');
  const oppVersusCardEl = getRandFromArr(oppRemainingVersusCardEls);

  setOppSelectedCard('played');

  await oppVersusCardEl.translateToContainer(oppCardSlotEl);
} /* handleOpponentMove */

/**
 * Displays message that a user won the round/game
 * @param { Types.UUID } winnerUUID winner of round/game
 * @param { 'round'|'game'} variant decorator on win message
 */
function displayWinner(winnerUUID, variant) {
  const versusUsernameEl = document.createElement('versus-username');
  versusUsernameEl.setAttribute('uuid', winnerUUID);
  updateCurrentInstruction(versusUsernameEl, ` won the ${variant}!`);
} /* displayRoundWinner */

/**
 * Animation that shows which card won for each show
 * @param { Types.UUID } roundWinnerUUID unique identifier of round winner
 * @returns { Promise<void> } promise that resolves when animation is complete
 */
async function roundWinnerAnimationCard(roundWinnerUUID) {
  const oppVersusCardEl = document.querySelector(
    '#opp_played_card versus-card',
  );
  const selfPlayedVersusCardEl = document.querySelector(
    '#self_played_card versus-card',
  );

  if (roundWinnerUUID === getPlayerUUID()) {
    // user wins round
    selfPlayedVersusCardEl.classList.add('winner-card-user');
    oppVersusCardEl.classList.add('loser-card');
  } else {
    // opp wins round
    selfPlayedVersusCardEl.classList.add('loser-card');
    oppVersusCardEl.classList.add('winner-card-opp');
  }

  return new Promise((resolve) => {
    selfPlayedVersusCardEl.addEventListener('animationend', () => {
      setTimeout(() => {
        [selfPlayedVersusCardEl, oppVersusCardEl].forEach((el) => {
          el.classList.remove(
            'winner-card-opp',
            'winner-card-user',
            'loser-card',
          );
        });
        resolve();
      }, 500);
    });
  });
} /* roundWinnerAnimationCard */

/**
 * Animation that shows either "YOU WON" or "YOU LOST" depending on the outcome for each round
 * @param { Types.UUID } roundWinnerUUID unique identifier of round winner
 * @returns { Promise<void> } promise that resolves when animation is complete
 */
async function roundWinnerAnimationText(roundWinnerUUID) {
  const oppVersusCardEl = document.querySelector(
    '#opp_played_card versus-card',
  );
  const selfPlayedVersusCardEl = document.querySelector(
    '#self_played_card versus-card',
  );
  const roundWinnerTextEl = document.querySelector('#round_end_text');
  const nextRoundWrapperEl = document.querySelector('.next-round');

  // changes the text depending on who won the round
  const isUserWinner = roundWinnerUUID === getPlayerUUID();
  roundWinnerTextEl.replaceChildren('YOU ', isUserWinner ? 'WON' : 'LOST', '!');
  roundWinnerTextEl.classList.toggle('loser-text', !isUserWinner);

  oppVersusCardEl.classList.add('no-vis');
  selfPlayedVersusCardEl.classList.add('no-vis');
  nextRoundWrapperEl.classList.add('next-round-animation');

  return new Promise((resolve) => {
    nextRoundWrapperEl.addEventListener('animationend', () => {
      setTimeout(() => {
        nextRoundWrapperEl.classList.remove('next-round-animation');
        resolve();
      }, 500);
    });
  });
} /* roundWinnerAnimationText */

/**
 * Calls animateRevealCards and awaits response, for use by other dependent animations
 * @param { Types.Card } opponentSelectedCard information of card chosen by opponent
 * @param { Types.ServerToClientProfile } roundWinner profile data of (user/opponent) who won round
 */
export async function handleRevealCards(opponentSelectedCard, roundWinner) {
  currentAnimationPromise = animateRevealCards(
    opponentSelectedCard,
    roundWinner,
  );

  await currentAnimationPromise;
} /* handleRevealCards */

/**
 * Handles async animation of card reveal promise, for use by handleRevealCards()
 * @param { Types.Card } opponentSelectedCard information of card chosen by opponent
 * @param { Types.ServerToClientProfile } roundWinner profile data of (user/opponent) who won round
 */
async function animateRevealCards(opponentSelectedCard, roundWinner) {
  const selfPlayedVersusCardEl = document.querySelector(
    '#self_played_card versus-card',
  );

  // wait until the opponent playing card animation completes
  if (!getOppHasPlayedRound()) await handleOpponentMove({ ignoreAwait: true });

  await selfPlayedVersusCardEl.getCardTranslationPromise();

  const oppVersusCardEl = document.querySelector(
    '#opp_played_card versus-card',
  );

  oppVersusCardEl.setAttribute('suite', opponentSelectedCard.suite);
  oppVersusCardEl.setAttribute('number', opponentSelectedCard.number);
  await oppVersusCardEl.flipCard('front');

  setOppSelectedCard(opponentSelectedCard);
  setRoundWinnerUUID(roundWinner.uuid);

  // plays the round winner animation
  await roundWinnerAnimationCard(roundWinner.uuid);
  await roundWinnerAnimationText(roundWinner.uuid);

  updateScoreboardScores();

  // starts the next round
  if (getRoundNumber() < NUM_ROUNDS) handleStartRound();
} /* animateRevealCards */

/**
 * Handles reset of UI at the start of each new round
 */
export function handleStartRound() {
  const oppCardSlotEl = document.querySelector('#opp_played_card');
  const selfCardSlotEl = document.querySelector('#self_played_card');

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
  setGameWinnerUUID(gameWinner.uuid);
  displayWinner(gameWinner.uuid, 'game');
} /* handleGameEnd */

/**
 * Handles world event action, updating the game legend and triggering popup
 * @param { string } worldEvent world event that was triggered
 */
export function handleWorldEvent(worldEvent) {
  const currentWorldEventMeta = document.querySelector('#current_world_event');
  const gameLegend = document.querySelector('#game-legend');
  const worldEventModal = document.querySelector('#world_event_modal');
  let img, eventName, eventDescription;

  currentWorldEventMeta.setAttribute('content', worldEvent);

  // describe world event's legend and description
  switch (worldEvent) {
    case Types.WORLD_EVENTS.LOWER_WINS:
      img = './assets/images/game_legend.webp';
      eventName = 'Lower is Better';
      eventDescription = 'The card with the lower power level wins!';
      break;
    case Types.WORLD_EVENTS.SUITE_REVERSED:
      img = './assets/images/game_legend_reversed.webp';
      eventName = 'Suite Reverse';
      eventDescription = 'The order of the winning suites gets reversed!';
      break;
    case Types.WORLD_EVENTS.SUITE_BOOST_WANDS:
      img = './assets/images/game_legend_wands_boost.webp';
      eventName = 'Wands are Boosted!';
      eventDescription = 'Wands are much stronger this round!';
      break;
    case Types.WORLD_EVENTS.SUITE_BOOST_CUPS:
      img = './assets/images/game_legend_cups_boost.webp';
      eventName = 'Cups are Boosted!';
      eventDescription = 'Cups are much stronger this round!';
      break;
    case Types.WORLD_EVENTS.SUITE_BOOST_SWORDS:
      img = './assets/images/game_legend_swords_boost.webp';
      eventName = 'Swords are Boosted!';
      eventDescription = 'Swords are much stronger this round!';
      break;
    case Types.WORLD_EVENTS.SUITE_BOOST_PENTACLES:
      img = './assets/images/game_legend_pentacles_boost.webp';
      eventName = 'Pentacles are Boosted!';
      eventDescription = 'Pentacles are much stronger this round!';
      break;
    case Types.WORLD_EVENTS.RANDOM_VALUE:
      img = './assets/images/game_legend.webp';
      eventName = 'Random Values';
      eventDescription = "Your cards' values are randomized this round!";
      break;
    case Types.WORLD_EVENTS.RANDOM_SUITE:
      img = './assets/images/game_legend.webp';
      eventName = 'Random Suites';
      eventDescription = "Your cards' suites are randomized this round!";
      break;
    default:
      gameLegend.src = './assets/images/game_legend.webp';
      gameLegend.alt =
        'Game legend explaining that wands beat cups, cups beat swords, swords beat wands, and pentacles are neutral';
  }

  // update world event popup
  if (worldEvent !== Types.WORLD_EVENTS.NONE) {
    const worldEventPopupImg = document.createElement('img');
    const modalHead = worldEventModal.querySelector('h2');
    const modalText = worldEventModal.querySelector('p');
    worldEventPopupImg.src = img;
    worldEventPopupImg.id = 'world-event-popup';
    worldEventPopupImg.alt = eventDescription;

    modalHead.innerHTML = eventName;
    modalText.innerHTML = eventDescription;
    worldEventModal.insertBefore(worldEventPopupImg, modalText.nextSibling);

    worldEventModal.showModal();
  }
}

/**
 * Animates world event popup to replace current legend;
 * at the end of the animation, the legend will be moved
 * into the container in the DOM as well
 * @returns { Promise<void> }
 */
async function translateWorldEvent() {
  const gameLegend = document.querySelector('#game-legend');
  const worldEventPopupImg = document.querySelector('#world-event-popup');

  /* calculate difference between current and desired position */
  const worldEventPopupImgRect = worldEventPopupImg.getBoundingClientRect();
  const gameLegendElRect = gameLegend.getBoundingClientRect();

  const diffXPos = worldEventPopupImgRect.left - gameLegendElRect.left;
  const diffYPos = worldEventPopupImgRect.top - gameLegendElRect.top;

  const scaleXDim = gameLegendElRect.width / worldEventPopupImgRect.width;
  const scaleYDim = gameLegendElRect.height / worldEventPopupImgRect.height;

  /* swap and translate */
  gameLegend.parentElement.replaceChildren(worldEventPopupImg);
  worldEventPopupImg.id = 'game-legend';

  const translationAnimation = worldEventPopupImg.animate(
    [
      {
        transform: `translate(${diffXPos}px, ${diffYPos}px) scale(${scaleXDim}, ${scaleYDim})`,
      },
      {},
    ],
    {
      duration: 500,
    },
  );

  /* promise for blocking animation */
  this._translationAnimationPromise = new Promise((resolve) => {
    translationAnimation.addEventListener(
      'finish',
      () => {
        resolve();
      },
      { once: true },
    );
  });

  return this._translationAnimationPromise;
} /* translateWorldEvent*/

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

  instClosedModalEl.addEventListener('close', returnToLobby); // TODO: fix multiple attachment when opening/closing many times
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
  if (!selectedCard || getSelfHasPlayedRound()) return;

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
  ); // TODO: fix multiple attachment when opening and closing modal many times

  confirmLeaveModalEl.showModal();
} /* handleLeaveGame */

/**
 *
 */
async function copyGameCodeToClipboard() {
  const selfGameCodeReadOnlyInputEl = document.querySelector('#self_game_code');
  const copyGameCodeButtonEl = document.querySelector('#copy_game_code_button');

  navigator.clipboard
    .writeText(selfGameCodeReadOnlyInputEl.value)
    .then(() => {
      clearTimeout(copyGameCodeTimeoutID);
      copyGameCodeButtonEl.classList.add('copy-successful');
    })
    .then(() => {
      copyGameCodeTimeoutID = setTimeout(() => {
        copyGameCodeButtonEl.classList.remove('copy-successful');
      }, 3_000);
    });
} /* copyGameCodeToClipboard */

/**
 *
 */
function showRulesModal() {
  const rulesModalEl = document.querySelector('#rules_modal');

  rulesModalEl.showModal();
} /* handleCloseRules */

/**
 *
 */
function showGameLobbyInfoModal() {
  const gameLobbyInfoModalEl = document.querySelector('#game_lobby_info_modal');

  gameLobbyInfoModalEl.showModal();
} /* showGameLobbyInfoModal */

/**
 * Initializes Versus game; initializes WebSocket, connects appropriate callbacks,
 * and activates event listeners
 */
export function initializeVersus() {
  const joinGameButtonEl = document.querySelector('#join_game_button');
  const startGameButtonEl = document.querySelector('#start_game_button');
  const leaveGameButtonEl = document.querySelector('#leave_game_button');
  const copyGameCodeButtonEl = document.querySelector('#copy_game_code_button');
  const gameCodeInfoButtonEl = document.querySelector('#game_code_info_button');
  const openRulesButtonEl = document.querySelector('#open_rules_button');
  const legendInfoButtonEl = document.querySelector('#legend_info_button');
  const outboundGameCodeInputEl = document.querySelector('#outbound_game_code');
  const worldEventButtonEl = document.querySelector('#world_event_button');

  attachGameCallbackFns({
    handleUpdateInstance,
    handleGameStart,
    handleOpponentMove,
    handleRevealCards,
    handleStartRound,
    handleGameEnd,
    handleWorldEvent,
    handleInstanceClosed,
    refreshEntireGame,
  });

  joinGameButtonEl.addEventListener('click', sendJoinInstance);
  startGameButtonEl.addEventListener('click', startGame);
  leaveGameButtonEl.addEventListener('click', handleLeaveGame);
  copyGameCodeButtonEl.addEventListener('click', copyGameCodeToClipboard);
  gameCodeInfoButtonEl.addEventListener('click', showGameLobbyInfoModal);
  openRulesButtonEl.addEventListener('click', showRulesModal);
  legendInfoButtonEl.addEventListener('click', showRulesModal);
  outboundGameCodeInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendJoinInstance();
  });
  worldEventButtonEl.addEventListener('click', translateWorldEvent);
} /* initializeVersus */
