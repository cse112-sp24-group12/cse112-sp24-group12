/** @module chat */

import { toggleDebugMenu } from './debug.js';

/**
 *
 * @param { string } messageSender
 * @param { string } messageContents
 */
export function handleInboundMessage(
  messageSender,
  messageContents,
) {} /* handleInboundMessage */

/**
 *
 */
export function handleOutboundMessage() {
  const chatInputEl = document.querySelector('#chat_input');

  const messageContents = chatInputEl.value;
  chatInputEl.value = '';

  if (!messageContents) return;

  if (messageContents.toLowerCase() === '/debug') toggleDebugMenu();
  else {
    // send message to server
  }
} /* handleOutboundMessage */

/**
 *
 */
function init() {
  const chatInputButtonEl = document.querySelector('#chat_input_button');
  const chatInputEl = document.querySelector('#chat_input');

  chatInputButtonEl.addEventListener('click', handleOutboundMessage);
  chatInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleOutboundMessage();
  });
} /* init */

window.addEventListener('DOMContentLoaded', init);
