/**
 * @jest-environment node
 */

import { generateUniqueGameCode, calculateGameWinnerProfile, areUnorderedArrsEqual, isCardValid, areCardsEqual, generateUniqueCards } from '../util.js';
import * as Types from '../types.js';

describe('generateUniqueGameCode unit testing', () => {
  it('should generate a random integer in the range [1000, 9999]', () => {
    const generatedValue = generateUniqueGameCode([5]);

    expect(generatedValue).toBeLessThan(10000);
    expect(generatedValue).toBeGreaterThan(999);
    expect(generatedValue.toString()).toHaveLength(4);
  });

  it('should avoid generating a number currently in the list', () => {
    const currentGameCodes = Array.from({ length: (9000)}).map((_, i) => i + 1000);
    currentGameCodes.splice(5000, 1);

    const generatedValue = generateUniqueGameCode(currentGameCodes);

    expect(generatedValue).toBe(6000);
  });
});

describe('areUnorderedArrsEqual unit testing', () => {
  it('should return true for arrays that contain the same elements', () => {
    expect(areUnorderedArrsEqual(['a', 'b', 'c'], ['b', 'c', 'a'])).toBe(true);
  });

  it('should return false for arrays that do not contain the same elements', () => {
    expect(areUnorderedArrsEqual(['a', 'b', 'c'], ['b', 'd', 'a'])).toBe(false);
  });
});

describe('isCardValid unit testing', () => {
  it('should return true for valid card objects', () => {
    expect(isCardValid({
      number: 5,
      suite: 'test_suite',
    })).toBe(true);
  });

  it('should return false for objects missing a field', () => {
    expect(isCardValid({ number: 5})).toBe(false);
    expect(isCardValid({ suite: 'test'})).toBe(false);
  });

  it('should return false for objects with an extra field', () => {
    expect(isCardValid({
      number: 5,
      suite: 'test_suite',
      extraField: 'test',
    })).toBe(false);
  });

  it('should return false for object with incorrect field types', () => {
    expect(isCardValid({
      number: '5',
      suite: 'test_suite',
    })).toBe(false);

    expect(isCardValid({
      number: 5,
      suite: 6,
    })).toBe(false);

    expect(isCardValid({
      number: '5',
      suite: 6,
    })).toBe(false);
  });
});

describe('areCardsEqual unit testing', () => {
  it('should return true for cards that have the same fields', () => {
    expect(areCardsEqual({
      number: 5,
      suite: 'test_suite',
    }, {
      number: 5,
      suite: 'test_suite',
    })).toBe(true);
  });

  it('should return false for cards that have differing fields', () => {
    expect(areCardsEqual({
      number: 5,
      suite: 'test_suite',
    }, {
      number: 6,
      suite: 'test_suite',
    })).toBe(false);

    expect(areCardsEqual({
      number: 5,
      suite: 'test_suite',
    }, {
      number: 5,
      suite: 'other_suite',
    })).toBe(false);

    expect(areCardsEqual({
      number: 6,
      suite: 'test_suite',
    }, {
      number: 5,
      suite: 'test_suite',
    })).toBe(false);
  });
});

describe('calculateGameWinnerProfile unit testing', () => {
  it('should return the profile of the player with the highest score', () => {
    const oneUUID = 'test-one-uuid';
    const twoUUID = 'test-two-uuid';

    /** @type { Types.ServerToClientProfile } */
    const oneProfile = {
      uuid: oneUUID,
      username: 'OneUsername',
      profileImageName: 'default',
    };

    /** @type { Types.ServerToClientProfile } */
    const twoProfile = {
      uuid: twoUUID,
      username: 'TwoUsername',
      profileImageName: 'dragon',
    };

    /** @type { Types.GameState } */
    const gameState = {
      byPlayer: {
        [oneUUID]: {
          score: 5,
          remainingCards: [{}, {}],
        },
        [twoUUID]: {
          score: 10,
          remainingCards: [{}, {}],
        },
      },
      byRound: [],
      isStarted: true,
      gameWinner: null,
    };

    /** @type { Types.GameInstance } */
    const gameInstance = {
      gameCode: 1234,
      webSocketConnections: [
        {
          profile: oneProfile,
        },
        {
          profile: twoProfile,
        },
      ],
      gameState,
    };

    expect(calculateGameWinnerProfile(gameInstance)).toBe(twoProfile);

    gameState.byPlayer[oneUUID].score = 15;

    expect(calculateGameWinnerProfile(gameInstance)).toBe(oneProfile);
  });
});

describe('generateUniqueCards unit testing', () => {
  const CARD_LIST = Array.from({ length: 30 }).map((_, i) => ({
    number: i,
    suite: 'test_suite',
  }));

  const N = 6;

  it('should return two lists of size n', () => {
    const uniqueCardLists = generateUniqueCards(CARD_LIST, N);

    expect(Array.isArray(uniqueCardLists)).toBe(true);
    expect(uniqueCardLists).toHaveLength(2);
    expect(Array.isArray(uniqueCardLists[0])).toBe(true);
    expect(uniqueCardLists[0]).toHaveLength(N);
    expect(Array.isArray(uniqueCardLists[1])).toBe(true);
    expect(uniqueCardLists[1]).toHaveLength(N);
  });

  it('should return two lists with unique elements', () => {
    const [listOne, listTwo] = generateUniqueCards(CARD_LIST, N);

    expect(listOne.filter((card) => listTwo.includes(card))).toHaveLength(0);
  });
});