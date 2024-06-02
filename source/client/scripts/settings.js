/** @module settings */

import {
  getProfileImageUrl,
  getUsername,
  setProfileImage,
  setUsername,
  // getProfileImageNameOptions,
  // getProfileImageUrlFromName,
  setMusicVolumeLevel,
  setSFXVolumeLevel,
  getMusicVolumeLevel,
  getSFXVolumeLevel,
} from './profile.js';
import tarotConfig from './tarot.js';

/**
 * Connects each button/wrapper to its corresponding section, and attaches listeners
 * to switch sections on button click
 * @param { Record<string, string> } buttonWrapperIdToSectionIdMap
 */
function initializeNavigation(buttonWrapperIdToSectionIdMap) {
  Object.entries(buttonWrapperIdToSectionIdMap).forEach(
    ([buttonWrapperId, sectionId]) => {
      const buttonWrapperEl = document.querySelector(buttonWrapperId);
      const buttonEl = buttonWrapperEl.querySelector('button');
      const sectionEl = document.querySelector(sectionId);

      buttonEl.addEventListener('click', () => {
        [
          ...document.querySelectorAll('section.active, .sword-slider.active'),
        ].forEach((el) => {
          el.classList.remove('active');
        });

        sectionEl.classList.add('active');
        buttonWrapperEl.classList.add('active');
      });
    },
  );
} /* initializeNavigation */

/**
 * Saves volume setting on user input
 * @param volumeEl
 * @param setVolumeCallbackFn
 */
function saveVolume(volumeEl, setVolumeCallbackFn) {
  volumeEl.addEventListener('change', () => {
    setVolumeCallbackFn(volumeEl.value / 100);
  });
} /* saveVolume */

/**
 * Populate the list of cards
 */
function initalizeCards() {
  const cardListEl = document.querySelector('#information-card-list');
  const cards = tarotConfig.tarot;

  cardListEl.replaceChildren(
    ...cards.map((card) => {
      const newCardEl = document.createElement('div');
      const imgEl = document.createElement('img');

      newCardEl.classList.add('card');
      imgEl.src = card.image;
      imgEl.alt = card.name;
      imgEl.setAttribute("data-info", card.keywords.join(", "));

      newCardEl.appendChild(imgEl);

      return newCardEl;
    }),
  );
} /* initalizeCards */

/**
 * Save username adjustment
 */
function saveSettings() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  const selectedAvatarImg = document.querySelector("input[type='radio']:checked");

  setUsername(usernameInputEl.value);
  setProfileImage(selectedAvatarImg.value);

  resetSettings();
} /* saveSettings */

/**
 * Reset username to original username before current edit
 */
function resetSettings() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  const avatarImageEl = document.querySelector('#profile_settings_avatar');

  usernameInputEl.value = getUsername();
  avatarImageEl.src = getProfileImageUrl();
} /* resetSettings */

/**
 * Get volume input stored in settings
 */
function initializeVolumeInput() {
  const musicSettingsEl = document.querySelector('#music_volume_slider');
  const sfxSettingsEl = document.querySelector('#sfx_volume_slider');

  musicSettingsEl.value = getMusicVolumeLevel() * 100;
  sfxSettingsEl.value = getSFXVolumeLevel() * 100;
} /* initializeVolumeInput */

/**
 * Initializes event listeners for navigation
 */
function initializeSettings() {
  const musicSettingsEl = document.querySelector('#music_volume_slider');
  const sfxSettingsEl = document.querySelector('#sfx_volume_slider');
  const saveSettingsButtonEl = document.querySelector('#save_settings_button');
  const resetSettingsButtonEl = document.querySelector('#reset_settings_button');
  // Implement avatar selection
  
  const changeAvatarButton = document.querySelector('#change_image_button');
  changeAvatarButton.addEventListener('click', () => {
    document.querySelector('#select-profile-picture-wrapper').classList.add('active');
  });

  
  const closeAvatarButton = document.querySelector(
    '#select-profile-picture-close',
  );
  // on close avatar selection button, it will change the displayed picture and close.
  closeAvatarButton.addEventListener('click', () => {
    // make the selecter disappear on close
    document.querySelector('#select-profile-picture-wrapper').classList.remove('active');
    // get the url of the selected radio image and display it.
    let selectedAvatarImg = document.querySelector("input[type='radio']:checked")
                              .getAttribute("data-url");
    document.querySelector('#profile_settings_avatar').src = selectedAvatarImg;
  });
  
  // if the input radio checked attribute is different from the stored value in the localstorage
  if( getProfileImageUrl() != document.querySelector("input[name='avatar-radio']:checked")
                                .getAttribute("data-url")){
    let radios = document.querySelectorAll("input[name='avatar-radio']");
    //uncheck it
    document.querySelector("input[name='avatar-radio']:checked").checked = false;

    // Loop through the radio buttons to find the matching one
    radios.forEach(radio => {
      if (radio.getAttribute("data-url") === getProfileImageUrl()) {
        radio.checked = true;
      }
    });
  }

  // need to make the cards first, before the onclick
  initalizeCards();


  // Card information onclick
  const cardImages = document.querySelectorAll("#information-card-list div img");
  // loop through all the images and make an onclick that takes the alt, and the data, and display
  cardImages.forEach( img => {
    img.addEventListener('click', () => {
      document.querySelector("output[name='card-name-output']").textContent = img.alt;
      document.querySelector("output[name='card-info-output']").textContent = img.getAttribute("data-info");

      document.querySelector("#card-information-wrapper").classList.add('active');
    });
  });

  const closeInfoButton = document.querySelector("#card-information-close");
  closeInfoButton.addEventListener('click', () => {
    document.querySelector("#card-information-wrapper").classList.remove('active');
    
  })
  

  // TODO: Refactor code

  resetSettings();
  //saveSettings(); this breaks the avatar refresh.
  initializeVolumeInput();
  initializeNavigation({
    '#audio_menu_button_wrapper': '#volume_settings',
    '#profile_menu_button_wrapper': '#profile_settings',
    '#info_menu_button_wrapper': '#information_settings',
  });
  saveVolume(musicSettingsEl, setMusicVolumeLevel);
  saveVolume(sfxSettingsEl, setSFXVolumeLevel);

  saveSettingsButtonEl.addEventListener('click', saveSettings);
  resetSettingsButtonEl.addEventListener('click', resetSettings);
} /* initSettings */

window.addEventListener('DOMContentLoaded', initializeSettings);
