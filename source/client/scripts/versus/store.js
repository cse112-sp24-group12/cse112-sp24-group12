/** @module store */

import { UPDATE_USERNAME_LISTENER_NAME } from './types.js';
import * as Types from './types.js';

/** @type { Types.GameState } */
const gameState = {};

/** @type { Types.ServerToClientProfile } */
const userProfileByUUID = {};

/**
 * Updates profile to store by UUID and emits appropriate event listener
 * for downstream users
 * @param { Types.ServerToClientProfile } profile
 */
export function updateProfile(profile) {
  userProfileByUUID[profile.uuid] = profile;
  window.dispatchEvent(new Event(UPDATE_USERNAME_LISTENER_NAME));
} /* updateProfile */

/**
 *
 * @param { Types.UUID } playerUUID
 * @returns { Types.ServerToClientProfile }
 */
export function getProfile(playerUUID) {
  return userProfileByUUID[playerUUID];
} /* getProfile */
