/** @module chat */

import { toggleDebugMenu } from './debug.js';
import { attachChatCallbackFns, sendChatMessage } from './socket.js';
import { updateProfile } from './store.js';
import * as Types from './types.js';

const COMMAND_CHARACTER = '/';
const COMMANDS = {
  DEBUG: 'debug',
};

const SYSTEM_PROFILE = {
  uuid: 'system',
  username: 'System',
};

/**
 * Handles direction and parsing of message being passed to server from client
 */
export function handleOutboundMessage() {
  const chatInputEl = document.querySelector('#chat_input');

  const messageContents = chatInputEl.value;
  chatInputEl.value = '';

  if (!messageContents) return;

  if (messageContents.indexOf(COMMAND_CHARACTER) === 0)
    handleCommand(messageContents.substring(COMMAND_CHARACTER.length));
  else sendChatMessage(messageContents);
} /* handleOutboundMessage */

/**
 * Displays a message to the in-game chat box
 * @param { string } messageContents text content of message to be displayed
 * @param { Types.ServerToClientProfile } profile username to associate with message
 */
export function printMessage(messageContents, profile) {
  const chatFeedEl = document.querySelector('#chat_feed');

  const chatMessageEl = document.createElement('p');

  const versusUsernameEl = document.createElement('versus-username');
  versusUsernameEl.setAttribute('uuid', profile.uuid);

  const chatMessageContentsEl = document.createElement('span');
  chatMessageContentsEl.innerText = messageContents;

  chatMessageEl.replaceChildren(versusUsernameEl, ': ', chatMessageContentsEl);

  chatFeedEl.append(chatMessageEl);
} /* printMessage */

/**
 * Displays a message to the in-game chat box, with the username set as
 * a system user (i.e., for meta-game alerts)
 * @param { string } systemMessage text content of message to be displayed
 */
function printSystemMessage(systemMessage) {
  printMessage(systemMessage, SYSTEM_PROFILE);
} /* printSystemMessage */

/**
 * Handles direction of command (any message prefaced by COMMAND_CHARACTER)
 * to appropriate functions
 * @param { string } command command entered by user (i.e., without COMMAND_CHARACTER prepended)
 */
function handleCommand(command) {
  switch (command) {
    case COMMANDS.DEBUG:
      printSystemMessage('Debug menu toggled');
      toggleDebugMenu();
      break;
    default:
      printSystemMessage('Command not recognized');
  }
} /* handleCommand */

/**
 *
 */
export function clearChat() {
  const chatFeedEl = document.querySelector('#chat_feed');

  chatFeedEl.replaceChildren();
  printSystemMessage('Type /debug to toggle the debug menu');
}

/**
 * Initializes behavior of chat box in Versus mode
 */
export function inititializeChat() {
  const chatInputButtonEl = document.querySelector('#chat_input_button');
  const chatInputEl = document.querySelector('#chat_input');

  attachChatCallbackFns({
    printMessage,
    printSystemMessage,
  });

  updateProfile(SYSTEM_PROFILE);

  chatInputButtonEl.addEventListener('click', handleOutboundMessage);
  chatInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleOutboundMessage();
  });

  clearChat();
} /* inititializeChat */
