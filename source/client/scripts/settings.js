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
  getProfileImageNameOptions,
  getProfileImageUrlFromName,
  getProfileImageName,
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
 *
 */
function initializeUsernameInput() {
  const usernameInputEl = document.querySelector('#profile_settings_username');
  const saveUsernameButtonEl = document.querySelector('#save_settings_button');

  saveUsernameButtonEl.addEventListener('click', () => {
    setUsername(usernameInputEl.value);
    resetSettings();
  });
} /* initializeUsernameInput */

/**
 * Populate the list of cards and interactions for opening/closing info menus
 */
function initializeCards() {
  const cardInfoModalEl = document.querySelector('#card_info_modal');
  const cardNameTitleEl = document.querySelector('#card_name_output');
  const cardInfoTextEl = document.querySelector('#card_info_output');

  const cardListEl = document.querySelector('#information-card-list');
  const cardList = tarotConfig.tarot;

  cardListEl.replaceChildren(
    ...cardList.map((card) => {
      const cardButtonEl = document.createElement('button');
      const imgEl = document.createElement('img');

      imgEl.src = card.image;
      imgEl.alt = card.name;

      cardButtonEl.appendChild(imgEl);

      cardButtonEl.addEventListener('click', () => {
        cardNameTitleEl.innerText = card.name;
        cardInfoTextEl.innerText = card.keywords.join(', ');

        cardInfoModalEl.showModal();
      });

      return cardButtonEl;
    }),
  );
} /* initializeCards */

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
 *
 */
function createAvatarEls() {
  const currentProfileImageName = getProfileImageName();

  return getProfileImageNameOptions().map((profileImageName) => {
    const profileImageOptionWrapperEl = document.createElement('div');
    const inputEl = document.createElement('input');
    const labelEl = document.createElement('label');
    const imgEl = document.createElement('img');

    inputEl.id = profileImageName;
    inputEl.value = profileImageName;
    inputEl.type = 'radio';
    inputEl.name = 'avatar_radio';

    if (profileImageName === currentProfileImageName) inputEl.checked = true;

    labelEl.htmlFor = profileImageName;

    imgEl.src = getProfileImageUrlFromName(profileImageName);
    imgEl.alt = profileImageName;

    labelEl.replaceChildren(imgEl);
    profileImageOptionWrapperEl.replaceChildren(inputEl, labelEl);

    return profileImageOptionWrapperEl;
  });
} /* createAvatarEls */

/**
 *
 */
function initializeAvatarSelection() {
  const changeAvatarButtonEl = document.querySelector('#change_image_button');
  const saveAvatarButtonEl = document.querySelector('#save_pfp_button');
  const avatarImageEl = document.querySelector('#profile_settings_avatar');
  const avatarModalEl = document.querySelector('#select_avatar_modal');
  const avatarOptionWrapperEl = document.querySelector('#avatar_opt_wrapper');

  avatarOptionWrapperEl.replaceChildren(...createAvatarEls());

  [changeAvatarButtonEl, avatarImageEl].forEach((el) =>
    el.addEventListener('click', () => avatarModalEl.showModal()),
  );

  saveAvatarButtonEl.addEventListener('click', () => {
    avatarModalEl.close();

    const selectedAvatarImgName = document.querySelector(
      "input[type='radio']:checked",
    ).value;

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
  const resetSettingsButtonEl = document.querySelector(
    '#reset_settings_button',
  );

  resetSettings();
  initializeCards();
  initializeAvatarSelection();
  initializeUsernameInput();
  initializeVolumeInput(musicSettingsEl, setMusicVolumeLevel);
  initializeVolumeInput(sfxSettingsEl, setSFXVolumeLevel);
  initializeNavigation({
    '#audio_menu_button_wrapper': '#volume_settings',
    '#profile_menu_button_wrapper': '#profile_settings',
    '#info_menu_button_wrapper': '#information_settings',
  });

  resetSettingsButtonEl.addEventListener('click', resetSettings);
} /* initializeSettings */

window.addEventListener('DOMContentLoaded', initializeSettings);
