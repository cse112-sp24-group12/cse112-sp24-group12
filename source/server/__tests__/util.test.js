/**
 * @jest-environment node
 */

import { generateGameCode } from '../util.js';

describe('generateGameCode unit testing', () => {
  it('should generate a random integer in the range [1000, 9999]', () => {
    const generatedValue = generateGameCode();

    expect(generatedValue).toBeLessThan(10000);
    expect(generatedValue).toBeGreaterThan(999);
    expect(generatedValue.toString()).toHaveLength(4);
  });
});

// describe('getGameWinnerProfile unit testing', () => {
//   it('should return the profile of the player with the highest score', () => {
//     const oneUUID = 'test-one-uuid';
//     const twoUUID = 'test-two-uuid';

//     /** @type { Types.ServerToClientProfile } */
//     const oneProfile = {
//       uuid: oneUUID,
//       username: 'OneUsername',
//       profileImageName: 'default',
//     };

//     /** @type { Types.ServerToClientProfile } */
//     const twoProfile = {
//       uuid: twoUUID,
//       username: 'TwoUsername',
//       profileImageName: 'dragon',
//     };

//     /** @type { Types.GameState } */
//     const gameState = {
//       byPlayer: {
//         [oneUUID]: {
//           score: 5,
//           remainingCards: [{}, {}],
//         },
//         [twoUUID]: {
//           score: 10,
//           remainingCards: [{}, {}],
//         },
//       },
//       byRound: {},
//       isStarted: true,
//     };

//     /** @type { Types.GameInstance } */
//     const gameInstance = {
//       gameCode: 1234,
//       webSocketConnections: [
//         {
//           profile: oneProfile,
//         },
//         {
//           profile: twoProfile,
//         },
//       ],
//       gameState,
//     };

//     expect(getGameWinnerProfile(gameInstance)).toBe(twoProfile);

//     gameState.byPlayer[oneUUID].score = 15;

//     expect(getGameWinnerProfile(gameInstance)).toBe(oneProfile);
//   });
// });