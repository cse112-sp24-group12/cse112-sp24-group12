/** @module socket */

import { S2C_ACTIONS, C2S_ACTIONS } from './types.js';
import { WEB_SOCKET_URL } from './env.js';
import {
  setPlayerUUID,
  getPlayerUUID,
  createProfileObject,
} from '../profile.js';
import { updateProfile, setGameState } from './store.js';
import * as Types from './types.js';

const REQUESTED_PROTOCOL = 'tarot-versus-protocol';

const CLOSED_WEB_SOCKET_STATE = 3;
const WS_RECONNECTION_DELAY_MS = 3500;

const socketState = {
  webSocket: null,
  gameCallbackFns: {},
  chatCallbackFns: {},
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
    handleGameEnd,
    handleInstanceClosed,
    refreshEntireGame,
  } = socketState.gameCallbackFns;
  const { printMessage, printSystemMessage } = socketState.chatCallbackFns;

  try {
    switch (messageObj.action) {
      case S2C_ACTIONS.UPDATE_UUID:
        setPlayerUUID(messageObj.playerUUID);
        break;
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
      case S2C_ACTIONS.GAME_END:
        handleGameEnd(messageObj.gameWinner);
        break;
      case S2C_ACTIONS.CHAT_MESSAGE:
        printMessage(messageObj.messageContents, messageObj.profile);
        break;
      case S2C_ACTIONS.SYSTEM_MESSAGE:
        printSystemMessage(messageObj.messageContents);
        break;
      case S2C_ACTIONS.UPDATE_PROFILE:
        updateProfile(messageObj.profile);
        break;
      case S2C_ACTIONS.FORCE_REFRESH:
        setGameState(messageObj.gameState);
        refreshEntireGame();
        break;
      case S2C_ACTIONS.INSTANCE_CLOSED:
        handleInstanceClosed();
        break;
      default:
    }
  } catch (e) {
    console.error(e);
  }
} /* handleMessage */

/**
 * Updates profile information on backend by creating and sending
 * current profile information
 */
export function sendProfile() {
  sendMessage({
    action: C2S_ACTIONS.UPDATE_PROFILE,
    profile: createProfileObject(),
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
 * Asks backend to add client to a new lobby, or restore to a previous lobby if possible
 * @param { Types.UUID } [previousUUID] any previous UUID to client, used for restoration
 */
export function sendInitializationRequest(previousUUID) {
  sendMessage({
    action: C2S_ACTIONS.INITIALIZE_INSTANCE,
    playerUUID: previousUUID,
  });
} /* sendInitializationRequest */

/**
 * Attaches functions to WebSocket instance to orchestrate Versus gameplay behavior;
 * avoids cyclic use of import statements
 * @param { Record<string, Function> } callbackFns object literal map of functions
 */
export function attachGameCallbackFns(callbackFns) {
  socketState.gameCallbackFns = callbackFns;
} /* attachGameCallbackFns */

/**
 * Attaches functions to websocket instance to orchestrate chat behavior;
 * avoids cyclic use of import statements
 * @param { Record<string, Function> } callbackFns object literal map of functions
 */
export function attachChatCallbackFns(callbackFns) {
  socketState.chatCallbackFns = callbackFns;
} /* attachChatCallbackFns */

/**
 *
 */
function handleWebSocketOpen() {
  const connectionStatusWrapperEl =
    document.querySelector('#connection_status');
  connectionStatusWrapperEl.classList.add('hidden');

  sendInitializationRequest(getPlayerUUID());

  sendProfile();
} /* handleWebSocketOpen */

/**
 *
 */
function handleWebSocketClose() {
  const connectionStatusWrapperEl =
    document.querySelector('#connection_status');
  connectionStatusWrapperEl.classList.remove('hidden');

  setTimeout(initializeWebSocket, WS_RECONNECTION_DELAY_MS);
} /* handleWebSocketClose */

/**
 * Initializes behavior of WebSocket; connects to backend WS server and relays profile
 */
export function initializeWebSocket() {
  if (
    socketState.webSocket &&
    socketState.webSocket.readyState !== CLOSED_WEB_SOCKET_STATE
  ) {
    console.warn('WebSocket is already open; cannot re-initialize');
    return;
  }

  socketState.webSocket = new WebSocket(WEB_SOCKET_URL, REQUESTED_PROTOCOL);

  socketState.webSocket.addEventListener('message', handleMessage);
  socketState.webSocket.addEventListener('open', handleWebSocketOpen);
  socketState.webSocket.addEventListener('close', handleWebSocketClose);
} /* initializeWebSocket */
