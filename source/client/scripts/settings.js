
/**
 * Navigates to targeted settings section; disables all currently active sections
 * and activates targeted section
 * @param { HTMLElement } targetSectionEl 
 */
function handleNavigation(targetSectionEl) {
  [...document.querySelectorAll('section.active')].forEach((el) => {
    el.classList.remove('active');
  });

  targetSectionEl.classList.add('active');
} /* handleNavigation */

/**
 * Initializes event listeners for navigation
 */
function initSettings() {
  const audioMenuButtonEl = document.querySelector('#audio_menu_button');
  const profileMenuButtonEl = document.querySelector('#profile_menu_button');
  const infoMenuButtonEl = document.querySelector('#info_menu_button');

  const audioMenuEl = document.querySelector('#volume_settings');
  const profileMenuEl = document.querySelector('#profile_settings');
  const infoMenuEl = document.querySelector('#information_settings');

  audioMenuButtonEl.addEventListener('click', () => handleNavigation(audioMenuEl));
  profileMenuButtonEl.addEventListener('click', () => handleNavigation(profileMenuEl));
  infoMenuButtonEl.addEventListener('click', () => handleNavigation(infoMenuEl));
} /* initSettings */

window.addEventListener('DOMContentLoaded', initSettings);