/** @module chat */

import { toggleDebugMenu } from './debug.js';
import { attachChatCallbackFns, sendChatMessage } from './socket.js';

/**
 *
 * @param { string } messageContents
 * @param { ServerToClientProfile } profile
 */
export function handleInboundMessage(
  messageContents,
  profile,
) {
  const chatFeedEl = document.querySelector('#chat_feed');

  const chatMessageEl = document.createElement('p');
  const chatMessageAuthorEl = document.createElement('cite');
  const chatMessageContentsEl = document.createElement('span');

  chatMessageAuthorEl.innerText = profile.username;
  chatMessageContentsEl.innerText = messageContents;

  chatMessageEl.replaceChildren(chatMessageAuthorEl, ': ', chatMessageContentsEl);

  chatFeedEl.append(chatMessageEl);
} /* handleInboundMessage */

/**
 *
 */
export function handleOutboundMessage() {
  const chatInputEl = document.querySelector('#chat_input');

  const messageContents = chatInputEl.value;
  chatInputEl.value = '';

  if (!messageContents) return;

  if (messageContents.toLowerCase() === '/debug') toggleDebugMenu();
  else sendChatMessage(messageContents);
} /* handleOutboundMessage */

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
} /* init */

window.addEventListener('DOMContentLoaded', init);
