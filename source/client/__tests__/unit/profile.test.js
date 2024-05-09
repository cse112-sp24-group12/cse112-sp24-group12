/**
 * @jest-environment jsdom
 */

import {
  setUsername,
  getUsername,
  setProfileImage,
  getProfileImageUrl,
  LOCAL_PROFILE_IMAGE_CUSTOM_FLAG,
  setIsMute,
  getIsMute,
  setVolumeLevel,
  getVolumeLevel,
  getProfileImageNameOptions,
} from '../../scripts/profile.js';

const VALID_USERNAME = 'Test_Username';
const VALID_USERNAME_TWO = 'Another_123';
const INVALID_USERNAME = '';
describe('setUsername and getUsername unit testing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return the exact username if it is valid when getting and setting', () => {
    setUsername(VALID_USERNAME);
    expect(getUsername()).toBe(VALID_USERNAME);
    expect(getUsername()).toBe(VALID_USERNAME);
    setUsername(VALID_USERNAME_TWO);
    expect(getUsername()).toBe(VALID_USERNAME_TWO);
    expect(getUsername()).toBe(VALID_USERNAME_TWO);
  });

  it('should return true if the username is valid when setting', () => {
    expect(setUsername(VALID_USERNAME)).toBe(true);
  });

  it('should return false if the username is invalid when setting', () => {
    expect(setUsername(INVALID_USERNAME)).toBe(false);
    expect(setUsername()).toBe(false);
  });

  it('should not assign the username if it is invalid when setting', () => {
    setUsername(INVALID_USERNAME);
    expect(getUsername()).not.toBe(INVALID_USERNAME);
  });

  it('should provide some valid default fallback if a value is not set', () => {
    const defaultUsername = getUsername();
    expect(typeof defaultUsername).toBe('string');
    expect(defaultUsername.length).toBeGreaterThan(0);
  });

  it('should provide some valid default fallback if an invalid value is set', () => {
    setUsername(INVALID_USERNAME);
    const defaultUsername = getUsername();
    expect(typeof defaultUsername).toBe('string');
    expect(defaultUsername.length).toBeGreaterThan(0);
  });
});

const VALID_VOLUME_LEVEL = 0.432;
const VALID_VOLUME_LEVEL_TWO = 0.2;
const INVALID_VOLUME_LEVEL_HIGH = 1.2;
const INVALID_VOLUME_LEVEL_LOW = -0.3;
const INVALID_VOLUME_LEVEL_BAD_TYPE = '0.4';
describe('setVolumeLevel and getVolumeLevel unit testing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return the exact volume level if it is valid when getting and setting', () => {
    setVolumeLevel(VALID_VOLUME_LEVEL);
    expect(getVolumeLevel()).toBe(VALID_VOLUME_LEVEL);
    expect(getVolumeLevel()).toBe(VALID_VOLUME_LEVEL);
    setVolumeLevel(VALID_VOLUME_LEVEL_TWO);
    expect(getVolumeLevel()).toBe(VALID_VOLUME_LEVEL_TWO);
    expect(getVolumeLevel()).toBe(VALID_VOLUME_LEVEL_TWO);
  });

  it('should return true if the volume level is valid when setting', () => {
    expect(setVolumeLevel(VALID_VOLUME_LEVEL)).toBe(true);
  });

  it('should return false if the volume level is too low when setting', () => {
    expect(setVolumeLevel(INVALID_VOLUME_LEVEL_LOW)).toBe(false);
  });

  it('should return false if the volume level is too high when setting', () => {
    expect(setVolumeLevel(INVALID_VOLUME_LEVEL_HIGH)).toBe(false);
  });

  it('should not assign the volume level if it is invalid when setting', () => {
    setVolumeLevel(INVALID_VOLUME_LEVEL_HIGH);
    expect(getVolumeLevel()).not.toBe(INVALID_VOLUME_LEVEL_HIGH);
  });

  it('should provide some valid default fallback if a value is not set', () => {
    const defaultVolumeLevel = getVolumeLevel();
    expect(typeof defaultVolumeLevel).toBe('number');
    expect(defaultVolumeLevel).toBeGreaterThanOrEqual(0);
    expect(defaultVolumeLevel).toBeLessThanOrEqual(1);
  });

  it('should provide some valid default fallback if an invalid value is set', () => {
    setVolumeLevel(INVALID_VOLUME_LEVEL_BAD_TYPE);
    const defaultVolumeLevel = getVolumeLevel();
    expect(typeof defaultVolumeLevel).toBe('number');
    expect(defaultVolumeLevel).toBeGreaterThanOrEqual(0);
    expect(defaultVolumeLevel).toBeLessThanOrEqual(1);
  });
});

describe('setIsMute and getIsMute unit testing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return true/false if muted/unmuted', () => {
    setIsMute(true);
    expect(getIsMute()).toBe(true);
    expect(getIsMute()).toBe(true);
    setIsMute(false);
    expect(getIsMute()).toBe(false);
    expect(getIsMute()).toBe(false);
  });

  it('should return true if parameter is valid when setting', () => {
    expect(setIsMute(false)).toBe(true);
    expect(setIsMute(true)).toBe(true);
  });

  it('should return false if parameter is invalid when setting', () => {
    expect(setIsMute()).toBe(false);
    expect(setIsMute('test')).toBe(false);
    expect(setIsMute(123)).toBe(false);
  });
});

const VALID_PROFILE_IMAGE_NAME = 'dragon';
const VALID_PROFILE_IMAGE_NAME_TWO = 'panda';
const INVALID_PROFILE_IMAGE_NAME = 'iajdfsiofajsdf';
const EXAMPLE_CUSTOM_URL = 'https://example.com';
describe('setProfileImage and getProfileImageUrl unit testing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return the exact profile image name if it is valid when setting and getting', () => {
    setProfileImage(VALID_PROFILE_IMAGE_NAME);
    expect(getProfileImageUrl().toLowerCase()).toContain(
      VALID_PROFILE_IMAGE_NAME,
    );
    expect(getProfileImageUrl().toLowerCase()).toContain(
      VALID_PROFILE_IMAGE_NAME,
    );
    setProfileImage(VALID_PROFILE_IMAGE_NAME_TWO);
    expect(getProfileImageUrl().toLowerCase()).toContain(
      VALID_PROFILE_IMAGE_NAME_TWO,
    );
    expect(getProfileImageUrl().toLowerCase()).toContain(
      VALID_PROFILE_IMAGE_NAME_TWO,
    );
  });

  it('should allow custom image urls', () => {
    setProfileImage(LOCAL_PROFILE_IMAGE_CUSTOM_FLAG, {
      customUrl: EXAMPLE_CUSTOM_URL,
    });
    expect(getProfileImageUrl()).toBe(EXAMPLE_CUSTOM_URL);
    expect(getProfileImageUrl()).toBe(EXAMPLE_CUSTOM_URL);
  });

  it('should return true if name is valid when setting', () => {
    expect(setProfileImage(VALID_PROFILE_IMAGE_NAME)).toBe(true);
    expect(setProfileImage(VALID_PROFILE_IMAGE_NAME_TWO)).toBe(true);
    expect(
      setProfileImage(LOCAL_PROFILE_IMAGE_CUSTOM_FLAG, {
        customUrl: EXAMPLE_CUSTOM_URL,
      }),
    ).toBe(true);
  });

  it('should return false is name is invalid when setting', () => {
    expect(setProfileImage(INVALID_PROFILE_IMAGE_NAME)).toBe(false);
  });

  it('should return false is no custom image url', () => {
    expect(setProfileImage(LOCAL_PROFILE_IMAGE_CUSTOM_FLAG)).toBe(false);
  });

  it('should not assign the profile image name if it is not valid', () => {
    setProfileImage(INVALID_PROFILE_IMAGE_NAME);
    expect(getProfileImageUrl()).not.toBe(INVALID_PROFILE_IMAGE_NAME);
  });

  it('should provide some valid default fallback if a value is not set', () => {
    const defaultProfileImageUrl = getProfileImageUrl();
    expect(typeof defaultProfileImageUrl).toBe('string');
    expect(defaultProfileImageUrl.length).toBeGreaterThan(0);
  });

  it('should provide some valid default fallback if invalid input', () => {
    setProfileImage(INVALID_PROFILE_IMAGE_NAME);
    const defaultProfileImageUrl = getProfileImageUrl();
    expect(typeof defaultProfileImageUrl).toBe('string');
    expect(defaultProfileImageUrl.length).toBeGreaterThan(0);
  });
});

describe('getProfileImageNameOptions unit testing', () => {
  it('should return a nonempty list of strings', () => {
    const profileImageNameOptions = getProfileImageNameOptions();

    expect(profileImageNameOptions.length).toBeGreaterThan(0);

    profileImageNameOptions.forEach((profileImageName) => {
      expect(typeof profileImageName).toBe('string');
      expect(profileImageName.length).toBeGreaterThan(0);
    });
  });

  it('should remain constant across multiple calls', () => {
    const profileImageNameOptions = getProfileImageNameOptions();

    expect(getProfileImageNameOptions()).toEqual(profileImageNameOptions);
  });
});
