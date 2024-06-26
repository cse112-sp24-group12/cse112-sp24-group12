/** @module profile */

import * as Types from './versus/types.js';

const LOCAL_PROFILE_IMAGE_NAME_LOCATION = 'user_profile.image_name';
const LOCAL_PROFILE_IMAGE_CUSTOM_URL_LOCATION = 'user_profile.custom_image_url';
const LOCAL_PROFILE_USERNAME_LOCATION = 'user_profile.username';
const LOCAL_PROFILE_VOLUME_MUTE_LOCATION = 'user_profile.volume_mute';
const LOCAL_PROFILE_MUSIC_LEVEL_LOCATION = 'user_profile.music_level';
const LOCAL_PROFILE_SFX_LEVEL_LOCATION = 'user_profile.sfx_level';
const LOCAL_PROFILE_UUID_lOCATION = 'user_profile.uuid';

const DEFAULT_USERNAME = 'User';
const DEFAULT_MUTE = false;
const DEFAULT_MUSIC_VOLUME_LEVEL = 0.5;
const DEFAULT_SFX_VOLUME_LEVEL = 0.5;

/** @type { Record<ProfileImageName, string> } */
const LOCAL_PROFILE_IMAGE_STANDARD_URLS = {
  default: './assets/images/profiles/default.svg',
  duck: './assets/images/profiles/duck.svg',
  elephant: './assets/images/profiles/elephant.svg',
  fox: './assets/images/profiles/fox.svg',
  lion: './assets/images/profiles/lion.svg',
  walrus: './assets/images/profiles/walrus.svg',
};

export const LOCAL_PROFILE_IMAGE_CUSTOM_FLAG = 'custom_image';

export const UPDATE_VOLUME_LISTENER_NAME = 'volume-update';

/**
 * @typedef { ('default'|'duck'|'elephant'|'fox'|'lion'|'walrus'|LOCAL_PROFILE_IMAGE_CUSTOM_FLAG) } ProfileImageName
 */

/**
 * Fetches list of existing profile image name options; used to populate
 * list of available options in settings menu
 * @returns { ProfileImageName[] } list of names that can be selected by user
 */
export function getProfileImageNameOptions() {
  return Object.keys(LOCAL_PROFILE_IMAGE_STANDARD_URLS);
} /* getProfileImageNameOptions */

/**
 * Converts name of a profile image to an actual url; used to populate option lists
 * in settings menu or pick url for opponent's icon in versus mode
 * @param { ProfileImageName } profileImageName name of profile image, custom excluded
 * @returns { string } url to profile image
 */
export function getProfileImageUrlFromName(profileImageName) {
  // TODO: Handle custom image case for opponent user
  return (
    LOCAL_PROFILE_IMAGE_STANDARD_URLS[profileImageName] ??
    LOCAL_PROFILE_IMAGE_STANDARD_URLS.default
  );
} /* getProfileImageUrlFromName */

/**
 * Saves valid profile image name, or custom (data) url, to local storage for
 * access across sessions
 * @param { ProfileImageName } profileImageName name of profile image, or custom flag if customUrl passed
 * @param { { customUrl: string } } [options] customUrl corresponding to path if custom flag set
 * @returns { boolean } true if saved successfully; otherwise false
 */
export function setProfileImage(profileImageName, { customUrl } = {}) {
  // TODO: for custom context, consider case where image file size exceeds localstorage limit (x MB)
  if (profileImageName === LOCAL_PROFILE_IMAGE_CUSTOM_FLAG) {
    if (!customUrl) return false;

    window.localStorage.setItem(
      LOCAL_PROFILE_IMAGE_NAME_LOCATION,
      LOCAL_PROFILE_IMAGE_CUSTOM_FLAG,
    );
    window.localStorage.setItem(
      LOCAL_PROFILE_IMAGE_CUSTOM_URL_LOCATION,
      customUrl,
    );

    return true;
  }

  if (!LOCAL_PROFILE_IMAGE_STANDARD_URLS[profileImageName]) {
    return false;
  }

  window.localStorage.setItem(
    LOCAL_PROFILE_IMAGE_NAME_LOCATION,
    profileImageName,
  );

  return true;
} /* setProfileImageUrl */

/**
 * Fetches profile image url from browser's local storage
 * @returns { string } file path to saved user profile image
 */
export function getProfileImageUrl() {
  const profileImageName = window.localStorage.getItem(
    LOCAL_PROFILE_IMAGE_NAME_LOCATION,
  );

  if (profileImageName === LOCAL_PROFILE_IMAGE_CUSTOM_FLAG)
    return window.localStorage.getItem(LOCAL_PROFILE_IMAGE_CUSTOM_URL_LOCATION);

  return (
    LOCAL_PROFILE_IMAGE_STANDARD_URLS[profileImageName] ??
    LOCAL_PROFILE_IMAGE_STANDARD_URLS.default
  );
} /* getProfileImageUrl */

/**
 * Fetches name of profile image from browser's local storage
 * @returns { ProfileImageName } name of profile image selected
 */
export function getProfileImageName() {
  return (
    window.localStorage.getItem(LOCAL_PROFILE_IMAGE_NAME_LOCATION) ?? 'default'
  );
} /* getProfileImageName */

/**
 * Saves valid username to local storage for access across sessions
 * @param { string } username valid (nonempty) username
 * @returns { boolean } true if saved successfully; otherwise false
 */
export function setUsername(username) {
  if (!username) return false;

  window.localStorage.setItem(LOCAL_PROFILE_USERNAME_LOCATION, username);

  return true;
} /* setUsername */

/**
 * Fetches username from browser's local storage
 * @returns { string } saved username
 */
export function getUsername() {
  return (
    window.localStorage.getItem(LOCAL_PROFILE_USERNAME_LOCATION) ??
    DEFAULT_USERNAME
  );
} /* getUsername */

/**
 * Saves mute setting to local storage for access across sessions
 * @param { boolean } isMute true if volume should be muted; otherwise false
 * @returns { boolean } true if saved successfully; otherwise false
 */
export function setIsMute(isMute) {
  if (typeof isMute !== 'boolean') return false;

  window.localStorage.setItem(LOCAL_PROFILE_VOLUME_MUTE_LOCATION, isMute);

  window.dispatchEvent(new Event(UPDATE_VOLUME_LISTENER_NAME));

  return true;
} /* setIsMute */

/**
 * Fetches mute setting from browser's local storage
 * @returns { boolean } saved mute status; true if muted and false otherwise
 */
export function getIsMute() {
  const proposedIsMute = window.localStorage.getItem(
    LOCAL_PROFILE_VOLUME_MUTE_LOCATION,
  );

  return ['true', 'false'].includes(proposedIsMute)
    ? proposedIsMute === 'true'
    : DEFAULT_MUTE;
} /* getIsMute */

/**
 * Saves music volume level setting to local storage for access across sessions
 * @param { number } volumeLevel volume level in range [0, 1]
 * @returns { boolean } true if saved successfully; false otherwise
 */
export function setMusicVolumeLevel(volumeLevel) {
  if (isNaN(volumeLevel) || volumeLevel < 0 || volumeLevel > 1) return false;

  window.localStorage.setItem(LOCAL_PROFILE_MUSIC_LEVEL_LOCATION, volumeLevel);

  window.dispatchEvent(new Event(UPDATE_VOLUME_LISTENER_NAME));

  return true;
} /* setMusicVolumeLevel */

/**
 * Saves special effects volume level setting to local storage for access across sessions
 * @param { number } volumeLevel volume level in range [0, 1]
 * @returns { boolean } true if saved successfully; false otherwise
 */
export function setSFXVolumeLevel(volumeLevel) {
  if (isNaN(volumeLevel) || volumeLevel < 0 || volumeLevel > 1) return false;

  window.localStorage.setItem(LOCAL_PROFILE_SFX_LEVEL_LOCATION, volumeLevel);

  window.dispatchEvent(new Event(UPDATE_VOLUME_LISTENER_NAME));

  return true;
} /* setSFXVolumeLevel */

/**
 * Fetches current music volume from browser's local storage
 * @returns { number } currently saved music volume in range [0, 1]
 */
export function getMusicVolumeLevel() {
  return +(
    window.localStorage.getItem(LOCAL_PROFILE_MUSIC_LEVEL_LOCATION) ??
    DEFAULT_MUSIC_VOLUME_LEVEL
  );
} /* getMusicVolumeLevel */

/**
 * Fetches current special effects volume from browser's local storage
 * @returns { number } currently saved SFX volume in range [0, 1]
 */
export function getSFXVolumeLevel() {
  return +(
    window.localStorage.getItem(LOCAL_PROFILE_SFX_LEVEL_LOCATION) ??
    DEFAULT_SFX_VOLUME_LEVEL
  );
} /* getSFXVolumeLevel */

/**
 * Attaches UUID sent from server to profile instance by saving it to browser's
 * session storage; UUIDs are set on a per-instance basis
 * @param { Types.UUID } playerUUID UUID sent from server
 * @returns { boolean } true if saved successfully; otherwise false
 */
export function setPlayerUUID(playerUUID) {
  if (typeof playerUUID !== 'string' || playerUUID.length == 0) return false;

  window.sessionStorage.setItem(LOCAL_PROFILE_UUID_lOCATION, playerUUID);

  return true;
} /* setPlayerUUID */

/**
 * Fetches previously-set player UUID from browser's session storage; UUID will be
 * invalid if fetched after game instance has ended
 * @returns { Types.UUID } last UUID sent from the server to the client
 */
export function getPlayerUUID() {
  return window.sessionStorage.getItem(LOCAL_PROFILE_UUID_lOCATION);
} /* getPlayerUUID */

/**
 * @returns { Types.ClientToServerProfile } object containing locally saved profile data
 */
export function createProfileObject() {
  return {
    username: getUsername(),
    profileImageName: getProfileImageName(),
  };
} /* createSelfProfile */
