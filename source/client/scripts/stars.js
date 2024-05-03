let mouseX = 0;
let mouseY = 0;
let stars = [];

const starSize = 3;
const starSlowness = 700;
const maxOpacity = 0.8;
const mouseSpeed = 0.2; // how much does the mouse affect the stars?

const starsContainer = document.getElementById("stars-container");

window.addEventListener("DOMContentLoaded", () => {
  stars = new Array(400).fill().map(() => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
  }));

  for (let i = 0; i < stars.length; i++) {
    const starElement = document.createElement("div");
    starElement.className = "star";
    updateStar(starElement, i);
    starsContainer.appendChild(starElement);
  }

  animate();
});

function animate() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].z = (stars[i].z + 1 / starSlowness) % 1;
  }

  for (let i = 0; i < stars.length; i++) {
    updateStar(starsContainer.children[i], i);
  }

  requestAnimationFrame(animate);
}

function updateStar(starElement, i) {
  const star = stars[i];

  const opacity = maxOpacity * (1 - Math.pow(2 * star.z - 1, 4));

  starElement.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;

  // both numbers from 0 to 1
  const pos = {
    x: star.x + (star.x - 0.5) * star.z,
    y: star.y + (star.y - 0.5) * star.z,
  };

  // offset due to mouse
  const offset = {
    x: mouseSpeed * (mouseX * star.z),
    y: mouseSpeed * (mouseY * star.z),
  };

  starElement.style.left = `calc(${100 * pos.x}% + ${offset.x}px)`;
  starElement.style.top = `calc(${100 * pos.y}% + ${offset.y}px)`;

  starElement.style.width = `${starSize * star.z}px`;
  starElement.style.height = `${starSize * star.z}px`;
}

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
