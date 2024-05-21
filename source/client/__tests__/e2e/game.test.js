/**
 * @jest-environment node
 */
import puppeteer from 'puppeteer';
import { join } from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-undef
const GAME_PAGE_PATH = `${join(import.meta.url, '../../../game.html')}`;
// eslint-disable-next-line no-undef
const RESULTS_PAGE_PATH = `${join(import.meta.url, '../../../results.html')}`;

let browser;
let page;

/**
 * Automates initialization of browser and navigation to game page, to be run before each test
 */
async function defaultInitialization() {
  browser = await puppeteer.launch({
    args: ['--allow-file-access-from-files'],
    headless: 'true',
  });
  page = await browser.newPage();
  await page.goto(GAME_PAGE_PATH, { waitUntil: 'networkidle2' });
}

/**
 *
 */
async function defaultTeardown() {
  await page.close();
  await browser.close();
}

/**
 * E2E testing of user interactions
 */
describe('E2E button/link testing', () => {
  beforeEach(defaultInitialization);
  afterEach(defaultTeardown);

  it('Make sure clicking how to play button goes to href', async () => {
    const tutorialButton = await page.$('#how-to-play-btn');
    await tutorialButton.evaluate((b) => b.click());
    const hash = await page.evaluate(() => document.location.hash);
    expect(hash).toEqual('#popup-box');
  }, 5000);

  it('Check clicking one div btn outputs status', async () => {
    const card = await page.$('#card-1');
    await card.click();
    const status = await page.$eval('#card-container-1', (el) =>
      el.classList.contains('flipped'),
    );
    expect(status).toBe(true);
  }, 5000);

  it('Check that after clicking 4 cards, cannot click another', async () => {
    const card = await page.$$('.tarot-card');
    //click 4 cards
    for (let i = 0; i < 4; i++) {
      await card[i].click();
    }
    //click the 5th card, should remain unclicked
    const fifthCard = await page.$('#card-5');
    await fifthCard.click();
    const status = await page.$eval('#card-container-5', (el) =>
      el.classList.contains('flipped'),
    );
    expect(status).toBe(false);
  }, 5000);

  it('After clicking a card, check text content of message displayed to user', async () => {
    const card = await page.$('#card-1');
    await card.click();
    const textContent = await page.$eval('.oracle .message', (el) => {
      return el.innerText;
    });
    expect(textContent).toBeDefined();
  }, 5000);
});

describe('Testing local storage contents is as expected', () => {
  beforeEach(defaultInitialization);
  afterEach(defaultTeardown);

  it('Check local storage contents for luck being transfered to results page', async () => {
    const card = await page.$$('.tarot-card');
    //click 4 cards
    for (let i = 0; i < 4; i++) {
      await card[i].click();
    }
    await page.waitForNavigation();
    const localStorage = await page.evaluate(() =>
      localStorage.getItem('luck'),
    );
    expect(typeof parseInt(localStorage) === 'number').toBe(true);
  }, 10000);

  it('Check local storage contents of chosen cards being transfered to results page', async () => {
    const card = await page.$$('.tarot-card');
    //click 4 cards
    for (let i = 0; i < 4; i++) {
      await card[i].click();
    }
    await page.waitForNavigation();
    const localStorage = await page.evaluate(() =>
      localStorage.getItem('chosenCards'),
    );
    expect(typeof JSON.parse(localStorage) === 'object').toBe(true);
  }, 10000);

  it('Check window location after clicking 4 cards is as expected', async () => {
    const card = await page.$$('.tarot-card');
    //click 4 cards
    for (let i = 0; i < 4; i++) {
      await card[i].click();
    }
    await page.waitForNavigation();
    const url = await page.evaluate(() => document.location.href);
    expect(fileURLToPath(url)).toEqual(fileURLToPath(RESULTS_PAGE_PATH));
  }, 10000);
});
