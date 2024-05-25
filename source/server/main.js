import { createServer } from 'http';
import { server } from 'websocket';
import { readFileSync } from 'fs';
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
  generateUniqueCards,
  cleanGameState,
} from './util.js';
import { log } from './logging.js';
import { S2C_ACTIONS, C2S_ACTIONS } from './types.js';
import * as Types from './types.js';

const CARD_LIST = JSON.parse(readFileSync('./card_list.json'));

const NUM_ROUNDS = 5;

const PORT = process.env.PORT || 8000;
const OFFERED_PROTOCOL = 'tarot-versus-protocol';

/** @type { Record<number, Types.GameInstance> } */
const gameInstancesByGameCode = {};

/** @type { Record<Types.UUID, Types.GameInstance> } */
const gameInstancesByPlayerUUID = {};

const webSocketServer = new server({
  httpServer: createServer().listen(PORT),
  autoAcceptConnections: false,
});

log('Server online', { severity: 'log' });

/**
 * For a given connection, sends stringified version of object for re-parsing on other side
 * @param { Types.WSConnection } webSocketConnection connection across which to send message
 * @param { Types.ServerToClientMessage } message well-formed message object to send
 */
function sendMessage(webSocketConnection, message) {
  webSocketConnection.sendUTF(JSON.stringify(message));
} /* sendMessage */

/**
 * Start game by sending 'start_game' code to all child connections of game instance
 * hosted by a specific connection
 * @param { Types.WSConnection } webSocketConnection connection member to game instance to start
 */
function handleStartGame(webSocketConnection) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  if (gameInstance.gameState.isStarted) {
    log('Game start rejected: game already started', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  // TODO: validate request is coming from host of the game

  const drawnCardLists = generateUniqueCards(CARD_LIST, NUM_ROUNDS);

  gameInstance.gameState.byRound.push(createNewRound());
  gameInstance.gameState.isStarted = true;

  gameInstance.webSocketConnections.forEach((webSocketConnection) => {
    const drawnCards = drawnCardLists.pop();

    gameInstance.gameState.byPlayer[webSocketConnection.profile.uuid] = {
      score: 0,
      remainingCards: drawnCards,
    };

    sendMessage(webSocketConnection, {
      action: S2C_ACTIONS.START_GAME,
      drawnCards,
    });
  });

  log('Game started', { webSocketConnection, gameInstance, severity: 'log' });
} /* handleStartGame */

/**
 * For a given connection, leaves the game instance they are currently member to
 * @param { Types.WSConnection } webSocketConnection connnection that should leave its game instance
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
 * @param { Types.WSConnection } webSocketConnection connection that should join the game instance
 * @param { number } gameCode game code corresponding to game instance to join
 */
function handleJoinInstance(webSocketConnection, gameCode) {
  const curGameInstance =
    gameInstancesByPlayerUUID?.[webSocketConnection?.profile?.uuid];
  const reqGameInstance = gameInstancesByGameCode[gameCode];

  if (curGameInstance.gameState.isStarted) {
    log('Join instance rejected: cannot implicitly leave an in-progress game', {
      webSocketConnection,
      gameInstance: curGameInstance,
      severity: 'error',
    });
    return;
  }

  if (!reqGameInstance) {
    log(`Join instance rejected: invalid game code "${gameCode}"`, {
      webSocketConnection,
      gameInstance: curGameInstance,
      severity: 'warn',
    });
    return;
  }

  if (reqGameInstance.gameState.isStarted) {
    log(`Join instance rejected: game ${gameCode} already started`, {
      webSocketConnection,
      gameInstance: curGameInstance,
      severity: 'warn',
    });
    return;
  }

  if (reqGameInstance.webSocketConnections.includes(webSocketConnection)) {
    log(
      `Join instance rejected: connection to game ${gameCode} already exists`,
      { webSocketConnection, gameInstance: curGameInstance, severity: 'warn' },
    );
    return;
  }

  if (reqGameInstance.webSocketConnections.length >= 2) {
    log(`Join instance rejected: game ${gameCode} already full`, {
      webSocketConnection,
      gameInstance: curGameInstance,
      severity: 'warn',
    });
    return;
  }

  leaveInstance(webSocketConnection);
  gameInstancesByPlayerUUID[webSocketConnection.profile.uuid] = reqGameInstance;
  reqGameInstance.webSocketConnections.push(webSocketConnection);

  log(`Player joined instance successfully`, {
    webSocketConnection,
    gameInstance: reqGameInstance,
    severity: 'log',
  });

  alertUpdateInstance(reqGameInstance);
} /* handleJoinInstance */

/**
 * Accepts a given WebSocket connection request, and annotates it with a UUID and empty profile
 * @param { Types.WSRequest } webSocketRequest inbound WebSocket request object
 * @returns { Types.WSConnection } newly created WebSocket connection
 */
function acceptRequest(webSocketRequest) {
  const webSocketConnection = webSocketRequest.accept(
    OFFERED_PROTOCOL,
    webSocketRequest.origin,
  );

  webSocketConnection.profile = {
    uuid: randomUUID(),
  };

  sendMessage(webSocketConnection, {
    action: S2C_ACTIONS.UPDATE_UUID,
    playerUUID: webSocketConnection.profile.uuid,
  });

  return webSocketConnection;
} /* acceptRequest */

/**
 * Passes down current game instance meta-data to all child connections, namely the game
 * code and list of all profiles member to the instance
 * @param { Types.GameInstance } gameInstance game instance to target child connections of
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
 * @param { Types.WSConnection } webSocketConnection connection to attach to the game instance
 */
function createInstance(webSocketConnection) {
  const gameInstance = {
    gameCode: generateGameCode(), // TODO: ensure game code is unique
    webSocketConnections: [webSocketConnection],
    gameState: {
      byPlayer: {},
      byRound: [],
      isStarted: false,
    },
  };

  gameInstancesByGameCode[gameInstance.gameCode] = gameInstance;
  gameInstancesByPlayerUUID[webSocketConnection.profile.uuid] = gameInstance;

  alertUpdateInstance(gameInstance);
} /* createInstance */

/**
 * Attaches new profile information to a connection, preserving the initial UUID
 * @param { Types.WSConnection } webSocketConnection connection to attach new profile to
 * @param { Types.ClientToServerProfile } profile well-formed new profile data object
 */
function handleUpdateProfile(webSocketConnection, profile) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  if (
    !areUnorderedArrsEqual(Object.keys(profile), [
      'username',
      'profileImageName',
    ]) ||
    typeof profile.username !== 'string' ||
    typeof profile.profileImageName !== 'string'
  ) {
    log('Invalid profile uploaded', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  webSocketConnection.profile = {
    uuid: webSocketConnection.profile.uuid,
    ...profile,
  };

  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.UPDATE_PROFILE,
      profile: webSocketConnection.profile,
    });
  });
} /* handleUpdateProfile */

/**
 * Ends game instance, deciding and sending winner to each child connection
 * @param { Types.GameInstance } gameInstance game instance to end
 */
function endGame(gameInstance) {
  const gameWinner = gameInstance.webSocketConnections[0].profile;

  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.GAME_END,
      gameWinner,
    });
  });
} /* endGame */

/**
 * Ends game round, deciding and sending winner to each child connection along with
 * the specific card chosen by each opposing player
 * @param { Types.GameInstance } gameInstance targeted game instance
 */
function endRound(gameInstance) {
  const currentRoundState = getCurrentRoundState(gameInstance);

  const [[uuid1, card1], [uuid2, card2]] = Object.entries(
    currentRoundState.selectedCard,
  );
  const roundWinnerUUID =
    getWinningCard(card1, card2) === card1 ? uuid1 : uuid2;
  const roundWinner = gameInstance.webSocketConnections.find(
    (conn) => conn.profile.uuid === roundWinnerUUID,
  ).profile;

  currentRoundState.roundWinner = roundWinnerUUID;
  gameInstance.gameState.byPlayer[roundWinnerUUID].score += 1;

  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.REVEAL_CARDS,
      opponentSelectedCard:
        currentRoundState.selectedCard[
          getOtherPlayer(gameInstance, conn).profile.uuid
        ],
      roundWinner,
    });
  });

  if (gameInstance.gameState.byRound.length === NUM_ROUNDS)
    endGame(gameInstance);
} /* endRound */

/**
 * Handles logic when a client selects a card during a round, including validation,
 * updates to game/round state, and sending of notification to opposing client
 * @param { Types.WSConnection } webSocketConnection connection that selected card
 * @param { Types.Card } selectedCard card selected by client
 */
function handleSelectCard(webSocketConnection, selectedCard) {
  const playerUUID = webSocketConnection.profile.uuid;
  const gameInstance = gameInstancesByPlayerUUID[playerUUID];
  const playerGameState = gameInstance.gameState.byPlayer[playerUUID];

  if (!gameInstance.gameState.isStarted) {
    log('Card selection rejected: game not yet started', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  const currentRoundState = getCurrentRoundState(gameInstance);

  // TODO: more robust handling here; return some error to client on failure

  if (currentRoundState.selectedCard[playerUUID]) {
    log('Card selection rejected: card already selected this round', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  if (!isCardValid(selectedCard)) {
    log('Card selection rejected: invalid card format', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  if (
    !playerGameState.remainingCards.some((card) =>
      areCardsEqual(card, selectedCard),
    )
  ) {
    log('Card selection rejected: card not among remaining options', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  playerGameState.remainingCards = playerGameState.remainingCards.filter(
    (card) => !areCardsEqual(card, selectedCard),
  );
  currentRoundState.selectedCard[playerUUID] = selectedCard;

  if (Object.keys(currentRoundState.selectedCard).length === 2) {
    endRound(gameInstance);
  } else {
    sendMessage(getOtherPlayer(gameInstance, webSocketConnection), {
      action: S2C_ACTIONS.CARD_SELECTED,
    });
  }
} /* handleSelectCard */

/**
 * Handles game-start logic upon signal from host client, including transmission
 * of game-start to each child connection
 * @param { Types.WSConnection } webSocketConnection connection requesting game start
 */
function handleStartRound(webSocketConnection) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  if (!gameInstance?.gameState?.isStarted) {
    log('Round start rejected: game not yet started', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  if (!getCurrentRoundState(gameInstance).roundWinner) {
    log('Round start rejected: current round not complete', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  // TODO: validate request is coming from host

  gameInstance.gameState.byRound.push(createNewRound());

  gameInstance.webSocketConnections.forEach((webSocketConnection) => {
    sendMessage(webSocketConnection, {
      action: S2C_ACTIONS.START_ROUND,
    });
  });
} /* handleStartRound */

/**
 * Validates and relays chat message from client
 * @param { Types.WSConnection } webSocketConnection connection sending chat message
 * @param { string } messageContents text content of message being received
 */
function handleChatMessage(webSocketConnection, messageContents) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  // TODO: validate chat message contents

  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.CHAT_MESSAGE,
      messageContents,
      profile: webSocketConnection.profile,
    });
  });
} /* handleChatMessage */

/**
 * Handles request where a user has a remaining UUID from their own sessionStorage and
 * wants to rejoin the game instance associated to that UUID; authenticates that connection
 * is appropriate and facilitates reconciliation
 * @param { Types.WSConnection } webSocketConnection connection of requester
 * @param { Types.UUID } [playerUUID] unique identifier passed by user
 * @returns { boolean } success status of rejoin attempt (i.e., true iff instance rejoined)
 */
function attemptRejoin(webSocketConnection, playerUUID) {
  if (!playerUUID) return false;

  const reqGameInstance = gameInstancesByPlayerUUID[playerUUID];
  const reqReplacedConnection = reqGameInstance?.webSocketConnections?.find(
    (conn) => conn.profile.uuid === playerUUID,
  );

  if (
    !reqGameInstance ||
    !reqReplacedConnection ||
    reqReplacedConnection.connected
  ) {
    return false;
  }

  webSocketConnection.profile = reqReplacedConnection.profile;
  reqGameInstance.webSocketConnections[
    reqGameInstance.webSocketConnections.indexOf(reqReplacedConnection)
  ] = webSocketConnection;
  sendMessage(webSocketConnection, {
    action: S2C_ACTIONS.UPDATE_UUID,
    playerUUID: playerUUID,
  });

  alertUpdateInstance(reqGameInstance);
  sendMessage(webSocketConnection, {
    action: S2C_ACTIONS.FORCE_REFRESH,
    gameState: cleanGameState(
      webSocketConnection.profile.uuid,
      reqGameInstance.gameState,
    ),
  });
  return true;
} /* attemptRejoin */

/**
 * Attempts to force user back through rejoin logic, and creates a new instance for
 * them if that fails
 * @param { Types.WSConnection } webSocketConnection connection of requester
 * @param { Types.UUID } [playerUUID] unique identifier passed by the user from their sessionStorage
 */
function handleInitialization(webSocketConnection, playerUUID) {
  if (gameInstancesByPlayerUUID?.[playerUUID]?.isStarted) {
    log(
      'Initialization rejected: cannot implicitly leave an in-progress game',
      {
        webSocketConnection,
        gameInstance: gameInstancesByPlayerUUID[playerUUID],
        severity: 'error',
      },
    );
    return;
  }

  const attemptRejoinStatus = attemptRejoin(webSocketConnection, playerUUID);
  if (!attemptRejoinStatus) createInstance(webSocketConnection);
} /* handleInitialization */

/**
 * Handles a new request to the WebSocket server; always tries to accept
 * @param { Types.WSRequest } webSocketRequest inbound WebSocket request object
 */
function handleRequest(webSocketRequest) {
  log(`Request received at "${webSocketRequest.remoteAddress}"`, {
    severity: 'connection',
  });

  const webSocketConnection = acceptRequest(webSocketRequest);

  log(`WebSocket connected at "${webSocketConnection.remoteAddress}"`, {
    severity: 'connection',
  });

  /**
   * Handles message event for a given WebSocket connection
   * @param { { type: 'utf8'|'binary', utf8Data: string } } data message object received
   */
  function handleMessage(data) {
    log(
      `Message received at ${webSocketConnection.remoteAddress}: "${data.utf8Data}"`,
      { severity: 'raw' },
    );

    try {
      const messageObj = JSON.parse(data.utf8Data);

      switch (messageObj.action) {
        case C2S_ACTIONS.INITIALIZE_INSTANCE:
          handleInitialization(webSocketConnection, messageObj.playerUUID);
          break;
        case C2S_ACTIONS.UPDATE_PROFILE:
          handleUpdateProfile(webSocketConnection, messageObj.profile);
          break;
        case C2S_ACTIONS.JOIN_INSTANCE:
          handleJoinInstance(webSocketConnection, messageObj.gameCode);
          break;
        case C2S_ACTIONS.START_GAME:
          handleStartGame(webSocketConnection);
          break;
        case C2S_ACTIONS.SELECT_CARD:
          handleSelectCard(webSocketConnection, messageObj.selectedCard);
          break;
        case C2S_ACTIONS.START_ROUND:
          handleStartRound(webSocketConnection);
          break;
        case C2S_ACTIONS.CHAT_MESSAGE:
          handleChatMessage(webSocketConnection, messageObj.messageContents);
          break;
        default:
          log(`Unrecognized action: ${messageObj.action}`, {
            severity: 'warn',
          });
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
   * @param { number } code numeric code corresponding to close reason
   * @param { string } desc textual description corresponding to close reason
   */
  function handleClose(code, desc) {
    log(
      `WebSocket disconnected at "${webSocketConnection.remoteAddress}" with code "${code}" and desc "${desc}"`,
      { severity: 'connection' },
    );
  } /* handleClose */

  webSocketConnection.on('message', handleMessage);
  webSocketConnection.on('close', handleClose);
} /* handleRequest */

webSocketServer.on('request', handleRequest);
