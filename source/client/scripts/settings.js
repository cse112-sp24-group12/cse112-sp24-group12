/** @module settings */

import { getProfileImageUrl, getUsername } from './profile.js';

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
function initializeSaving() {

} /* intializeSaving */

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
 * Initializes event listeners for navigation
 */
function initializeSettings() {
  const resetSettingsButtonEl = document.querySelector('#reset_settings_button');

  resetSettings();
  initializeSaving();
  initializeNavigation({
    '#audio_menu_button_wrapper': '#volume_settings',
    '#profile_menu_button_wrapper': '#profile_settings',
    '#info_menu_button_wrapper': '#information_settings',
  });

  resetSettingsButtonEl.addEventListener('click', resetSettings);
} /* initSettings */

window.addEventListener('DOMContentLoaded', initializeSettings);