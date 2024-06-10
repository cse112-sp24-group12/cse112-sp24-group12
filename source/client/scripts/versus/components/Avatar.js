import { UPDATE_AVATAR_LISTENER_NAME } from '../types.js';
import { getProfile } from '../store.js';
import { getProfileImageUrlFromName } from '../../profile.js';

/**
 * Displays and automatically updates a profile image/avatar
 * associated to a specific UUID, as determined by information sent from the server
 * @example
 * // renders avatar image associated to "test-uuid"
 * <versus-avatar uuid="test-uuid"></versus-avatar>
 */
export default class Avatar extends HTMLElement {
  /** @type { string[] } */
  static observedAttributes = ['uuid'];

  _initialized = false;

  constructor() {
    super();
  } /* constructor */

  /**
   * Initializes display and sets listener to update whenever new information exists
   */
  connectedCallback() {
    if (!this._initialized) {
      this._initialized = true;

      this._imgEl = document.createElement('img');
      this.replaceChildren(this._imgEl);
    }

    this._handleUpdate();
    window.addEventListener(UPDATE_AVATAR_LISTENER_NAME, this._handleUpdate);
  } /* connectedCallback */

  /**
   * Destructs listeners
   */
  disconnectedCallback() {
    window.removeEventListener(UPDATE_AVATAR_LISTENER_NAME, this._handleUpdate);
  } /* disconnectedCallback */

  /**
   * Refreshes display whenever UUID is updated
   */
  attributeChangedCallback() {
    if (!this._initialized) return;

    this._handleUpdate();
  } /* attributeChangedCallback */

  /**
   * Displays as text the most recently learned username from the server associated
   * to the attributed UUID
   */
  _handleUpdate = () => {
    const playerUUID = this.getAttribute('uuid');
    if (!playerUUID) return;

    const newProfileImageName = getProfile(playerUUID)?.profileImageName;

    this._imgEl.src = getProfileImageUrlFromName(newProfileImageName);
  }; /* _handleUpdate */
} /* Username */
