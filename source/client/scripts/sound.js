/** @module sound */

import {
  getMusicVolumeLevel,
  getSFXVolumeLevel,
  getIsMute,
  UPDATE_VOLUME_LISTENER_NAME,
} from './profile.js';

/**
 * @typedef {{
 *  filePath: string,
 *  volumeFactor: number
 * }} SoundEffect
 */

/** @type { Record<string, SoundEffect>} */
export const SOUND_EFFECTS = {
  SWISH: {
    filePath: './assets/sounds/swish.mp3',
    volumeFactor: 1,
  },
  ROUND_LOSE: {
    filePath: './assets/sounds/round_lose.mp3',
    volumeFactor: 1,
  },
  ROUND_WIN: {
    filePath: './assets/sounds/round_win.mp3',
    volumeFactor: 1,
  },
  GAME_LOSE: {
    filePath: './assets/sounds/game_lose.mp3',
    volumeFactor: 1,
  },
  GAME_WIN: {
    filePath: './assets/sounds/game_win.mp3',
    volumeFactor: 1,
  },
};

/** @type { SoundEffect } */
const BACKGROUND_SOUND = {
  filePath: 'assets/sounds/background.mp3',
  volumeFactor: 0.33,
};

const audioContext = new AudioContext();

/**
 *
 * @param { SoundEffect } soundEffect
 * @param { 'effect'|'background' } options
 */
async function playSound(soundEffect, { variant } = {}) {
  const audioBufferSource = audioContext.createBufferSource();
  const audioGainNode = audioContext.createGain();

  audioBufferSource.buffer = await fetch(soundEffect.filePath)
    .then((res) => res.arrayBuffer())
    .then((audioArrayBuffer) => audioContext.decodeAudioData(audioArrayBuffer));

  audioBufferSource.connect(audioGainNode);
  audioGainNode.connect(audioContext.destination);

  audioBufferSource.loop = variant === 'background';
  audioGainNode.gain.setValueAtTime(
    getVolume(variant, soundEffect.volumeFactor),
    0,
  );
  audioBufferSource.start();

  window.addEventListener(
    'click',
    () => {
      if (audioContext.state === 'suspended') audioContext.resume();
    },
    { once: true },
  );

  const updateVolume = () => {
    audioGainNode.gain.setValueAtTime(
      getVolume(variant, soundEffect.volumeFactor),
      0,
    );
  };

  window.addEventListener(UPDATE_VOLUME_LISTENER_NAME, updateVolume);
  window.addEventListener('storage', updateVolume);
} /* playSound */

/**
 *
 * @param { 'effect'|'background' } variant
 * @param { number } volumeFactor
 * @returns { number }
 */
function getVolume(variant, volumeFactor) {
  if (getIsMute()) return 0;

  switch (variant) {
    case 'background':
      return getMusicVolumeLevel() * volumeFactor;
    case 'effect':
      return getSFXVolumeLevel() * volumeFactor;
    default:
      return volumeFactor;
  }
} /* getVolume */

/**
 *
 * @param { SoundEffect } soundEffect
 */
export function playSoundEffect(soundEffect) {
  playSound(soundEffect, { variant: 'effect' });
} /* playSoundEffect */

/**
 *
 */
export function playBackgroundMusic() {
  playSound(BACKGROUND_SOUND, { variant: 'background' });
} /* playBackgroundMusic */
