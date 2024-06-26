import { createServer } from 'http';
import { server } from 'websocket';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import {
  generateUniqueGameCode,
  areUnorderedArrsEqual,
  isCardValid,
  areCardsEqual,
  getOtherPlayer,
  getCurrentRoundState,
  getRoundWinnerUUID,
  createNewRound,
  generateUniqueCards,
  cleanGameState,
  calculateGameWinnerProfile,
  getNumActivePlayers,
} from './util.js';
import { log, initializeLoggingOverviews } from './logging.js';
import { S2C_ACTIONS, C2S_ACTIONS } from './types.js';
import * as Types from './types.js';

const CARD_LIST = JSON.parse(readFileSync('./card_list.json'));

const PORT = process.env.PORT || 8000;
const OFFERED_PROTOCOL = 'tarot-versus-protocol';

const NUM_ROUNDS = 5;
const GAME_CODE_LO_RANGE = 1_000;
const GAME_CODE_HI_RANGE = 9_999;

/**
 * Time until an instance is deleted after a user disconnects and fails to reconnect
 * (in milliseconds)
 * @type { number }
 */
const DISCONNECTED_TIMEOUT_MS = 180_000; // 3 minutes

/**
 * Time between game end and instance deletion (in milliseconds)
 * @type { number }
 */
const GAME_END_TIMEOUT_MS = 35_000;

/** @type { Record<number, Types.GameInstance> } */
const gameInstancesByGameCode = {};

/** @type { Record<Types.UUID, Types.GameInstance> } */
const gameInstancesByPlayerUUID = {};

const webSocketServer = new server({
  httpServer: createServer().listen(PORT),
  autoAcceptConnections: false,
});

log('Server online', { severity: 'log' });

initializeLoggingOverviews(gameInstancesByGameCode, gameInstancesByPlayerUUID);

/**
 * For a given connection, sends stringified version of object for re-parsing on other side
 * @param { Types.WSConnection } webSocketConnection connection across which to send message
 * @param { Types.ServerToClientMessage } message well-formed message object to send
 */
function sendMessage(webSocketConnection, message) {
  const stringifiedMessage = JSON.stringify(message);

  log(`Outbound message: "${stringifiedMessage}"`, { severity: 'raw' });

  webSocketConnection.sendUTF(stringifiedMessage);
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
    log('Game start request rejected: game already started', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
    return;
  }

  if (gameInstance.webSocketConnections.length !== 2) {
    log('Game start request rejected: requires two online players', {
      webSocketConnection,
      gameInstance,
      severity: 'warn',
    });
    return;
  }

  const drawnCardLists = generateUniqueCards(CARD_LIST, NUM_ROUNDS);
  const newRound = createNewRound(gameInstance);
  gameInstance.gameState.byRound.push(newRound);
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
    sendMessage(webSocketConnection, {
      action: S2C_ACTIONS.WORLD_EVENT,
      worldEvent: newRound.worldEvent,
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
    gameInstancesByPlayerUUID?.[webSocketConnection?.profile?.uuid];

  if (!gameInstance) return;

  gameInstance.webSocketConnections = gameInstance.webSocketConnections.filter(
    (conn) => conn != webSocketConnection,
  );
  delete gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  log('Player left instance', {
    webSocketConnection,
    gameInstance,
    severity: 'log',
  });

  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.SYSTEM_MESSAGE,
      messageContents: `${webSocketConnection.profile.username} left`,
    });
  });

  if (
    gameInstance.gameState.isStarted ||
    getNumActivePlayers(gameInstance) === 0
  )
    closeInstance(gameInstance);
  else alertUpdateInstance(gameInstance);
} /* leaveInstance */

/**
 * Completely closes out and deletes a game instance, alerting any member
 * players
 * @param { Types.GameInstance } gameInstance game instance to close
 */
function closeInstance(gameInstance) {
  if (!gameInstancesByGameCode[gameInstance.gameCode]) return; // already deleted

  delete gameInstancesByGameCode[gameInstance.gameCode];
  gameInstance.webSocketConnections.forEach((webSocketConnection) => {
    sendMessage(webSocketConnection, {
      action: S2C_ACTIONS.INSTANCE_CLOSED,
    });
    delete gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];
  });

  log('Instance closed', {
    gameInstance,
    severity: 'log',
  });
} /* closeInstance */

/**
 * Starts the timer to close out a game instance, to be used when a player
 * loses connections
 * @param { Types.GameInstance } gameInstance game instance to close
 */
function startDisconnectedInstanceCloseTimeout(gameInstance) {
  if (!gameInstance || gameInstance.closeInstanceTimeoutID) return;

  gameInstance.closeInstanceTimeoutID = setTimeout(
    () => closeInstance(gameInstance),
    DISCONNECTED_TIMEOUT_MS,
  );

  log('Initialized disconnection timeout', {
    gameInstance,
    severity: 'log',
  });
} /* startDisconnectedInstanceCloseTimeout */

/**
 * Cancels any existing timesout that would close a game instance due to players
 * losing connection
 * @param { Types.GameInstance } gameInstance game instance to protect from closing
 */
function cancelDisconnectedInstanceCloseTimeout(gameInstance) {
  clearTimeout(gameInstance.closeInstanceTimeoutID);
  gameInstance.closeInstanceTimeoutID = null;

  log('Cancelled disconnection timeout', {
    gameInstance,
    severity: 'log',
  });
} /* cancelDisconnectedInstanceCloseTimeout */

/**
 * For a given connection, joins the game instance corresponding to the gameCode
 * @param { Types.WSConnection } webSocketConnection connection that should join the game instance
 * @param { number } gameCode game code corresponding to game instance to join
 */
function handleJoinInstance(webSocketConnection, gameCode) {
  const curGameInstance =
    gameInstancesByPlayerUUID?.[webSocketConnection?.profile?.uuid];
  const reqGameInstance = gameInstancesByGameCode[gameCode];

  if (curGameInstance?.gameState?.isStarted) {
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

  log('Player joined instance', {
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
  leaveInstance(webSocketConnection);

  /** @type { Types.GameInstance } */
  const gameInstance = {
    gameCode: generateUniqueGameCode(
      GAME_CODE_LO_RANGE,
      GAME_CODE_HI_RANGE,
      Object.keys(gameInstancesByGameCode),
    ),
    webSocketConnections: [webSocketConnection],
    gameState: {
      byPlayer: {},
      byRound: [],
      isStarted: false,
      gameWinner: null,
    },
    closeInstanceTimeoutID: null,
  };

  gameInstancesByGameCode[gameInstance.gameCode] = gameInstance;
  gameInstancesByPlayerUUID[webSocketConnection.profile.uuid] = gameInstance;

  alertUpdateInstance(gameInstance);

  log('Created instance', {
    webSocketConnection,
    gameInstance,
    severity: 'log',
  });
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

  log('Player updated profile', {
    webSocketConnection,
    gameInstance,
    severity: 'log',
  });
} /* handleUpdateProfile */

/**
 * Ends game instance, deciding and sending winner to each child connection
 * @param { Types.GameInstance } gameInstance game instance to end
 */
function endGame(gameInstance) {
  const gameWinner = calculateGameWinnerProfile(gameInstance);
  gameInstance.gameState.gameWinner = gameWinner.uuid;

  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.GAME_END,
      gameWinner,
    });
  });

  log(`Game ended with winner ${gameWinner.uuid}`, {
    gameInstance,
    severity: 'log',
  });

  setTimeout(() => closeInstance(gameInstance), GAME_END_TIMEOUT_MS);
} /* endGame */

/**
 * Ends game round, deciding and sending winner to each child connection along with
 * the specific card chosen by each opposing player
 * @param { Types.GameInstance } gameInstance targeted game instance
 */
function endRound(gameInstance) {
  const currentRoundState = getCurrentRoundState(gameInstance);
  const roundWinnerUUID = getRoundWinnerUUID(gameInstance);
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

  log(`Round ended with winner ${roundWinner.uuid}`, {
    gameInstance,
    severity: 'log',
  });

  if (gameInstance.gameState.byRound.length >= NUM_ROUNDS)
    endGame(gameInstance);
  else startNewRound(gameInstance);
} /* endRound */

/**
 * Instantiates new round on a game instance
 * @param { Types.GameInstance } gameInstance game instance to start a new round on
 */
function startNewRound(gameInstance) {
  if (!getCurrentRoundState(gameInstance).roundWinner) {
    log('Cannot start new round before previous round complete', {
      gameInstance,
      severity: 'error',
    });
    return;
  }
  const newRound = createNewRound(gameInstance);
  gameInstance.gameState.byRound.push(newRound);
  gameInstance.webSocketConnections.forEach((conn) => {
    sendMessage(conn, {
      action: S2C_ACTIONS.WORLD_EVENT,
      worldEvent: newRound.worldEvent,
    });
  });

  log('Round started', {
    gameInstance,
    severity: 'log',
  });
} /* startNewRound */

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

  // validate input to prevent cheating
  let errorOccurred = true;
  if (currentRoundState.selectedCard[playerUUID]) {
    log('Card selection rejected: card already selected this round', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
  } else if (!isCardValid(selectedCard)) {
    log('Card selection rejected: invalid card format', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
  } else if (
    !playerGameState.remainingCards.some((card) =>
      areCardsEqual(card, selectedCard),
    )
  ) {
    log('Card selection rejected: card not among remaining options', {
      webSocketConnection,
      gameInstance,
      severity: 'error',
    });
  } else {
    errorOccurred = false;
  }

  if (errorOccurred) {
    forceRefreshGameState(webSocketConnection);
    return;
  }

  playerGameState.remainingCards = playerGameState.remainingCards.filter(
    (card) => !areCardsEqual(card, selectedCard),
  );
  currentRoundState.selectedCard[playerUUID] = selectedCard;

  log(`Card selected`, {
    webSocketConnection,
    gameInstance,
    severity: 'log',
  });

  if (Object.keys(currentRoundState.selectedCard).length === 2) {
    endRound(gameInstance);
  } else {
    sendMessage(getOtherPlayer(gameInstance, webSocketConnection), {
      action: S2C_ACTIONS.CARD_SELECTED,
    });
  }
} /* handleSelectCard */

/**
 * Validates and relays chat message from client
 * @param { Types.WSConnection } webSocketConnection connection sending chat message
 * @param { string } messageContents text content of message being received
 */
function handleChatMessage(webSocketConnection, messageContents) {
  const gameInstance =
    gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

  log(`Chat message: "${messageContents}"`, {
    webSocketConnection,
    gameInstance,
    severity: 'log',
  });

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

  if (getNumActivePlayers(reqGameInstance) === 2)
    cancelDisconnectedInstanceCloseTimeout(reqGameInstance);

  alertUpdateInstance(reqGameInstance);

  log('Successfully rejoined instance', {
    webSocketConnection,
    gameInstance: reqGameInstance,
    severity: 'log',
  });

  if (reqGameInstance.gameState.isStarted) {
    forceRefreshGameState(webSocketConnection);
  }

  return true;
} /* attemptRejoin */

/**
 * Forces a client user to completely refresh/rerender their game instance,
 * used when a user reconnects or to handle errors
 * @param { Types.WSConnection } webSocketConnection connection to force refresh state to
 */
function forceRefreshGameState(webSocketConnection) {
  const playerUUID = webSocketConnection.profile.uuid;
  const gameInstance = gameInstancesByPlayerUUID[playerUUID];

  sendMessage(webSocketConnection, {
    action: S2C_ACTIONS.FORCE_REFRESH,
    gameState: cleanGameState(playerUUID, gameInstance.gameState),
  });
} /* forceRefreshGameState */

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
  if (attemptRejoinStatus) {
    gameInstancesByPlayerUUID?.[playerUUID]?.webSocketConnections.forEach(
      (conn) => {
        sendMessage(conn, {
          action: S2C_ACTIONS.SYSTEM_MESSAGE,
          messageContents: `${webSocketConnection.profile.username} reconnected`,
        });
      },
    );
  } else {
    createInstance(webSocketConnection);
  }
} /* handleInitialization */

/**
 * Handles a new request to the WebSocket server; always tries to accept
 * @param { Types.WSRequest } webSocketRequest inbound WebSocket request object
 */
export function handleRequest(webSocketRequest) {
  log(`WebSocket request received at "${webSocketRequest.remoteAddress}"`, {
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
    log(`Inbound message: "${data.utf8Data}"`, { severity: 'raw' });

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
        case C2S_ACTIONS.CHAT_MESSAGE:
          handleChatMessage(webSocketConnection, messageObj.messageContents);
          break;
        default:
          log(`Unrecognized action: ${messageObj.action}`, {
            severity: 'warn',
          });
      }
    } catch (e) {
      log(e.stack, {
        webSocketConnection,
        severity: 'error',
      });
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

    const gameInstance =
      gameInstancesByPlayerUUID[webSocketConnection.profile.uuid];

    gameInstance?.webSocketConnections?.forEach((conn) => {
      sendMessage(conn, {
        action: S2C_ACTIONS.SYSTEM_MESSAGE,
        messageContents: `${webSocketConnection.profile.username} disconnected`,
      });
    });

    if (!gameInstance) return;
    else if (gameInstance.gameState.isStarted)
      startDisconnectedInstanceCloseTimeout(gameInstance);
    else if (getNumActivePlayers(gameInstance) === 0)
      closeInstance(gameInstance);
  } /* handleClose */

  webSocketConnection.on('message', handleMessage);
  webSocketConnection.on('close', handleClose);
} /* handleRequest */

webSocketServer.on('request', handleRequest);
