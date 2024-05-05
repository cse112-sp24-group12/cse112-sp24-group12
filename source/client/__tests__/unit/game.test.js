import { getTarotCardName, getBarWidth } from '../../scripts/game.js';
import tarotConfig from '../../scripts/tarot.js';

/**
 * Initialize mock tarot object
 */
jest.mock('../../scripts/tarot.js', () => ({
  tarot: [{ name: 'bob', suite: 'major' }],
}));

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
