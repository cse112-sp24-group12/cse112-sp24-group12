/**
 * @jest-environment node
 */
import { createServer } from 'http';
import { server } from 'websocket';
import { handleRequest } from '../../../main.js';
import { getWinningCard } from '../../../util.js';
import puppeteer from 'puppeteer';
import { join } from 'path';

// eslint-disable-next-line no-undef
const VERSUS_PAGE_PATH = `${join(import.meta.url, '../../../../../client/versus.html')}`;

// eslint-disable-next-line no-undef
const HOME_PAGE_PATH = `${join(import.meta.url, '../../../../../client/index.html')}`;

const PORT = 3000;

const webSocketServer = new server({
  httpServer: createServer().listen(PORT),
  autoAcceptConnections: false,
});

let browser1;
let page1;
let browser2;
let page2;

/**
 * Automates initialization of browser and navigation to versus page, to be run before each test
 */
async function clientInitialization() {
  // Client init
  browser1 = await puppeteer.launch({
    args: ['--allow-file-access-from-files'],
    headless: 'false',
  });
  page1 = await browser1.newPage();
  await page1.goto(VERSUS_PAGE_PATH, { waitUntil: 'networkidle2' });

  browser2 = await puppeteer.launch({
    args: ['--allow-file-access-from-files'],
    headless: false,
  });
  page2 = await browser2.newPage();
  await page2.goto(VERSUS_PAGE_PATH, { waitUntil: 'networkidle2' });

  // Game start
  const selfGameCode = await page1.$('#self_game_code');
  const joinGameButton = await page2.$('#join_game_button');
  const startGameButton = await page1.$('#start_game_button');
  const gameCode = await selfGameCode.evaluate((i) => i.value);
  await page2.keyboard.type(gameCode);
  await joinGameButton.evaluate((b) => b.click());
  await startGameButton.evaluate((b) => b.click());
}

describe('E2E chat interaction testing', () => {
  beforeAll(() => {
    webSocketServer.on('request', handleRequest);
  });

  afterAll(() => {
    webSocketServer.closeAllConnections();
  });

  beforeEach(clientInitialization, 10000);

  it('Should show message from player 1 to player 2', async () => {
    const chatButton = await page1.$('#chat_input_button');
    const chatFeed = await page2.$('#chat_feed');
    const testMessage = 'test message';
    await page1.focus('#chat_input');
    await page1.keyboard.type(testMessage);
    await chatButton.evaluate((b) => b.click());
    await new Promise((r) => setTimeout(r, 500));
    const receivedMessage = await chatFeed.evaluate(
      (i) => i.lastChild.lastChild.innerText,
    );
    expect(receivedMessage).toBe(testMessage);
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should send disconnect message to player 2 on player 1 disconnect', async () => {
    const chatFeed = await page2.$('#chat_feed');
    const disconnectMessage = 'User disconnected';
    await page1.close();
    await new Promise((r) => setTimeout(r, 500));
    const receivedMessage = await chatFeed.evaluate(
      (i) => i.lastChild.lastChild.innerText,
    );
    expect(receivedMessage).toBe(disconnectMessage);
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should send reconnect message to player 2 on player 1 reconnect', async () => {
    const chatFeed = await page2.$('#chat_feed');
    const reconnectMessage = 'User reconnected';
    await page1.goto(HOME_PAGE_PATH, { waitUntil: 'networkidle2' });
    await page1.goto(VERSUS_PAGE_PATH, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));
    const receivedMessage = await chatFeed.evaluate(
      (i) => i.lastChild.lastChild.innerText,
    );
    expect(receivedMessage).toBe(reconnectMessage);
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should send leave message to player 2 on player 1 leave', async () => {
    const chatFeed = await page2.$('#chat_feed');
    const leaveButton = await page1.$('#leave_game_button');
    const confirmLeaveButton = await page1.$('#confirm_leave_button');
    const leaveMessage = 'User left';
    await leaveButton.evaluate((b) => b.click());
    await confirmLeaveButton.evaluate((b) => b.click());
    await new Promise((r) => setTimeout(r, 500));
    const receivedMessage = await chatFeed.evaluate(
      (i) => i.lastChild.lastChild.innerText,
    );
    expect(receivedMessage).toBe(leaveMessage);
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should show card face down to player 2 when player 1 plays card', async () => {
    const userCards = await page1.$('#user_cards');
    const oppPlayedCard = await page2.$('#opp_played_card');
    const expectedVariant = 'back';
    await new Promise((r) => setTimeout(r, 2000));
    await userCards.evaluate((e) => e.firstChild.click());
    await new Promise((r) => setTimeout(r, 500));
    const cardVariant = await oppPlayedCard.evaluate((e) =>
      e.firstChild.getAttribute('variant'),
    );
    expect(cardVariant).toBe(expectedVariant);
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should reveal opponent card when both players play cards', async () => {
    const userCards1 = await page1.$('#user_cards');
    const userCards2 = await page2.$('#user_cards');
    const oppPlayedCard = await page2.$('#opp_played_card');
    const expectedVariant = 'front';
    await new Promise((r) => setTimeout(r, 2000));
    await userCards1.evaluate((e) => e.firstChild.click());
    await userCards2.evaluate((e) => e.firstChild.click());
    await new Promise((r) => setTimeout(r, 1000));
    const cardVariant = await oppPlayedCard.evaluate((e) =>
      e.firstChild.getAttribute('variant'),
    );
    expect(cardVariant).toBe(expectedVariant);
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should show the appropriate round winner when both players play cards', async () => {
    const userCards1 = await page1.$('#user_cards');
    const userCards2 = await page2.$('#user_cards');
    const roundWinnerText = await page1.$('#round_end_text');
    await new Promise((r) => setTimeout(r, 2000));
    const card1 = await userCards1.evaluate((e) => {
      return {
        suite: e.firstChild.getAttribute('suite'),
        number: e.firstChild.getAttribute('number'),
      };
    });
    const card2 = await userCards2.evaluate((e) => {
      return {
        suite: e.firstChild.getAttribute('suite'),
        number: e.firstChild.getAttribute('number'),
      };
    });
    await userCards1.evaluate((e) => e.firstChild.click());
    await userCards2.evaluate((e) => e.firstChild.click());
    await new Promise((r) => setTimeout(r, 2500));
    if (getWinningCard(card1, card2, 'none') == card1) {
      const winText = await roundWinnerText.evaluate((e) => e.innerText);
      expect(winText).toBe('YOU WON!');
    } else {
      const loseText = await roundWinnerText.evaluate((e) => e.innerText);
      expect(loseText).toBe('YOU LOST!');
    }
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should start next round when both players play cards', async () => {
    const userCards1 = await page1.$('#user_cards');
    const userCards2 = await page2.$('#user_cards');
    const roundNumberText = await page1.$('#round_number');
    await new Promise((r) => setTimeout(r, 2000));
    await userCards1.evaluate((e) => e.firstChild.click());
    await userCards2.evaluate((e) => e.firstChild.click());
    await new Promise((r) => setTimeout(r, 4000));
    const roundNumber = await roundNumberText.evaluate((e) => e.innerText);
    expect(roundNumber).toBe('2');
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 10000);

  it('Should show the appropriate game winner and end game when both players play all cards', async () => {
    const userCards1 = await page1.$('#user_cards');
    const userCards2 = await page2.$('#user_cards');
    const gameEndDialog = await page1.$('#instance_closed_modal');
    let wins1 = 0;
    let wins2 = 0;
    await new Promise((r) => setTimeout(r, 2000));
    for (let i = 0; i < 5; i++) {
      const currentWorldEventMeta = await page1.$('#current_world_event');
      const currentWorldEvent = await currentWorldEventMeta.evaluate((e) =>
        e.getAttribute('content'),
      );
      if (i == 1 || i == 3) {
        const worldEventButton1 = await page1.$('#world_event_button');
        const worldEventButton2 = await page2.$('#world_event_button');
        await worldEventButton1.evaluate((e) => e.click());
        await worldEventButton2.evaluate((e) => e.click());
      }
      const card1 = await userCards1.evaluate((e) => {
        return {
          suite: e.firstChild.getAttribute('suite'),
          number: e.firstChild.getAttribute('number'),
        };
      });
      const card2 = await userCards2.evaluate((e) => {
        return {
          suite: e.firstChild.getAttribute('suite'),
          number: e.firstChild.getAttribute('number'),
        };
      });
      await userCards1.evaluate((e) => e.firstChild.click());
      await userCards2.evaluate((e) => e.firstChild.click());
      if (getWinningCard(card1, card2, currentWorldEvent) == card1) {
        wins1 += 1;
      } else {
        wins2 += 1;
      }
      await new Promise((r) => setTimeout(r, 6000));
    }
    await new Promise((r) => setTimeout(r, 36000));
    const dialogOpen = await gameEndDialog.evaluate((e) => e.open);
    expect(dialogOpen).toBe(true);
    await page1.close();
    await browser1.close();
    await page2.close();
    await browser2.close();
  }, 120000);
});
