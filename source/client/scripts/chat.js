/** @module chat */

import { toggleDebugMenu } from './debug.js';
import { attachChatCallbackFns, sendChatMessage } from './socket.js';
import * as Types from './types.js';

const COMMAND_CHARACTER = '/';
const SYSTEM_USERNAME = 'System';
const COMMANDS = {
  DEBUG: 'debug',
};

/**
 * Handles direction and parsing of message being passed to client from server
 * @param { string } messageContents text content of message being received
 * @param { Types.ServerToClientProfile } profile sender of message
 */
export function handleInboundMessage(messageContents, profile) {
  printMessage(messageContents, profile.username);
} /* handleInboundMessage */

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
 * @param { string } username username to associate with message
 */
function printMessage(messageContents, username) {
  const chatFeedEl = document.querySelector('#chat_feed');

  const chatMessageEl = document.createElement('p');
  const chatMessageAuthorEl = document.createElement('cite');
  const chatMessageContentsEl = document.createElement('span');

  chatMessageAuthorEl.innerText = username;
  chatMessageContentsEl.innerText = messageContents;

  chatMessageEl.replaceChildren(
    chatMessageAuthorEl,
    ': ',
    chatMessageContentsEl,
  );

  chatFeedEl.append(chatMessageEl);
} /* printMessage */

/**
 * Displays a message to the in-game chat box, with the username set as
 * a system user (i.e., for meta-game alerts)
 * @param { string } systemMessage text content of message to be displayed
 */
function printSystemMessage(systemMessage) {
  printMessage(systemMessage, SYSTEM_USERNAME);
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
 * Initializes behavior of chat box in Versus mode
 */
function init() {
  const chatInputButtonEl = document.querySelector('#chat_input_button');
  const chatInputEl = document.querySelector('#chat_input');

  attachChatCallbackFns({
    handleInboundMessage,
  });

  chatInputButtonEl.addEventListener('click', handleOutboundMessage);
  chatInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleOutboundMessage();
  });

  printSystemMessage('Type /debug to toggle the debug menu');
} /* init */

window.addEventListener('DOMContentLoaded', init);
