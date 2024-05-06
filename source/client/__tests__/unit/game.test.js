/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

const EXAMPLE_TAROT_CARD = { name: 'TEST_NAME', suite: 'TEST_SUITE' };

/**
 * Initialize mock list of tarot cards
 */
jest.unstable_mockModule('../../scripts/tarot.js', () => ({
  default: {
    tarot: [EXAMPLE_TAROT_CARD],
  },
}));

const { getUniqueCard, chooseIfCardIsUpsideDown } = await import(
  '../../scripts/game.js'
);

describe('getUniqueCard unit testing', () => {
  it('should return a card from the list', () => {
    expect(getUniqueCard()).toBe(EXAMPLE_TAROT_CARD);
  });
});

describe('chooseIfCardIsUpsideDown unit testing', () => {
  it('should return a boolean value', () => {
    expect(typeof chooseIfCardIsUpsideDown()).toBe('boolean');
  });
});
