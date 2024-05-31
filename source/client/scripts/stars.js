/**
 * @typedef { {
 *  xPosPercent: number,
 *  yPosPercent: number,
 *  zPosPercent: number
 * } } Star
 */

const NUM_STARS = 250;
const MAX_OPACITY_PERCENT = 0.95;
const STAR_SPEED_PERCENTILE = 0.0007;
const MOUSE_EFFECT_COEFF = 0.05;
const STAR_RADIUS_COEFF = 3;
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
  mouseState.xPosPercentFromCenter = event.clientX / window.innerWidth - 0.5;
  mouseState.yPosPercentFromCenter = event.clientY / window.innerHeight - 0.5;
} /* updateMousePosition */

/**
 * (Re)sizes canvas element to always cover the entire client screen
 * @param { HTMLCanvasElement } starBgCanvasEl canvas element to resize
 */
function handleResize(starBgCanvasEl) {
  starBgCanvasEl.width = window.innerWidth;
  starBgCanvasEl.height = window.innerHeight;
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
 * Handles animation of a single star for a single frame
 * @param { Star } star individual star to animate
 * @param { CanvasRenderingContext2D } canvasContext 2D canvas context to render onto
 * @param { number } cameraX x coordinate of viewing position
 * @param { number } cameraY y coordinate of viewing position
 */
function animateSingleStar(star, canvasContext, cameraX, cameraY) {
  /* move star a step toward the camera */
  star.zPosPercent = (star.zPosPercent + STAR_SPEED_PERCENTILE) % 1;

  /* project coordinate in 3D space to 2D space */
  const projX =
    (star.xPosPercent * window.innerWidth - cameraX) *
      (1 / (1 - star.zPosPercent)) +
    cameraX;
  const projY =
    (star.yPosPercent * window.innerHeight - cameraY) *
      (1 / (1 - star.zPosPercent)) +
    cameraY;

  /* paint */
  canvasContext.fillStyle = `rgba(255, 255, 255, ${getPercentOpacity(star)})`;
  canvasContext.beginPath();
  canvasContext.arc(
    projX,
    projY,
    star.zPosPercent * STAR_RADIUS_COEFF,
    0,
    Math.PI * 2,
  );
  canvasContext.fill();
} /* animateSingleStar */

/**
 * Handles animation of each frame; individually moves stars forward a step
 * in the direction of the camera. Self-invoking.
 * @param { Star[] } stars array of stars to animate
 * @param { CanvasRenderingContext2D } canvasContext 2D canvas context to render onto
 */
function animateNextFrame(stars, canvasContext) {
  /* move camera location with the user's mouse (dampened) */
  const { xPosPercentFromCenter, yPosPercentFromCenter } = mouseState;
  const cameraX =
    window.innerWidth * (0.5 - xPosPercentFromCenter * MOUSE_EFFECT_COEFF);
  const cameraY =
    window.innerHeight * (0.5 - yPosPercentFromCenter * MOUSE_EFFECT_COEFF);

  /* paint */
  canvasContext.clearRect(
    0,
    0,
    canvasContext.canvas.width,
    canvasContext.canvas.height,
  );

  stars.forEach((star) =>
    animateSingleStar(star, canvasContext, cameraX, cameraY),
  );

  /* self-invoke next frame */
  requestAnimationFrame(() => animateNextFrame(stars, canvasContext));
} /* animateNextFrame */

/**
 * Creates and attaches canvas element to page, and then initializes animation and
 * appropriate event listeners
 */
function init() {
  /* create star canvas element */
  const starBgCanvasEl = document.createElement('canvas');
  starBgCanvasEl.classList.add('star-bg');
  handleResize(starBgCanvasEl);
  document.body.append(starBgCanvasEl);

  /* initialize animation */
  const canvasContext = starBgCanvasEl.getContext('2d');
  animateNextFrame(generateStars(NUM_STARS), canvasContext);

  /* attach listeners */
  window.addEventListener('mousemove', updateMousePosition, { passive: true });
  window.addEventListener('resize', () => handleResize(starBgCanvasEl), {
    passive: true,
  });
} /* init */

window.addEventListener('DOMContentLoaded', init);
