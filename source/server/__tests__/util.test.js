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