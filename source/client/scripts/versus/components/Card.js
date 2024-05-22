import { getCardURLFromName } from '../util.js';

const CARD_BACK_IMAGE_URL = './assets/images/cardback.png';

/**
 * Displays either generic back of a card, or explicitly-defined
 * front of card
 * @example
 * // renders front of 5 of cups card
 * <versus-card variant="front" suite="cups" number="5"></versus-card>
 */
export default class Card extends HTMLElement {
  /** @type { string[] } */
  static observedAttributes = ['variant', 'suite', 'number', 'disabled'];
  _initialized = false;

  constructor() {
    super();
  } /* constructor */

  /**
   * Initializes display of card
   */
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const drawnCardTemplateEl = document.querySelector('#card-template');
    const drawnCardEl = drawnCardTemplateEl.content.cloneNode(true);
    this.replaceChildren(drawnCardEl);
    this._handleUpdate();
  } /* connectedCallback */

  /**
   * Updates card whenever attributes change
   */
  attributeChangedCallback() {
    this._handleUpdate();
  } /* attributeChangedCallback */

  /**
   * Routes to function for either a front-facing or back-facing
   * card as appropriate, based off the variant attribute
   */
  _handleUpdate = () => {
    if (this.getAttribute('variant') === 'front') {
      this._handleUpdateFront();
    } else {
      this._handleUpdateBack();
    }

    if (this._initialized && this.hasAttribute('disabled')) {
      const cardInputEl = this.querySelector('input');
      cardInputEl.disabled = true;
    }
  }; /* handleUpdate */

  /**
   * Displays appropriate image for a back-facing card
   */
  _handleUpdateBack = () => {
    if (!this._initialized) return;

    const cardImageEl = this.querySelector('img');

    cardImageEl.src = CARD_BACK_IMAGE_URL;
  }; /* handleUpdateBack */

  /**
   * Displays appropriate image on card and handles input elements
   * for a front-facing card
   */
  _handleUpdateFront = () => {
    const suite = this.getAttribute('suite');
    const number = this.getAttribute('number');

    if (!suite || !number || !this._initialized) return;

    const cardInputEl = this.querySelector('input');
    const cardLabelEl = this.querySelector('label');
    const cardImageEl = this.querySelector('img');

    const htmlIdName = `drawn_card_${suite}_${number}`;

    cardLabelEl.htmlFor = htmlIdName;
    cardInputEl.id = htmlIdName;
    cardInputEl.value = JSON.stringify({ suite, number: +number });

    cardImageEl.src = getCardURLFromName(suite, number);
  }; /* _handleUpdateFront */

  /**
   * Animates card sliding into a container; at the end of the animation, the card
   * will be moved into the container in the DOM as well
   * @param { HTMLElement } containerEl container that element should end up in
   */
  async translateToContainer(containerEl) {
    const transWrapperEl = this.querySelector('.card-trans-wrapper');

    /* calculate difference between current and desired position */
    const transWrapperElRect = transWrapperEl.getBoundingClientRect();
    const containerElRect = containerEl.getBoundingClientRect();

    const diffXPos = containerElRect.left - transWrapperElRect.left;
    const diffYPos = containerElRect.top - transWrapperElRect.top;

    const scaleXDim = containerElRect.width / transWrapperElRect.width;
    const scaleYDim = containerElRect.height / transWrapperElRect.height;

    /* translate and swap after completion */
    return new Promise((resolve) => {
      transWrapperEl.style.setProperty(
        'transform',
        `translate(${diffXPos}px, ${diffYPos}px) scale(${scaleXDim}, ${scaleYDim})`,
      );

      transWrapperEl.addEventListener(
        'transitionend',
        () => {
          transWrapperEl.style.removeProperty('transform');
          containerEl.replaceChildren(this);
          resolve();
        },
        { once: true },
      );
    });
  } /* translateToContainer */
} /* Card */
