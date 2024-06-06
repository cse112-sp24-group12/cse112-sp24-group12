/** @module sound */

import {
  getMusicVolumeLevel,
  getSFXVolumeLevel,
  getIsMute,
  UPDATE_VOLUME_LISTENER_NAME,
} from './profile.js';

export const SOUND_EFFECTS = {
  SWISH: './assets/sounds/swish.mp3',
};

const audioContext = new AudioContext();

/**
 *
 * @param { string } soundFilePath
 * @param { 'effect'|'background' } options
 */
async function playSound(soundFilePath, { variant } = {}) {
  const audioBufferSource = audioContext.createBufferSource();
  const audioGainNode = audioContext.createGain();

  audioBufferSource.buffer = await fetch(soundFilePath)
    .then((res) => res.arrayBuffer())
    .then((audioArrayBuffer) => audioContext.decodeAudioData(audioArrayBuffer));

  audioBufferSource.connect(audioGainNode);
  audioGainNode.connect(audioContext.destination);

  audioBufferSource.loop = variant === 'background';
  audioGainNode.gain.setValueAtTime(getVolume(variant), 0);
  audioBufferSource.start(0);

  window.addEventListener(
    'click',
    () => {
      if (audioContext.state === 'suspended') audioContext.resume();
    },
    { once: true },
  );

  window.addEventListener(UPDATE_VOLUME_LISTENER_NAME, () => {
    audioGainNode.gain.setValueAtTime(getVolume(variant), 0);
  });
} /* playSound */

/**
 *
 * @param { 'effect'|'background' } variant
 */
function getVolume(variant) {
  if (getIsMute()) return 0;

  switch (variant) {
    case 'background':
      return getMusicVolumeLevel();
    case 'effect':
      return getSFXVolumeLevel();
    default:
      return 1;
  }
} /* getVolume */

/**
 *
 * @param { string } soundEffectFilePath
 */
export function playSoundEffect(soundEffectFilePath) {
  playSound(soundEffectFilePath, { variant: 'effect' });
} /* playSoundEffect */

/**
 *
 */
export function playBackgroundMusic() {
  playSound('assets/sounds/test.mp3', { variant: 'background' });
} /* playBackgroundMusic */
