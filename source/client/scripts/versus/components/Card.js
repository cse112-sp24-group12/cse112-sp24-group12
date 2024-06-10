import { getCardURLFromName } from '../util.js';
import { SOUND_EFFECTS, playSoundEffect } from './../../sound.js';

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
  _translationAnimationPromise = Promise.resolve();

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
    if (this._initialized && this.hasAttribute('disabled')) {
      const cardInputEl = this.querySelector('input');
      cardInputEl.disabled = true;
    }

    const suite = this.getAttribute('suite');
    const number = this.getAttribute('number');

    if (
      this.getAttribute('variant') !== 'front' ||
      !suite ||
      !number ||
      !this._initialized
    )
      return;

    const cardInputEl = this.querySelector('input');
    const cardLabelEl = this.querySelector('label');
    const cardImageEl = this.querySelector('img');

    const htmlIdName = `drawn_card_${suite}_${number}`;

    cardLabelEl.htmlFor = htmlIdName;
    cardInputEl.id = htmlIdName;
    cardInputEl.value = JSON.stringify({ suite, number: +number });

    cardImageEl.src = getCardURLFromName(suite, number);
  }; /* handleUpdate */

  /**
   * Animates card sliding into a container; at the end of the animation, the card
   * will be moved into the container in the DOM as well
   * @param { HTMLElement } containerEl container that element should end up in
   * @returns { Promise<void> }
   */
  async translateToContainer(containerEl) {
    const transWrapperEl = this.querySelector('.card-trans-wrapper');

    /* calculate difference between current and desired position */
    const transWrapperElRect = transWrapperEl.getBoundingClientRect();
    const containerElRect = containerEl.getBoundingClientRect();

    const diffXPos = transWrapperElRect.left - containerElRect.left;
    const diffYPos = transWrapperElRect.top - containerElRect.top;

    const scaleXDim = transWrapperElRect.width / containerElRect.width;
    const scaleYDim = transWrapperElRect.height / containerElRect.height;

    /* swap and translate */
    containerEl.replaceChildren(this);

    const translationAnimation = transWrapperEl.animate(
      [
        {
          transform: `translate(${diffXPos}px, ${diffYPos}px) scale(${scaleXDim}, ${scaleYDim})`,
        },
        {},
      ],
      {
        duration: 350,
      },
    );

    /* promise for blocking animation */
    this._translationAnimationPromise = new Promise((resolve) => {
      translationAnimation.addEventListener(
        'finish',
        () => {
          resolve();
        },
        { once: true },
      );
    });

    playSoundEffect(SOUND_EFFECTS.SWISH);

    return this._translationAnimationPromise;
  } /* translateToContainer */

  /**
   * Returns promise last attached to call of translateToContainer function;
   * can be used to ensure that translation has completed before proceeding
   * with further animations
   * @returns { Promise<void> } promise that resolves when animation complete
   */
  async getCardTranslationPromise() {
    return this._translationAnimationPromise;
  } /* pendCardTranslation */

  /**
   * Flips card to targeted side and returns promise that resolves
   * when transition (i.e., flip) is completed
   * @param { 'front'|'back' } targetSide side that card will be flipped to
   * @returns { Promise<void> } promise that resolves when transition complete
   */
  async flipCard(targetSide) {
    this.setAttribute('variant', targetSide);

    /* promise for blocking animation */
    return new Promise((resolve) => {
      this.addEventListener(
        'transitionend',
        () => {
          resolve();
        },
        { once: true },
      );
    });
  } /* animateCardFlip */
} /* Card */
