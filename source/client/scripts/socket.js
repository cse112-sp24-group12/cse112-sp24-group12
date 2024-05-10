/** @module socket */

import { S2C_ACTIONS, C2S_ACTIONS } from './types.js';

const WEB_SOCKET_URL = 'ws://localhost:8000';
const REQUESTED_PROTOCOL = 'tarot-versus-protocol';

const gameState = {
  webSocket: null,
  callbackFns: {
    handleUpdateInstance: () => {},
    handleCardsDrawn: () => {},
    handleOpponentMove: () => {},
    handleRevealCards: () => {},
    handleGameEnd: () => {},
  },
  gameCode: 0,
  selfProfile: {},
  opponentProfile: {},
};

/**
 *
 * @param { any } object
 */
function sendObject(object) {
  gameState.webSocket.send(JSON.stringify(object));
} /* sendObject */

/**
 *
 * @param { MessageEvent } message
 */
function handleMessage(message) {
  const messageObj = JSON.parse(message.data);

  const {
    handleUpdateInstance,
    handleCardsDrawn,
    handleOpponentMove,
    handleRevealCards,
  } = gameState.callbackFns;

  try {
    switch (messageObj.action) {
      case S2C_ACTIONS.UPDATE_INSTANCE:
        handleUpdateInstance(messageObj.instanceInfo);
        break;
      case S2C_ACTIONS.START_GAME:
        handleCardsDrawn(messageObj.drawnCards);
        break;
      case S2C_ACTIONS.CARD_SELECTED:
        handleOpponentMove();
        break;
      case S2C_ACTIONS.REVEAL_CARDS:
        handleRevealCards(
          messageObj.opponentSelectedCard,
          messageObj.roundWinner.username,
        );
        break;
      default:
    }
  } catch (e) {
    console.error(e);
  }
} /* handleMessage */

/**
 *
 * @param { ClientToServerProfile } profile
 */
export function sendProfile(profile) {
  sendObject({
    action: C2S_ACTIONS.CREATE_PROFILE,
    profile,
  });
} /* sendProfile */

/**
 *
 * @param { number } gameCode
 */
export function joinInstance(gameCode) {
  sendObject({
    action: C2S_ACTIONS.JOIN_INSTANCE,
    gameCode,
  });
} /* joinInstance */

/**
 *
 * @param { Card } selectedCard
 */
export function selectCard(selectedCard) {
  sendObject({
    action: C2S_ACTIONS.SELECT_CARD,
    selectedCard,
  });
} /* selectCard */

/**
 *
 */
export function startGame() {
  sendObject({
    action: C2S_ACTIONS.START_GAME,
  });
} /* startGame */

/**
 *
 * @param { ClientToServerProfile } profile profile of client (self)
 * @param { {[fnName: string]: Function} } callbackFns
 */
export function initializeWebSocket(profile, callbackFns) {
  if (gameState.webSocket) {
    console.log('WebSocket already initialized; quitting');
  }

  gameState.webSocket = new WebSocket(WEB_SOCKET_URL, REQUESTED_PROTOCOL);

  gameState.callbackFns = callbackFns;

  gameState.webSocket.addEventListener('message', handleMessage);

  gameState.webSocket.addEventListener('open', () => {
    sendProfile(profile);
  });
} /* initializeWebSocket */
