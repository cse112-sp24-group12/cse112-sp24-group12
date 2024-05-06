import tarotConfig from './tarot.js';

const NUM_CARDS = 22;
const STARTING_LUCK_PERCENT = 50;
const MAX_CHOSEN_CARDS = 4;
const MAX_LUCK_MAGNITUDE_PER_MOVE = 15;
const MESSAGE_DISPLAY_LENGTH_MS = 3000;
const TAROT_CARDS = tarotConfig.tarot;

const gameState = {
  luck: STARTING_LUCK_PERCENT,
  chosenCards: [],
  messageResetTimeout: null,
};

/**
 * Updates luck value to game state and corresponding visual output
 * @param { number } luck new luck value
 */
function setLuck(luck) {
  const luckLabelEl = document.querySelector('.luck-bar .label');
  const luckBarFillEl = document.querySelector('.luck-bar .fill');

  gameState.luck = Math.max(0, Math.min(100, luck)); // clamps luck between 0 and 100

  luckLabelEl.innerText = `${gameState.luck} luck points`;
  luckBarFillEl.style.width = `${gameState.luck}%`;
} /* setLuck */

/**
 * Randomly decides if a card should be displayed upside down, currently
 * implemented as a 50/50 chance
 * @returns { boolean } true if card is upside down, false otherwise
 */
export function chooseIfCardIsUpsideDown() {
  return Math.random() < 0.5;
} /* chooseIfCardIsUpsideDown */

/**
 * Gets weighted luck for current move triggered by choosing a card. Namely,
 * an upside-down card corresponds to a negative luck score while normal cards
 * correspond to positive scores. Magnitude of luck is based off the percent
 * of bar currently filled, with max value MAX_LUCK_MAGNITUDE_PER_MOVE.
 * @param { boolean } isCardUpsideDown whether card is an upside-down unlucky card
 * @returns { number } luck score in range [-MAX_LUCK_MAG, MAX_LUCK_MAG]
 */
function getCurMoveLuck(isCardUpsideDown) {
  return (
    (isCardUpsideDown ? -1 : 1) *
    Math.floor(MAX_LUCK_MAGNITUDE_PER_MOVE * getCurPercentOfBarFill())
  );
} /* getCurMoveLuck */

/**
 * Picks a card that has not yet been chosen
 * @returns { import('./tarot.js').Card } card not currently present in state.chosenCards
 */
export function getUniqueCard() {
  let chosenCard;
  do {
    chosenCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  } while (gameState.chosenCards.includes(chosenCard));

  return chosenCard;
} /* getUniqueCard */

/**
 * When game is over (i.e., all four cards chosen), saves data
 * and redirects users to results screen
 */
function endGame() {
  setTimeout(() => {
    localStorage.setItem(
      'chosenCards',
      JSON.stringify(gameState.chosenCards.map((card) => card.name)),
    );
    localStorage.setItem('luck', gameState.luck);
    window.location.href = './results.html';
  }, MESSAGE_DISPLAY_LENGTH_MS);
} /* endGame */

/**
 * Handles gameplay progression on card click event by generating a random card name/image,
 * and random luck points with corresponding UI updates
 * @param { MouseEvent } event click event
 */
function cardClickHandler(event) {
  const cardContainerEl = event.currentTarget;

  if (
    cardContainerEl.classList.contains('flipped') ||
    gameState.chosenCards.length >= MAX_CHOSEN_CARDS
  )
    return;

  const isCardUpsideDown = chooseIfCardIsUpsideDown();
  if (isCardUpsideDown) cardContainerEl.classList.add('reversed');

  const curMoveLuck = getCurMoveLuck(isCardUpsideDown);
  setLuck(gameState.luck + curMoveLuck);

  const chosenCard = getUniqueCard();
  gameState.chosenCards.push(chosenCard);

  cardContainerEl.querySelector('.front').style.backgroundImage =
    `url("${chosenCard.image}")`;

  displayMessage(
    `You got a ${isCardUpsideDown ? 'reverse ' : ''}card. You receive ${curMoveLuck} luck points!`,
  );

  cardContainerEl.classList.add('flipped');

  if (gameState.chosenCards.length === MAX_CHOSEN_CARDS) endGame();
} /* cardClickHandler */

/**
 * Creates a list of card elements to be shown on game board, attaching
 * click-event listeners to each to facilitate game logic
 * @param { number } numCards number of cards to generate
 * @returns { HTMLDivElement[] } array of card container elements
 */
function generateCardsWithListeners(numCards) {
  return Array.from({ length: numCards }).map((_, i) => {
    const cardContainerEl = document.createElement('div');
    const cardEl = document.createElement('div');
    const cardBackFaceEl = document.createElement('div');
    const cardFrontFaceEl = document.createElement('div');

    cardContainerEl.className = 'card-container';
    cardContainerEl.id = `card-container-${i + 1}`;

    cardEl.className = 'card';
    cardEl.id = `card-${i + 1}`;

    cardBackFaceEl.className = 'back face';
    cardFrontFaceEl.className = 'front face';

    cardEl.append(cardBackFaceEl, cardFrontFaceEl);
    cardContainerEl.append(cardEl);

    cardContainerEl.addEventListener('click', cardClickHandler);

    return cardContainerEl;
  });
} /* generateCards */

/**
 * Fetches user's profile image
 * @returns { string } path to user's profile image
 */
function getProfileImageUrl() {
  return window.localStorage.getItem('userImage');
} /* getProfileImageUrl */

/**
 * Displays message to game screen as if it were spoken by the wizard,
 * resetting back to instructions after MESSAGE_DISPLAY_LENGTH_MS milliseconds
 * @param { string } message message to be displayed by wizard
 */
function displayMessage(message) {
  const oracleMsgEl = document.querySelector('.oracle .message');

  oracleMsgEl.innerText = message;

  clearTimeout(gameState.messageResetTimeout);
  gameState.messageResetTimeout = setTimeout(() => {
    const numCardsLeft = MAX_CHOSEN_CARDS - gameState.chosenCards.length;
    oracleMsgEl.innerText = `Draw ${numCardsLeft} more card${
      numCardsLeft === 1 ? '' : 's'
    }!`;
  }, MESSAGE_DISPLAY_LENGTH_MS);
} /* displayMessage */

/**
 * For the animated sliding luck bar on the bottom of game screen, calculates
 * the current percent of the bar filled by the animation
 * @returns { number } value between 0 and 1 with 0 representing an empty bar
 */
function getCurPercentOfBarFill() {
  const oscillatingBarEl = document.querySelector('.oscillating-bar');
  const oscillatingBarFillEl = document.querySelector('.oscillating-bar .fill');

  return (
    oscillatingBarFillEl.getBoundingClientRect().width /
    oscillatingBarEl.getBoundingClientRect().width
  );
} /* getCurPercentOfBarFill */

/**
 * Displays user's profile image in appropriate location on UI,
 * and attachs listeners to allow user to upload their own image
 * after the game has already started
 */
function attachProfileImageAndListener() {
  const playerImageEl = document.querySelector('#output');
  const playerImageInputEl = document.querySelector('#file');

  playerImageEl.src = getProfileImageUrl();

  playerImageInputEl.addEventListener('change', (e) => {
    playerImageEl.src = URL.createObjectURL(e.target.files[0]);
  });
} /* attachProfileImageAndListener */

/**
 * Initializes game board and gameplay
 */
function init() {
  const boardEl = document.querySelector('.board');

  boardEl.replaceChildren(...generateCardsWithListeners(NUM_CARDS));

  attachProfileImageAndListener();
} /* init */

window.addEventListener('DOMContentLoaded', init);
