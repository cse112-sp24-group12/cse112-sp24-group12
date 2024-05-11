/** @module socket */

import { S2C_ACTIONS, C2S_ACTIONS } from './types.js';
import * as Types from './types.js';

const WEB_SOCKET_URL = 'ws://localhost:8000';
const REQUESTED_PROTOCOL = 'tarot-versus-protocol';

const socketState = {
  webSocket: null,
  gameCallbackFns: {
    handleUpdateInstance: () => {},
    handleGameStart: () => {},
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
 * Sends parsed message object directly to the server
 * @param { Types.ClientToServerMessage } message action/info message pair to send
 */
function sendMessage(message) {
  socketState.webSocket.send(JSON.stringify(message));
} /* sendMessage */

/**
 * Handles and redirects incoming messages to appropriate functions
 * @param { MessageEvent } message incoming message from server
 */
function handleMessage(message) {
  /** @type { Types.ServerToClientMessage } */
  const messageObj = JSON.parse(message.data);

  const {
    handleUpdateInstance,
    handleGameStart,
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
        handleGameStart(messageObj.drawnCards);
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
 * Updates profile information on backend by sending new profile info
 * @param { Types.ClientToServerProfile } profile new profile information (entire profile)
 */
export function sendProfile(profile) {
  sendMessage({
    action: C2S_ACTIONS.UPDATE_PROFILE,
    profile,
  });
} /* sendProfile */

/**
 * Attempts to move client to a new game instance associated to gameCode
 * @param { number } gameCode four digit code corresponding to an existing game instance
 */
export function joinInstance(gameCode) {
  sendMessage({
    action: C2S_ACTIONS.JOIN_INSTANCE,
    gameCode,
  });
} /* joinInstance */

/**
 * Tells server which card the client selected
 * @param { Types.Card } selectedCard card selected by user from list of remaining cards
 */
export function selectCard(selectedCard) {
  sendMessage({
    action: C2S_ACTIONS.SELECT_CARD,
    selectedCard,
  });
} /* selectCard */

/**
 * Attempts to start game instance server-side (implicitly starts first round)
 */
export function startGame() {
  sendMessage({
    action: C2S_ACTIONS.START_GAME,
  });
} /* startGame */

/**
 * Attempts to start next round of game instance server-side
 */
export function startRound() {
  sendMessage({
    action: C2S_ACTIONS.START_ROUND,
  });
} /* startRound */

/**
 * Sends chat message server-side to be redistributed to clients,
 * implicitly associated to user profile of sender
 * @param { string } messageContents text content of message to be displayed
 */
export function sendChatMessage(messageContents) {
  sendMessage({
    action: C2S_ACTIONS.CHAT_MESSAGE,
    messageContents,
  });
} /* sendChatMessage */

/**
 * Attaches functions to WebSocket instance to orchestrate Versus gameplay behavior;
 * avoids cyclic use of import statements
 * @param { { [functionName: string]: Function } } callbackFns object literal map of functions
 */
export function attachGameCallbackFns(callbackFns) {
  socketState.gameCallbackFns = callbackFns;
} /* attachGameCallbackFns */

/**
 * Attaches functions to websocket instance to orchestrate chat behavior;
 * avoids cyclic use of import statements
 * @param { { [functionName: string]: Function } } callbackFns object literal map of functions
 */
export function attachChatCallbackFns(callbackFns) {
  socketState.chatCallbackFns = callbackFns;
} /* attachChatCallbackFns */

/**
 * Initializes behavior of WebSocket; connects to backend WS server and relays profile
 * @param { Types.ClientToServerProfile } profile profile of client (self)
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
