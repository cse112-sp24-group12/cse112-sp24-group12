/** @module settings */

import { getProfileImageUrl, getUsername,
  setProfileImage, setUsername,
  getProfileImageNameOptions, getProfileImageUrlFromName,
  getVolumeLevel, setVolumeLevel} from './profile.js';

import tarotConfig from './tarot.js';

/**
 * Connects each button/wrapper to its corresponding section, and attaches listeners
 * to switch sections on button click
 * @param { Record<string, string> } buttonWrapperIdToSectionIdMap 
 */
function initializeNavigation(buttonWrapperIdToSectionIdMap) {
  Object.entries(buttonWrapperIdToSectionIdMap).forEach(([buttonWrapperId, sectionId]) => {
    const buttonWrapperEl = document.querySelector(buttonWrapperId);
    const buttonEl = buttonWrapperEl.querySelector('button');
    const sectionEl = document.querySelector(sectionId);

    buttonEl.addEventListener('click', () => {
      [...document.querySelectorAll('section.active, .sword-slider.active')].forEach((el) => {
        el.classList.remove('active');
      });

      sectionEl.classList.add('active');
      buttonWrapperEl.classList.add('active');
    });
  });
} /* initializeNavigation */

/**
 * 
 */
function initializeVolumeInput(volumeEl, musicFlag) {
  volumeEl.addEventListener('change', (event) => {
    event.preventDefault();
    console.log(volumeEl.value/100);
    setVolumeLevel(musicFlag, volumeEl.value/100);
  });
} /* initializeVolumeInput */

/**
 * 
 */
function initalizeCards() {
  const cardListEl = document.querySelector('#information-card-list');
  const cards = tarotConfig.tarot;

  cards.forEach((card) => {
    const newCard = document.createElement('div');
    const img = document.createElement('img');

    newCard.classList.add('card');
    img.src = card.image;
    img.alt = card.name;

    newCard.appendChild(img);
    cardListEl.appendChild(newCard);
  });
}

/**
 * 
 */
function saveSettings() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  const avatarImageEl = document.querySelector('#profile_settings_avatar');

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

  musicSettingsEl.value = getVolumeLevel(true)*100;
  sfxSettingsEl.value = getVolumeLevel(false)*100;
} /* saveVolume */

/**
 * Initializes event listeners for navigation
 */
function initializeSettings() {
  const musicSettingsEl = document.querySelector('#music_volume_slider');
  const sfxSettingsEl = document.querySelector('#sfx_volume_slider');
  const saveSettingsButtonEl = document.querySelector('#save_settings_button');
  const resetSettingsButtonEl = document.querySelector('#reset_settings_button');
  // TODO: Implement avatar selection
  // const avatarSelectorEl = document.querySelector('#profile-settings-avatar-selector');

  resetSettings();
  saveSettings();
  saveVolume();
  initializeNavigation({
    '#audio_menu_button_wrapper': '#volume_settings',
    '#profile_menu_button_wrapper': '#profile_settings',
    '#info_menu_button_wrapper': '#information_settings',
  });
  initializeVolumeInput(musicSettingsEl, true);
  initializeVolumeInput(sfxSettingsEl, false);
  initalizeCards();
  
  saveSettingsButtonEl.addEventListener('click', saveSettings);
  resetSettingsButtonEl.addEventListener('click', resetSettings);
} /* initSettings */

window.addEventListener('DOMContentLoaded', initializeSettings);