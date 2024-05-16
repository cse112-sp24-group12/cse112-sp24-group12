/** @module settings */

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
 * Initializes event listeners for navigation
 */
function initSettings() {
  initializeNavigation({
    '#audio_menu_button_wrapper': '#volume_settings',
    '#profile_menu_button_wrapper': '#profile_settings',
    '#info_menu_button_wrapper': '#information_settings',
  });
} /* initSettings */

window.addEventListener('DOMContentLoaded', initSettings);