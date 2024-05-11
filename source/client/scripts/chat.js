/** @module chat */

import { toggleDebugMenu } from './debug.js';
import { attachChatCallbackFns, sendChatMessage } from './socket.js';

const COMMAND_CHARACTER = '/';
const SYSTEM_USERNAME = 'System';
const DEBUG_COMMAND = 'debug';

/**
 *
 * @param { string } messageContents
 * @param { ServerToClientProfile } profile
 */
export function handleInboundMessage(
  messageContents,
  profile,
) {
  printMessage(messageContents, profile.username);
} /* handleInboundMessage */

/**
 *
 */
export function handleOutboundMessage() {
  const chatInputEl = document.querySelector('#chat_input');

  const messageContents = chatInputEl.value;
  chatInputEl.value = '';

  if (!messageContents) return;

  if (messageContents.indexOf(COMMAND_CHARACTER) === 0) handleCommand(messageContents.substring(COMMAND_CHARACTER.length));
  else sendChatMessage(messageContents);
} /* handleOutboundMessage */

function printMessage(messageContents, username) {
  const chatFeedEl = document.querySelector('#chat_feed');

  const chatMessageEl = document.createElement('p');
  const chatMessageAuthorEl = document.createElement('cite');
  const chatMessageContentsEl = document.createElement('span');

  chatMessageAuthorEl.innerText = username;
  chatMessageContentsEl.innerText = messageContents;

  chatMessageEl.replaceChildren(chatMessageAuthorEl, ': ', chatMessageContentsEl);

  chatFeedEl.append(chatMessageEl);
} /* printMessage */

/**
 * 
 * @param { string } systemMessage 
 */
function printSystemMessage(systemMessage) {
  printMessage(systemMessage, SYSTEM_USERNAME);
} /* printSystemMessage */

/**
 * 
 * @param { string } command 
 */
function handleCommand(command) {
  switch (command) {
    case DEBUG_COMMAND: 
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
