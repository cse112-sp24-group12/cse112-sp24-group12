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
 *
 * @param volumeEl
 * @param setVolumeCallbackFn
 */
function initializeVolumeInput(volumeEl, setVolumeCallbackFn) {
  volumeEl.addEventListener('change', () => {
    setVolumeCallbackFn(volumeEl.value / 100);
  });
} /* initializeVolumeInput */

/**
 *
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

      newCardEl.appendChild(imgEl);

      return newCardEl;
    }),
  );
}

/**
 *
 */
function saveSettings() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  // const avatarImageEl = document.querySelector('#profile_settings_avatar');

  setUsername(usernameInputEl.value);
  setProfileImage();

  resetSettings();
} /* saveSettings */

/**
 *
 */
function resetSettings() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  const avatarImageEl = document.querySelector('#profile_settings_avatar');

  usernameInputEl.value = getUsername();
  avatarImageEl.src = getProfileImageUrl();
} /* resetSettings */

/**
 *
 */
function saveVolume() {
  const musicSettingsEl = document.querySelector('#music_volume_slider');
  const sfxSettingsEl = document.querySelector('#sfx_volume_slider');

  musicSettingsEl.value = getMusicVolumeLevel() * 100;
  sfxSettingsEl.value = getSFXVolumeLevel() * 100;
} /* saveVolume */

/**
 * Initializes event listeners for navigation
 */
function initializeSettings() {
  const musicSettingsEl = document.querySelector('#music_volume_slider');
  const sfxSettingsEl = document.querySelector('#sfx_volume_slider');
  const saveSettingsButtonEl = document.querySelector('#save_settings_button');
  const resetSettingsButtonEl = document.querySelector(
    '#reset_settings_button',
  );
  // TODO: Implement avatar selection

  const changeAvatarButton = document.querySelector('#change_image_button');
  changeAvatarButton.addEventListener('click', () => {
    document
      .querySelector('#select-profile-picture-wrapper')
      .classList.add('active');
  });
  const closeAvatarButton = document.querySelector(
    '#select-profile-picture-close',
  );
  closeAvatarButton.addEventListener('click', () => {
    document
      .querySelector('#select-profile-picture-wrapper')
      .classList.remove('active');
  });

  // TODO: Card information onclick
  /*
  const cardInfoPopup = document.querySelector("card");
  cardInfoPopup.addEventListener('click', () => {
    document.querySelector("#card-information-wrapper").classList.add('active');
  });

  const closeInfoButton = document.querySelector("#card-information-close");
  closeInfoButton.addEventListener('click', () => {
    document.querySelector("#card-information-wrapper").classList.remove('active');
  })
  */
  // TODO: Refactor code

  resetSettings();
  saveSettings();
  saveVolume();
  initializeNavigation({
    '#audio_menu_button_wrapper': '#volume_settings',
    '#profile_menu_button_wrapper': '#profile_settings',
    '#info_menu_button_wrapper': '#information_settings',
  });
  initializeVolumeInput(musicSettingsEl, setMusicVolumeLevel);
  initializeVolumeInput(sfxSettingsEl, setSFXVolumeLevel);
  initalizeCards();

  saveSettingsButtonEl.addEventListener('click', saveSettings);
  resetSettingsButtonEl.addEventListener('click', resetSettings);
} /* initSettings */

window.addEventListener('DOMContentLoaded', initializeSettings);
