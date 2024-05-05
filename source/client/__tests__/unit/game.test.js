/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { getTarotCardName, getBarWidth } from '../../scripts/game.js';

/**
 * Initialize mock tarot object
 */
jest.unstable_mockModule('../../scripts/tarot.js', () => ({
  tarot: [{ name: 'bob', suite: 'major' }],
}));
const tarotConfig = await import('../../scripts/tarot.js');

/**
 * Test to see if getTarotCardName return the correct values
 */
describe('test suite for function getTarotCardName', () => {
  test('check number of names is as expected', () => {
    expect(getTarotCardName(tarotConfig).length).toEqual(1);
  });
  test('check content of names is as expected', () => {
    expect(getTarotCardName(tarotConfig)).toEqual(['bob']);
  });
});

/**
 * Test to see if getBarWidth is consistent
 */
describe('test suite for function getBarWidth', () => {
  const oscillatingBarFill = {
    getBoundingClientRect: jest.fn(() => ({ width: 100 })),
  };

  const oscillatingBar = {
    getBoundingClientRect: jest.fn(() => ({ width: 400 })),
  };

  it('should calculate the correct bar width', () => {
    const result = getBarWidth(oscillatingBarFill, oscillatingBar);
    // Expected calculation ((25*100) / 400) = 6.25 floored to 6
    expect(result).toBe(3);
  });
});
