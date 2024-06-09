import { getIsMute, setIsMute } from '../../profile.js';

export default class MuteButton extends HTMLElement {
  _buttonEl;

  constructor() {
    super();
  } /* constructor */

  connectedCallback() {
    this.dataset.muted = getIsMute();

    this._buttonEl = document.createElement('button');

    this._buttonEl.ariaLabel = 'Mute';
    this._buttonEl.title = 'Mute';
    this._buttonEl.classList.add('icon-button');

    this._buttonEl.addEventListener('click', this._toggleMute);

    window.addEventListener('storage', this._updateDisplay);

    this.replaceChildren(this._buttonEl);
  } /* connectedCallback */

  disconnectedCallback() {
    this._buttonEl.removeEventListener('click', this._toggleMute);
  } /* disconnectedCallback */

  _toggleMute = () => {
    setIsMute(!getIsMute());

    this._updateDisplay();
  }; /* _toggleIsMute */

  _updateDisplay = () => {
    this.dataset.muted = getIsMute();
  }; /* _updateDisplay */
} /* MuteButton */
