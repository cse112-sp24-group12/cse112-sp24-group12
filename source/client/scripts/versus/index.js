import { initializeWebSocket } from './socket.js';
import { initializeVersus } from './versus.js';
import { inititializeChat } from './chat.js';
import { initializeDebug } from './debug.js';
import { Username, Card } from './components/index.js';

/**
 * Initializes and pulls together all required files for
 * versus mode to work; only necessary to import this file
 */
function init() {
  initializeWebSocket();
  initializeVersus();
  inititializeChat();
  initializeDebug();
} /* init */

document.addEventListener('DOMContentLoaded', init);
window.customElements.define('versus-username', Username);
window.customElements.define('versus-card', Card);
