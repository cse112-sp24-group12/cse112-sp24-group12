import { SUITES } from './types.js';
import { WORLD_EVENTS } from './types.js';
import { MULTIPLER } from './types.js'; 
import * as Types from './types.js';

/**
 * Creates and returns random game code for each game instance; currently not necessarily unique
 * @returns { number } newly generated game code
 */
export function generateGameCode() {
  return Math.floor(Math.random() * 9000) + 1000;
} /* generateGameCode */

/**
 * Determines if two arrays are equal as sets
 * @param { any[] } arr1 array of objects to compare
 * @param { any[] } arr2 array of objects to compare
 * @returns { boolean } true if arrays are equal as sets; false otherwise
 */
export function areUnorderedArrsEqual(arr1, arr2) {
  return (
    arr1.every((el) => arr2.includes(el)) &&
    arr2.every((el) => arr1.includes(el))
  );
} /* areUnorderedArrsEqual */

/**
 * Ensures that card object is well-formed and valid
 * @param { Types.Card } card card object to test
 * @returns { boolean } true if card is valid; false if invalid
 */
export function isCardValid(card) {
  return (
    areUnorderedArrsEqual(Object.keys(card), ['number', 'suite']) &&
    typeof card.number === 'number' &&
    typeof card.suite === 'string'
  );
} /* isCardValid */

/**
 * Determines if two different card objects represent the same card
 * @param { Types.Card } card1 card to compare
 * @param { Types.Card } card2 card to compare
 * @returns { boolean } true if the two cards represent the same
 * card (i.e., same values); false otherwise
 */
export function areCardsEqual(card1, card2) {
  return card1.number === card2.number && card1.suite === card2.suite;
} /* areCardsEqual */

/**
 * Determines the opponent of a given player in a game instance
 * @param { Types.GameInstance } gameInstance game instance to target
 * @param { Types.WSConnection } webSocketConnection non-target player of game instance
 * @returns { Types.WSConnection } other player in game instance
 */
export function getOtherPlayer(gameInstance, webSocketConnection) {
  return gameInstance.webSocketConnections.find(
    (conn) => conn !== webSocketConnection,
  );
} /* getOtherPlayer */

/**
 * Returns the last entry in list of round states from a game instance
 * @param { Types.GameInstance } gameInstance game instance to target
 * @returns { Types.RoundState } most recent (current) round attached to gameInstance
 */
export function getCurrentRoundState(gameInstance) {
  return gameInstance.gameState.byRound[
    gameInstance.gameState.byRound.length - 1
  ];
} /* getCurrentRoundState */

function getRandomSuite(){
  let suites = [SUITES.WANDS, SUITES.CUPS, SUITES.SWORDS, SUITES.PENTACLES];

  return suites[Math.floor(Math.random() * suites.length)];
}

/**
 * Determines the multiplier for a given matchup between two cards
 * (Positive multiplier implies that card1 has a suite-based advantage over card2)
 * @param { Types.Card } card1 card to compare, target of multiplier
 * @param { Types.Card } card2 card to compare
 * @param {String} worldEvent current worldEvent for the round
 * @returns { Types.Card } matchup multiplier for card1 with reference to card2
 */
function getMultiplierWorldEvent(card1, card2, worldEvent) {

  let multiplier = MULTIPLER.NEUTRAL;
  let suite1 = worldEvent === WORLD_EVENTS.RANDOM_SUITE ? getRandomSuite() : card1.suite;
  let suite2 = worldEvent === WORLD_EVENTS.RANDOM_SUITE ? getRandomSuite() : card2.suite;


  
  switch (suite1) {
    case SUITES.WANDS:
      if (suite2 === SUITES.CUPS) multiplier = worldEvent === WORLD_EVENTS.SUITE_BOOST_WANDS ? MULTIPLER.GREATER + MULTIPLER.BOOST : MULTIPLER.GREATER;
      else if (suite2 == SUITES.SWORDS) multiplier = worldEvent === WORLD_EVENTS.SUITE_BOOST_WANDS ? MULTIPLER.LESS + MULTIPLER.BOOST : MULTIPLER.LESS;
    case SUITES.CUPS:
      if (suite2 === SUITES.SWORDS) multiplier =  worldEvent === WORLD_EVENTS.SUITE_BOOST_CUPS ? MULTIPLER.GREATER + MULTIPLER.BOOST : MULTIPLER.GREATER;
      else if (suite2 == SUITES.WANDS) multiplier =  worldEvent === WORLD_EVENTS.SUITE_BOOST_CUPS ? MULTIPLER.LESS + MULTIPLER.BOOST : MULTIPLER.LESS;
    case SUITES.SWORDS:
      if (suite2 === SUITES.WANDS) multiplier =  worldEvent === WORLD_EVENTS.SUITE_BOOST_SWORDS ? MULTIPLER.GREATER + MULTIPLER.BOOST : MULTIPLER.GREATER;
      else if (suite2 == SUITES.CUPS) multiplier =  worldEvent === WORLD_EVENTS.SUITE_BOOST_SWORDS ? MULTIPLER.LESS + MULTIPLER.BOOST : MULTIPLER.LESS;
    case SUITES.PENTACLES:
      multiplier = worldEvent === WORLD_EVENTS.SUITE_BOOST_PENTACLES ? MULTIPLER.NEUTRAL + MULTIPLER.BOOST : MULTIPLER.NEUTRAL;
    default:

  }

  return worldEvent === WORLD_EVENTS.SUITE_REVERSED ? 1/multiplier : multiplier;

} /* getMultiplier */

function getRandomValue() {
  return Math.floor(Math.random() * 14) + 1;
}

/**
 * Determines which of two cards wins a round
 * @param { Types.GameInstance } gameInstance 
 * @returns { Types.UUID } winning user UUID1 and UUID2
 */

export function getRoundWinnerUUID(gameInstance) {
  const currentRoundState = getCurrentRoundState(gameInstance);
  const worldEvent = currentRoundState.worldEvent;
  const [[uuid1, card1], [uuid2, card2]] = Object.entries(
    currentRoundState.selectedCard,
  );

  switch (worldEvent) {
    case WORLD_EVENTS.LOWER_WINS:
      return card1.number < card2.number ? uuid1 : uuid2;
    case WORLD_EVENTS.RANDOM_VALUE:
      return getRandomValue() * getMultiplierWorldEvent(card1, card2) > getRandomValue() ? uuid1 : uuid2;
    case WORLD_EVENTS.SUITE_REVERSED:
    case WORLD_EVENTS.SUITE_BOOST_WANDS:
    case WORLD_EVENTS.SUITE_BOOST_CUPS:
    case WORLD_EVENTS.SUITE_BOOST_SWORDS:
    case WORLD_EVENTS.SUITE_BOOST_PENTACLES:
    case WORLD_EVENTS.RANDOM_SUITE:
    case WORLD_EVENTS.NONE:
    /*fallthrough because other world events influence the multiplier method not winning card*/
    default:
      return card1.number * getMultiplierWorldEvent(card1, card2, worldEvent) > card2.number? uuid1: uuid2;
  }
}

/**
 * Determines the multiplier for a given matchup between two cards
 * (Positive multiplier implies that card1 has a suite-based advantage over card2)
 * @param { Types.Card } card1 card to compare, target of multiplier
 * @param { Types.Card } card2 card to compare
 * @returns { Types.Card } matchup multiplier for card1 with reference to card2
 */
function getMultiplier(card1, card2) {
  switch (card1.suite) {
    case SUITES.WANDS:
      if (card2.suite === SUITES.CUPS) return 2;
      else if (card2.suite == SUITES.SWORDS) return 0.5;
      return 1;
    case SUITES.CUPS:
      if (card2.suite === SUITES.SWORDS) return 2;
      else if (card2.suite == SUITES.WANDS) return 0.5;
      return 1;
    case SUITES.SWORDS:
      if (card2.suite === SUITES.WANDS) return 2;
      else if (card2.suite == SUITES.CUPS) return 0.5;
      return 1;
    default:
      return 1;
  }
} /* getMultiplier */


/**
 * Creates and returns a new round state
 * @returns { Types.RoundState } blank round state
 */
export function createNewRound() {
  return {
    selectedCard: {},
    roundWinner: null,
    // world_event: getRandomWorldEvent()
  };
} /* createNewRound */

/**
 * Generates two sets of n mutually-unique cards
 * @param { Types.Card[] } cardList list of cards to pull from
 * @param { number } n integer size of each set
 * @returns { Types.Card[][] }  two lists of n mutually-unique cards
 */
export function generateUniqueCards(cardList, n) {
  /* shuffle cards by sorting according to random weights */
  const shuffledCardList = cardList
    .map((card) => [card, Math.random()])
    .sort(([, weight1], [, weight2]) => weight1 - weight2)
    .map(([card]) => card);

  /* choose first n and second n elements for each list */
  return [shuffledCardList.slice(0, n), shuffledCardList.slice(n, n + n)];
} /* generateUniqueCards */

/**
 * Strips sensitive data (i.e., currently-selected card) from a specific game state
 * object so that it can be sent downstream to the specified user without fear that
 * it exposes behind-the-screens info
 * @param { Types.UUID } playerUUID user who the game state is destined for
 * @param { Types.GameState } gameState initial (dirty) game state
 * @returns { Types.GameState } game state cleaned of any data that should be
 * private to the given user
 */
export function cleanGameState(playerUUID, gameState) {
  const copiedState = structuredClone(gameState);
  const currentRound = copiedState.byRound[copiedState.byRound.length - 1];

  Object.keys(gameState.byPlayer).forEach((UUID) => {
    if (UUID === playerUUID) return;

    if (!currentRound.roundWinner && currentRound.selectedCard[UUID])
      currentRound.selectedCard[UUID] = 'played';

    const playerState = copiedState.byPlayer[UUID];
    playerState.remainingCards = Array.from({
      length: playerState.remainingCards.length,
    });
  });

  return copiedState;
} /* cleanGameState */
