import { UPDATE_USERNAME_LISTENER_NAME } from '../types.js';
import { getProfile } from '../store.js';

/**
 * Displays and automatically updates a username associated to a specific
 * UUID, as determined by information sent from the server
 * @example
 * // renders username associated to "test-uuid"
 * <versus-username uuid="test-uuid"></versus-username>
 */
export default class Username extends HTMLElement {
  static observedAttributes = ['uuid'];

  /**
   * 
   */
  constructor() {
    super();
  } /* constructor */

  connectedCallback() {
    window.addEventListener(UPDATE_USERNAME_LISTENER_NAME, this._handleUpdate);
    this._handleUpdate();
  }

  disconnectedCallback() {
    window.removeEventListener(UPDATE_USERNAME_LISTENER_NAME, this._handleUpdate);
  }

  _handleUpdate = () => {
    const playerUUID = this.getAttribute('uuid');
    if (!playerUUID) return;

    const profile = getProfile(playerUUID);
    if (!profile) return;

    this.innerText = profile.username;
  }

  attributeChangedCallback() {
    this._handleUpdate();
  }
} /* Username */
