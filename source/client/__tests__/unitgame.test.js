/**
 * @jest-environment jsdom
 */
const game = require("../game");
const fs = require("fs");
window.document.body.innerHTML = fs.readFileSync("source/game.html");
// require("../game");

/**
 * Initialize mock tarot object
 */
jest.mock("../../tarot.js", () => ({
  tarot: [{ name: "bob", suite: "major" }],
}));
const tarotConfig = require("../../tarot.js");

/**
 * Test to see if getTarotCardName return the correct values
 */
describe("test suite for function getTarotCardName", () => {
  test("check number of names is as expected", () => {
    expect(game.getTarotCardName(tarotConfig).length).toEqual(1);
  });
  test("check content of names is as expected", () => {
    expect(game.getTarotCardName(tarotConfig)).toEqual(["bob"]);
  });
});

/**
 * Test to see if getBarWidth is consistent
 */
describe("test suite for function getBarWidth", () => {
  const oscillatingBarFill = {
    getBoundingClientRect: jest.fn(() => ({ width: 100 })),
  };

  const oscillatingBar = {
    getBoundingClientRect: jest.fn(() => ({ width: 400 })),
  };

  // Test case
  it("should calculate the correct bar width", () => {
    // Call the function
    const result = game.getBarWidth(oscillatingBarFill, oscillatingBar);
    //expected calculation ((25*100) / 400) = 6.25 floored to 6
    expect(result).toBe(3);
  });
});
