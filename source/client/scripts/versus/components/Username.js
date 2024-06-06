import { UPDATE_USERNAME_LISTENER_NAME } from '../types.js';
import { getProfile } from '../store.js';
import { getPlayerUUID } from '../../profile.js';

/**
 * Displays and automatically updates a username associated to a specific
 * UUID, as determined by information sent from the server
 * @example
 * // renders username associated to "test-uuid"
 * <versus-username uuid="test-uuid"></versus-username>
 */
export default class Username extends HTMLElement {
  /** @type { string[] } */
  static observedAttributes = ['uuid'];

  constructor() {
    super();
  } /* constructor */

  /**
   * Initializes display and sets listener to update whenever new information exists
   */
  connectedCallback() {
    this._handleUpdate();
    window.addEventListener(UPDATE_USERNAME_LISTENER_NAME, this._handleUpdate);
  } /* connectedCallback */

  /**
   * Destructs listeners
   */
  disconnectedCallback() {
    window.removeEventListener(
      UPDATE_USERNAME_LISTENER_NAME,
      this._handleUpdate,
    );
  } /* disconnectedCallback */

  /**
   * Refreshes display whenever UUID is updated
   */
  attributeChangedCallback() {
    this._handleUpdate();
  } /* attributeChangedCallback */

  /**
   * Displays as text the most recently learned username from the server associated
   * to the attributed UUID
   */
  _handleUpdate = () => {
    const playerUUID = this.getAttribute('uuid');
    if (!playerUUID) return;

    let newUsername;
    if (playerUUID === getPlayerUUID()) {
      newUsername = 'You';
      this.classList.add('you');
    } else {
      newUsername = getProfile(playerUUID)?.username;
    }

    if (!newUsername) return;

    this.innerText = newUsername;
  }; /* _handleUpdate */
} /* Username */
