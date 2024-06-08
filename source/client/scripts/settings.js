/** @module settings */

import {
  getProfileImageUrl,
  getUsername,
  setProfileImage,
  setUsername,
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
 * Adds event listener to change volume setting on user input
 * @param { HTMLElement } volumeEl
 * @param { Function } setVolumeCallbackFn
 */
function initializeVolumeInput(volumeEl, setVolumeCallbackFn) {
  volumeEl.addEventListener('change', () => {
    setVolumeCallbackFn(volumeEl.value / 100);
  });
} /* initializeVolumeInput */

/**
 * Populate the list of cards and interactions for opening/closing info menus
 */
function initalizeCards() {
  const cardNameTitleEl = document.querySelector('#card_name_output');
  const cardInfoTextEl = document.querySelector('#card_info_output');
  const cardInfoWrapperEl = document.querySelector('#card-information-wrapper');
  const closeCardInfoButtonEl = document.querySelector(
    '#card-information-close',
  );

  const cardListEl = document.querySelector('#information-card-list');
  const cardList = tarotConfig.tarot;

  cardListEl.replaceChildren(
    ...cardList.map((card) => {
      const newCardEl = document.createElement('div');
      const imgEl = document.createElement('img');

      newCardEl.classList.add('card');
      imgEl.src = card.image;
      imgEl.alt = card.name;

      newCardEl.appendChild(imgEl);

      newCardEl.addEventListener('click', () => {
        cardNameTitleEl.innerText = card.name;
        cardInfoTextEl.innerText = card.keywords.join(', ');
        cardInfoWrapperEl.classList.add('active');
      });

      return newCardEl;
    }),
  );

  closeCardInfoButtonEl.addEventListener('click', () => {
    cardInfoWrapperEl.classList.remove('active');
  });
} /* initalizeCards */

/**
 * Save username adjustment
 */
function saveSettings() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  const selectedAvatarImg = document.querySelector(
    "input[type='radio']:checked",
  );

  setUsername(usernameInputEl.value);
  setProfileImage(selectedAvatarImg.value);

  resetSettings();
} /* saveSettings */

/**
 * Reset/refresh all settings to align with currently saved values
 */
function resetSettings() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  const avatarImageEl = document.querySelector('#profile_settings_avatar');
  const musicSettingsEl = document.querySelector('#music_volume_slider');
  const sfxSettingsEl = document.querySelector('#sfx_volume_slider');

  usernameInputEl.value = getUsername();
  avatarImageEl.src = getProfileImageUrl();
  musicSettingsEl.value = getMusicVolumeLevel() * 100;
  sfxSettingsEl.value = getSFXVolumeLevel() * 100;
} /* resetSettings */

/**
 *
 */
function initializeAvatarSelection() {
  const changeAvatarButtonEl = document.querySelector('#change_image_button');
  const saveProfilePictureButtonEl = document.querySelector('#save_pfp_button');
  const selectProfilePictureModalEl = document.querySelector(
    '#select_profile_picture_modal',
  );

  changeAvatarButtonEl.addEventListener('click', () => selectProfilePictureModalEl.showModal());

  saveProfilePictureButtonEl.addEventListener('click', () => {
    selectProfilePictureModalEl.close();

    const selectedAvatarImgName = document
      .querySelector("input[type='radio']:checked")
      .value;
    
    setProfileImage(selectedAvatarImgName);

    resetSettings();
  });
} /* initializeAvatarSelection */

/**
 * Initializes settings functionality
 */
function initializeSettings() {
  const musicSettingsEl = document.querySelector('#music_volume_slider');
  const sfxSettingsEl = document.querySelector('#sfx_volume_slider');
  const saveSettingsButtonEl = document.querySelector('#save_settings_button');
  const resetSettingsButtonEl = document.querySelector(
    '#reset_settings_button',
  );

  resetSettings();
  initalizeCards();
  initializeAvatarSelection();
  initializeVolumeInput(musicSettingsEl, setMusicVolumeLevel);
  initializeVolumeInput(sfxSettingsEl, setSFXVolumeLevel);
  initializeNavigation({
    '#audio_menu_button_wrapper': '#volume_settings',
    '#profile_menu_button_wrapper': '#profile_settings',
    '#info_menu_button_wrapper': '#information_settings',
  });

  saveSettingsButtonEl.addEventListener('click', saveSettings);
  resetSettingsButtonEl.addEventListener('click', resetSettings);
} /* initializeSettings */

window.addEventListener('DOMContentLoaded', initializeSettings);
