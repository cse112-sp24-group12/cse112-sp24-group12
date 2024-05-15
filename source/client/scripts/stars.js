/**
 * @typedef { {
 *  xPosPercent: number,
 *  yPosPercent: number,
 *  zPosPercent: number,
 * } } Star
 */

const NUM_STARS = 250;
const MAX_OPACITY_PERCENT = 0.95;
const STAR_SPEED_PERCENTILE = 0.0007;
const MOUSE_EFFECT_COEFF = 0.05;
const CENTER_EXCLUSION_RADIUS = 0.2;

/**
 * @type { {
 *  xPosPercentFromCenter: number,
 *  yPosPercentFromCenter: number
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
 * (Re)sizes canvas element to always cover the entire client screen
 * @param starBgCanvasEl
 */
function handleResize(starBgCanvasEl) {
  starBgCanvasEl.width = document.body.clientWidth;
  starBgCanvasEl.height = document.body.clientHeight;
} /* handleResize */

/**
 * Creates and returns new Star objects, each including initial x, y, & z positions
 * @param { number } numStars number of stars to create
 * @returns { Star[] } array of newly created stars
 */
function generateStars(numStars) {
  return Array.from({ length: numStars }).map(() => {
    let xPosPercent, yPosPercent;

    do {
      xPosPercent = Math.random();
      yPosPercent = Math.random();
    } while (
      Math.hypot(xPosPercent - 0.5, yPosPercent - 0.5) < CENTER_EXCLUSION_RADIUS
    );

    return { xPosPercent, yPosPercent, zPosPercent: Math.random() };
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
 * @param { CanvasRenderingContext2D } canvasContext 2D canvas context to render onto
 */
function animateNextFrame(stars, canvasContext) {
  /* move perspective origin of parent to create mouse-movement effect*/
  const { xPosPercentFromCenter, yPosPercentFromCenter } = mouseState;
  const Xc =
    document.body.clientWidth *
    (0.5 - xPosPercentFromCenter * MOUSE_EFFECT_COEFF);
  const Yc =
    document.body.clientHeight *
    (0.5 - yPosPercentFromCenter * MOUSE_EFFECT_COEFF);

  canvasContext.clearRect(
    0,
    0,
    document.body.clientWidth,
    document.body.clientHeight,
  );

  /* individually move stars closer to the camera */
  stars.forEach((star) => {
    star.zPosPercent = (star.zPosPercent + STAR_SPEED_PERCENTILE) % 1;

    const x = star.xPosPercent * document.body.clientWidth;
    const y = star.yPosPercent * document.body.clientHeight;

    const X_p = (x - Xc) * (1 / (1 - star.zPosPercent)) + Xc;
    const Y_p = (y - Yc) * (1 / (1 - star.zPosPercent)) + Yc;

    canvasContext.fillStyle = `rgba(255, 255, 255, ${getPercentOpacity(star)})`;
    canvasContext.beginPath();
    canvasContext.arc(X_p, Y_p, star.zPosPercent * 3, 0, Math.PI * 2);
    canvasContext.fill();
  });

  /* self-invoke next frame */
  requestAnimationFrame(() => animateNextFrame(stars, canvasContext));
} /* animateNextFrame */

/**
 * 
 */
function init() {
  const starBgCanvasEl = document.createElement('canvas');
  handleResize(starBgCanvasEl);
  document.body.append(starBgCanvasEl);

  const canvasContext = starBgCanvasEl.getContext('2d');
  animateNextFrame(generateStars(NUM_STARS), canvasContext);

  window.addEventListener('mousemove', updateMousePosition, { passive: true });
  window.addEventListener('resize', () => handleResize(starBgCanvasEl));
} /* init */

window.addEventListener('DOMContentLoaded', init);
