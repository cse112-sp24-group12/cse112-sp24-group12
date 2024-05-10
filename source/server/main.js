import { createServer } from 'http';
import { server } from 'websocket';
import { randomUUID } from 'crypto';
import {
  generateGameCode,
  areUnorderedArrsEqual,
  isCardValid,
  areCardsEqual,
  getOtherPlayer,
  getCurrentRoundState,
  getWinningCard,
  createNewRound,
} from './util.js';
import { S2C_ACTIONS, C2S_ACTIONS } from './types.js';

const PORT = process.env.PORT || 8000;
const OFFERED_PROTOCOL = 'tarot-versus-protocol';

/** @type { { [gameCode: number]: GameInstance } } */
const gameInstancesByGameCode = {};

/** @type { { [playerUuid: string]: GameInstance } } */
const gameInstancesByPlayerUUID = {};

const webSocketServer = new server({
  httpServer: createServer().listen(PORT),
  autoAcceptConnections: false,
});

const DEBUG_TEST_CARD_LIST = [
  {
    suite: 'test',
    number: 5,
  },
  {
    suite: 'test',
    number: 4,
  },
];
const NUM_ROUNDS = 2;

console.log('Server online');

/**
 * For a given connection, sends stringified version of object for re-parsing on other side
 * @param { connection } webSocketConnection
 * @param { ServerToClientMessage } message
 */
function sendMessage(webSocketConnection, message) {
  webSocketConnection.sendUTF(JSON.stringify(message));
} /* sendMessage */

/**
 * Start game by sending 'start_game' code to all child connections.
 * @param { connection } webSocketConnection
 */
function startGame(webSocketConnection) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  if (!gameInstance.webSocketConnections.includes(webSocketConnection)) {
    console.log('Could not start game by instruction of non-member');
    // TODO: validate request is coming from host instead of just a player
    return;
  }

  gameInstance.gameState.byRound.push(createNewRound());

  gameInstance.webSocketConnections.forEach((webSocketConnection) => {
    gameInstance.gameState.byPlayer[webSocketConnection.profile.uuid] = {
      score: 0,
      remainingCards: DEBUG_TEST_CARD_LIST,
    };

    sendMessage(webSocketConnection, {
      action: S2C_ACTIONS.START_GAME,
      drawnCards: DEBUG_TEST_CARD_LIST,
    });
  });

  console.log(`Game ${gameInstance.gameCode} started`);
} /* startGame */

/**
 * For a given connection, leaves the game instance they are currently member to
 * @param { connection } webSocketConnection
 */
function leaveInstance(webSocketConnection) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  gameInstance.webSocketConnections = gameInstance.webSocketConnections.filter(
    (conn) => conn != webSocketConnection,
  );
  delete gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  // TODO: add logic for destruction of past game instances after some condition (e.g., 0 players left + timeout)
} /* leaveInstance */

/**
 * For a given connection, joins the game instance corresponding to the gameCode
 * @param { connection } webSocketConnection
 * @param { number } gameCode
 */
function joinInstance(webSocketConnection, gameCode) {
  const gameInstance = gameInstancesByGameCode[gameCode];

  if (gameInstance.webSocketConnections.includes(webSocketConnection)) {
    console.log(`Game ${gameCode} rejected connection: already exists`);
    return;
  }

  leaveInstance(webSocketConnection);
  gameInstancesByPlayerUUID[webSocketConnection.profile.uuid] = gameInstance;
  gameInstance.webSocketConnections.push(webSocketConnection);

  console.log(`Secondary player joined instance with room code ${gameCode}`);

  alertUpdateInstance(gameInstance);
} /* joinInstance */

/**
 * Accepts a given WebSocket connection request
 * @param { request } webSocketRequest
 * @returns { connection }
 */
function acceptRequest(webSocketRequest) {
  const webSocketConnection = webSocketRequest.accept(
    OFFERED_PROTOCOL,
    webSocketRequest.origin,
  );

  webSocketConnection.profile = {
    uuid: randomUUID(),
  };

  return webSocketConnection;
} /* acceptRequest */

/**
 *
 * @param { GameInstance } gameInstance
 */
function alertUpdateInstance(gameInstance) {
  const gameInstanceProfiles = gameInstance.webSocketConnections.map(
    (webSocketConnection) => webSocketConnection.profile,
  );

  gameInstance.webSocketConnections.forEach((webSocketConnection) => {
    sendMessage(webSocketConnection, {
      action: S2C_ACTIONS.UPDATE_INSTANCE,
      instanceInfo: {
        gameCode: gameInstance.gameCode,
        profileList: gameInstanceProfiles,
      },
    });
  });
} /* alertUpdateInstance */

/**
 * Creates a new game instance and links it to given player
 * @param { connection } webSocketConnection
 */
function createInstance(webSocketConnection) {
  const gameInstance = {
    gameCode: generateGameCode(), // TODO: ensure game code is unique
    webSocketConnections: [webSocketConnection],
    gameState: {
      byPlayer: {},
      byRound: [],
    },
  };

  gameInstancesByGameCode[gameInstance.gameCode] = gameInstance;
  gameInstancesByPlayerUUID[webSocketConnection.profile.uuid] = gameInstance;

  alertUpdateInstance(gameInstance);
} /* createInstance */

/**
 *
 * @param webSocketConnection
 * @param profile
 */
function updateProfile(webSocketConnection, profile) {
  if (
    !areUnorderedArrsEqual(Object.keys(profile), [
      'username',
      'profileImageName',
    ]) ||
    typeof profile.username !== 'string' ||
    typeof profile.profileImageName !== 'string'
  ) {
    console.log('Invalid profile uploaded');
    return;
  }

  webSocketConnection.profile = {
    uuid: webSocketConnection.profile.uuid,
    ...profile,
  };
} /* updateProfile */

/**
 *
 * @param { connection } webSocketConnection
 */
function alertCardSelected(webSocketConnection) {
  sendMessage(webSocketConnection, {
    action: S2C_ACTIONS.CARD_SELECTED,
  });
} /* alertCardSelected */

/**
 * 
 * @param { GameInstance } gameInstance 
 */
function handleGameEnd(gameInstance) {
  const gameWinner = gameInstance.webSocketConnections[0].profile;

  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.GAME_END,
      gameWinner,
    });
  });
} /* handleGameEnd */

/**
 *
 * @param { GameInstance } gameInstance
 */
function handleRoundEnd(gameInstance) {
  const currentRoundState = getCurrentRoundState(gameInstance);

  const [[uuid1, card1], [uuid2, card2]] = Object.entries(
    currentRoundState.selectedCard,
  );
  const roundWinnerUUID =
    getWinningCard(card1, card2) === card1 ? uuid1 : uuid2;

  const roundWinner = gameInstance.webSocketConnections.find(
    (conn) => conn.profile.uuid === roundWinnerUUID,
  ).profile;

  gameInstance.webSocketConnections.forEach((conn) => {
    const opponentSelectedCard =
      currentRoundState.selectedCard[
        getOtherPlayer(gameInstance, conn).profile.uuid
      ];

    sendMessage(conn, {
      action: S2C_ACTIONS.REVEAL_CARDS,
      opponentSelectedCard,
      roundWinner,
    });
  });

  if (gameInstance.gameState.byRound.length === NUM_ROUNDS) {
    handleGameEnd(gameInstance);
  } else {
    gameInstance.gameState.byRound.push(createNewRound());
  }
} /* handleRoundEnd */

/**
 *
 * @param { connection } webSocketConnection
 * @param { Card } selectedCard
 */
function selectCard(webSocketConnection, selectedCard) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];
  const playerGameState =
    gameInstance.gameState.byPlayer[webSocketConnection.profile.uuid];
  const currentRoundState = getCurrentRoundState(gameInstance);

  // TODO: more robust handling here; return some error to client on failure

  if (!isCardValid(selectedCard)) {
    console.log('Invalid card format');
    return;
  }

  if (
    !playerGameState.remainingCards.some((card) =>
      areCardsEqual(card, selectedCard),
    )
  ) {
    console.log('Card already played');
    return;
  }

  playerGameState.remainingCards = playerGameState.remainingCards.filter(
    (card) => !areCardsEqual(card, selectedCard),
  );
  currentRoundState.selectedCard[webSocketConnection.profile.uuid] =
    selectedCard;

  if (Object.keys(currentRoundState.selectedCard).length === 2) {
    handleRoundEnd(gameInstance);
  } else {
    alertCardSelected(getOtherPlayer(gameInstance, webSocketConnection));
  }
} /* selectCard */

/**
 * Handles a new request to the WebSocket server; always tries to accept
 * @param { request } webSocketRequest
 */
function handleRequest(webSocketRequest) {
  console.log(`Request received at "${webSocketRequest.remoteAddress}"`);

  const webSocketConnection = acceptRequest(webSocketRequest);

  console.log(`WebSocket connected at "${webSocketConnection.remoteAddress}"`);

  /**
   * Handles message event for a given WebSocket connection
   * @param { { type: 'utf8'|'binary', utf8Data: string, binaryData: binaryDataBuffer} } data
   */
  function handleMessage(data) {
    console.log(
      `Message received at "${webSocketConnection.remoteAddress}": "${data.utf8Data}"`,
    );

    try {
      const messageObj = JSON.parse(data.utf8Data);

      switch (messageObj.action) {
        case C2S_ACTIONS.CREATE_PROFILE:
          updateProfile(webSocketConnection, messageObj.profile);
          createInstance(webSocketConnection);
          break;
        case C2S_ACTIONS.JOIN_INSTANCE:
          joinInstance(webSocketConnection, messageObj.gameCode);
          break;
        case C2S_ACTIONS.START_GAME:
          startGame(webSocketConnection);
          break;
        case C2S_ACTIONS.SELECT_CARD:
          selectCard(webSocketConnection, messageObj.selectedCard);
          break;
        default:
      }
    } catch (e) {
      console.log(
        `Error handling message at "${webSocketConnection.remoteAddress}"`,
        e,
      );
    }
  } /* handleMessage */

  /**
   * Handles close event for a given WebSocket connection
   * @param { number } code
   * @param { string } desc
   */
  function handleClose(code, desc) {
    console.log(
      `WebSocket disconnected at "${webSocketConnection.remoteAddress}" with code "${code}" and desc "${desc}"`,
    );
  } /* handleClose */

  webSocketConnection.on('message', handleMessage);
  webSocketConnection.on('close', handleClose);
} /* handleRequest */

webSocketServer.on('request', handleRequest);
