/**
 * @typedef { {
 *  xPosPercent: number,
 *  yPosPercent: number,
 *  zPosPercent: number,
 *  htmlElement: HTMLElement
 * } } Star
 */

const NUM_STARS = 200;
const MAX_OPACITY_PERCENT = 0.75;
const STAR_SPEED_PERCENTILE = 0.001;
const MOUSE_EFFECT_COEFF = 0.05;
const CENTER_EXCLUSION_RADIUS = 0.2;
const Z_AXIS_ORIGIN_PX = 250;

/**
 * @type { {
 *  xPos: number,
 *  yPos: number
 * } }
 */
const mouseState = {
  xPosPercentFromCenter: 0,
  yPosPercentFromCenter: 0,
};

/**
 * Updates mouse x and y positions as relative percents of total screen size
 * in mouseState object, using the center of the screen as the (0, 0) origin
 * @param { MouseEvent } event mouse movement event passed by listener; passive
 */
function updateMousePosition(event) {
  const { clientWidth, clientHeight } = document.body;

  mouseState.xPosPercentFromCenter = event.clientX / clientWidth - 0.5;
  mouseState.yPosPercentFromCenter = event.clientY / clientHeight - 0.5;
} /* updateMousePosition */

/**
 * Generates a psuedo-random pair of XY coordinates for a star such that the
 * coordinates avoid for the direct center of the screen, to avoid collisions
 * with the camera
 * @returns {{
 *  xPosPercent: number,
 *  yPosPercent: number
 * } } pair of (x, y) coords in range [0, 1]
 */
function generateRandomXYPosPercents() {
  let xPosPercent, yPosPercent;

  do {
    xPosPercent = Math.random();
    yPosPercent = Math.random();
  } while (
    Math.hypot(xPosPercent - 0.5, yPosPercent - 0.5) < CENTER_EXCLUSION_RADIUS
  );

  return { xPosPercent, yPosPercent };
} /* generateRandomXYPosPercents */

/**
 * Creates and returns new Star objects, which each include initial
 * x, y, & z positions as well as corresponding HTML elements
 * @param { number } numStars number of stars to create
 * @returns { Star[] } array of newly created stars
 */
function generateStars(numStars) {
  return Array.from({ length: numStars }).map(() => {
    const starEl = document.createElement('div');
    starEl.className = 'star';

    return {
      ...generateRandomXYPosPercents(),
      zPosPercent: Math.random(),
      htmlElement: starEl,
    };
  });
} /* generateStars */

/**
 * Calculates appropriate current opacity for a star, based off its z position
 * @param { Star } star target star
 * @returns { number } percent opacity in range [0, 1]
 */
function getPercentOpacity(star) {
  return star.zPosPercent ** 0.5 * MAX_OPACITY_PERCENT;
} /* getPercentOpacity */

/**
 * Handles animation of each frame; individually moves stars forward a step
 * in the direction of the camera. Self-invoking.
 * @param { Star[] } stars array of stars to animate
 * @param { HTMLElement } starsContainerEl container element of stars, used to control perspective
 */
function animateNextFrame(stars, starsContainerEl) {
  /* move perspective origin of parent to create mouse-movement effect*/
  const { xPosPercentFromCenter, yPosPercentFromCenter } = mouseState;
  const xPerspPercent = 50 - 100 * xPosPercentFromCenter * MOUSE_EFFECT_COEFF;
  const yPerspPercent = 50 - 100 * yPosPercentFromCenter * MOUSE_EFFECT_COEFF;

  starsContainerEl.style.perspectiveOrigin = `${xPerspPercent}% ${yPerspPercent}%`;

  /* individually move stars closer to the camera */
  stars.forEach((star) => {
    star.zPosPercent = (star.zPosPercent + STAR_SPEED_PERCENTILE) % 1;

    star.htmlElement.style.backgroundColor = `rgba(255, 255, 255, ${getPercentOpacity(star)})`;
    star.htmlElement.style.transform = `translateZ(${star.zPosPercent * Z_AXIS_ORIGIN_PX}px)`;
  });

  /* self-invoke next frame */
  requestAnimationFrame(() => animateNextFrame(stars, starsContainerEl));
} /* animateNextFrame */

/**
 * Places stars into parent container and positions them appropriately
 * @param { Star[] } stars stars to place onto screen
 * @param { HTMLElement } starsContainerEl parent to place stars into
 */
function initializeStarPositions(stars, starsContainerEl) {
  starsContainerEl.replaceChildren(...stars.map((star) => star.htmlElement));

  stars.forEach((star) => {
    star.htmlElement.style.left = `${star.xPosPercent * 100}%`;
    star.htmlElement.style.top = `${star.yPosPercent * 100}%`;
  });
} /* initializeStarPositions */

/**
 * Initializes creation and placement of stars into background and commences
 * animation frame sequence
 */
function init() {
  const starsContainerEl = document.querySelector('#stars-container');

  const stars = generateStars(NUM_STARS);

  initializeStarPositions(stars, starsContainerEl);
  animateNextFrame(stars, starsContainerEl);
} /* init */

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('mousemove', updateMousePosition, { passive: true });
