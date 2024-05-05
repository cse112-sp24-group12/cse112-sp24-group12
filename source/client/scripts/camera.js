// initialize document content
const cameraImg = document.querySelector('#camera-img');
const cameraBtn = document.querySelector('#take-photo-btn');
const video = document.querySelector('#video-display');
const submitBtn = document.querySelector('#submit-btn');
const photoDisplay = document.querySelector('#photoDisplay');

//clear localStorage everytime come back or refresh
window.localStorage.removeItem('userImage');

const character = document.getElementsByClassName('character');
for (let i = 0; i < character.length; i++) {
  if (i == 0) {
    character[i].addEventListener('click', dragonSelected);
  } else if (i == 1) {
    character[i].addEventListener('click', pandaSelected);
  } else {
    character[i].addEventListener('click', takePicture);
  }
}

const clicked = [];

/**
 * Handler function for when dragon character is selected.
 * Functionalities:
 * - Update clicked stack
 * - Update borders
 * - Set LocalStorage
 */
function dragonSelected() {
  clicked.pop();
  clicked.push('dragon');
  window.localStorage.removeItem('userImage');
  window.localStorage.setItem(
    'userImage',
    './assets/images/characters/dragon.png',
  );
  borderHandler();
}

/**
 * Handler function for when pand character is selected.
 * Functionalities:
 * - Update clicked stack
 * - Update borders
 * - Set LocalStorage
 */
function pandaSelected() {
  clicked.pop();
  clicked.push('panda');
  window.localStorage.removeItem('userImage');
  window.localStorage.setItem(
    'userImage',
    './assets/images/characters/panda.png',
  );
  borderHandler();
}

/**
 * Handler function for when "Take your own picture" is selected.
 * Functionalities:
 * - Update clicked stack
 * - Update borders
 * - Set LocalStorage
 * - Load Camera canvas
 */
function takePicture() {
  clicked.pop();
  clicked.push('camera');
  borderHandler();
  loadCamera();
}

/**
 * Handles CSS elements for different selections
 * - Dynamically creates and deletes borders
 * - Dynamically make the take photo btn active and inactive
 */
function borderHandler() {
  let takePhotoBtn = document.getElementById('take-photo-btn');
  let char1 = document.getElementById('char-1');
  let char2 = document.getElementById('char-2');
  let char3 = document.getElementById('char-3');
  let borderStyle = '2px solid white';
  let style = document.createElement('style');
  let hover =
    '#take-photo-btn:hover{background-color: #fff1; color: #fff; border-color: $fff; scale: 1.05;}';
  let active = '#take-photo-btn:active{scale: 0.98;}';
  style.appendChild(document.createTextNode(hover));
  style.appendChild(document.createTextNode(active));

  if (clicked[0] === 'dragon') {
    char1.style.border = borderStyle;
    char2.style.border = '';
    char3.style.border = '';
    if (takePhotoBtn.children.length != 0) {
      takePhotoBtn.removeChild(takePhotoBtn.children[0]);
    }
    video.style.visibility = 'hidden';
    takePhotoBtn.style.visibility = 'hidden';
    submitBtn.style.visibility = 'visible';
  } else if (clicked[0] === 'panda') {
    char1.style.border = '';
    char2.style.border = borderStyle;
    char3.style.border = '';
    if (takePhotoBtn.children.length != 0) {
      takePhotoBtn.removeChild(takePhotoBtn.children[0]);
    }
    video.style.visibility = 'hidden';
    takePhotoBtn.style.visibility = 'hidden';
    submitBtn.style.visibility = 'visible';
  } else {
    char1.style.border = '';
    char2.style.border = '';
    char3.style.border = borderStyle;
    if (takePhotoBtn.children.length == 0) {
      takePhotoBtn.appendChild(style);
    }
    video.style.visibility = 'visible';
    takePhotoBtn.style.visibility = 'visible';
    submitBtn.style.visibility = 'visible';
  }
}

/**
 * Opens a live video canvas
 */
async function loadCamera() {
  let stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  if (stream) video.srcObject = stream;
}

/**
 * Handler for photo taking and display image
 */
cameraBtn.onclick = function () {
  if (clicked.pop() === 'camera') {
    cameraImg.hidden = true;
    photoDisplay
      .getContext('2d')
      .drawImage(video, 0, 0, photoDisplay.width, photoDisplay.height);
    let image_data_url = photoDisplay.toDataURL('image/jpeg');
    window.localStorage.setItem('userImage', image_data_url);
  }
};

/**
 * Switch href to game page
 */
submitBtn.onclick = function () {
  window.location.href = './game.html';
};
