/** @module socket */

import { S2C_ACTIONS, C2S_ACTIONS } from './types.js';

const WEB_SOCKET_URL = 'ws://localhost:8000';
const REQUESTED_PROTOCOL = 'tarot-versus-protocol';

const socketState = {
  webSocket: null,
  gameCallbackFns: {
    handleUpdateInstance: () => {},
    handleCardsDrawn: () => {},
    handleOpponentMove: () => {},
    handleRevealCards: () => {},
    handleStartRound: () => {},
    handleGameEnd: () => {},
  },
  chatCallbackFns: {
    handleInboundMessage: () => {},
  },
};

/**
 *
 * @param { ClientToServerMessage } message
 */
function sendMessage(message) {
  socketState.webSocket.send(JSON.stringify(message));
} /* sendMessage */

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
    handleStartRound,
    handleGameEnd,
  } = socketState.gameCallbackFns;
  const { handleInboundMessage } = socketState.chatCallbackFns;

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
          messageObj.roundWinner,
        );
        break;
      case S2C_ACTIONS.START_ROUND:
        handleStartRound();
        break;
      case S2C_ACTIONS.GAME_END:
        handleGameEnd(messageObj.gameWinner);
        break;
      case S2C_ACTIONS.CHAT_MESSAGE:
        handleInboundMessage(messageObj.messageContents, messageObj.profile);
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
  sendMessage({
    action: C2S_ACTIONS.UPDATE_PROFILE,
    profile,
  });
} /* sendProfile */

/**
 *
 * @param { number } gameCode
 */
export function joinInstance(gameCode) {
  sendMessage({
    action: C2S_ACTIONS.JOIN_INSTANCE,
    gameCode,
  });
} /* joinInstance */

/**
 *
 * @param { Card } selectedCard
 */
export function selectCard(selectedCard) {
  sendMessage({
    action: C2S_ACTIONS.SELECT_CARD,
    selectedCard,
  });
} /* selectCard */

/**
 *
 */
export function startGame() {
  sendMessage({
    action: C2S_ACTIONS.START_GAME,
  });
} /* startGame */

/**
 *
 */
export function startRound() {
  sendMessage({
    action: C2S_ACTIONS.START_ROUND,
  });
} /* startRound */

/**
 * @param { string } messageContents
 */
export function sendChatMessage(messageContents) {
  sendMessage({
    action: C2S_ACTIONS.CHAT_MESSAGE,
    messageContents,
  });
} /* sendChatMessage */

/**
 *
 * @param { { [functionName: string]: Function } } callbackFns
 */
export function attachGameCallbackFns(callbackFns) {
  socketState.gameCallbackFns = callbackFns;
}

/**
 *
 * @param { { [functionName: string]: Function } } callbackFns
 */
export function attachChatCallbackFns(callbackFns) {
  socketState.chatCallbackFns = callbackFns;
}

/**
 *
 * @param { ClientToServerProfile } profile profile of client (self)
 */
export function initializeWebSocket(profile) {
  if (socketState.webSocket) {
    console.log('WebSocket already initialized; quitting');
  }

  socketState.webSocket = new WebSocket(WEB_SOCKET_URL, REQUESTED_PROTOCOL);

  socketState.webSocket.addEventListener('message', handleMessage);

  socketState.webSocket.addEventListener('open', () => {
    sendProfile(profile);
  });
} /* initializeWebSocket */
