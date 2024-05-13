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
} from './util.js';
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

console.log('Server online');

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

  console.log(`Game ${gameInstance.gameCode} started`);
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

  // TODO: send down updates to other player
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
 *
 * @param { Types.WSConnection } webSocketConnection
 * @param { Types.UUID } [playerUUID]
 * @returns { boolean } success status of rejoin attempt (i.e., true iff instance rejoined)
 */
function attemptRejoin(webSocketConnection, playerUUID) {
  if (!playerUUID) return false;

  const requestedGameInstance = gameInstancesByPlayerUUID[playerUUID];
  const requestedReplacedConnection =
    requestedGameInstance?.webSocketConnections?.find(
      (conn) => conn.profile.uuid === playerUUID,
    );

  if (
    !requestedGameInstance ||
    !requestedReplacedConnection ||
    requestedReplacedConnection.connected
  ) {
    return false;
  }

  webSocketConnection.profile = requestedReplacedConnection.profile;
  requestedGameInstance.webSocketConnections[
    requestedGameInstance.webSocketConnections.indexOf(
      requestedReplacedConnection,
    )
  ] = webSocketConnection;
  sendMessage(webSocketConnection, {
    action: S2C_ACTIONS.UPDATE_UUID,
    playerUUID: playerUUID,
  });

  alertUpdateInstance(requestedGameInstance);
  return true;
} /* attemptRejoin */

/**
 *
 * @param { Types.WSConnection } webSocketConnection
 * @param { Types.UUID } [playerUUID]
 */
function handleInitialization(webSocketConnection, playerUUID) {
  const rejoinStatus = attemptRejoin(webSocketConnection, playerUUID);
  if (rejoinStatus === false) createInstance(webSocketConnection);
} /* handleInitialization */

/**
 * Provides surface-level validation of whether an action is in
 * the correct order, to be used in message handling to reject
 * invalid messages
 * @param { Types.WSConnection } webSocketConnection webSocketConnection requesting action
 * @param { any } currentAction action being requested
 * @returns { boolean } true if action is allowed; false if disallowed
 */
function isActionAllowed(webSocketConnection, currentAction) {
  const uuid = webSocketConnection?.profile?.uuid;
  const gameInstance = gameInstancesByPlayerUUID?.[uuid];

  switch (currentAction) {
    case C2S_ACTIONS.INITIALIZE_INSTANCE:
      return !gameInstance;
    case C2S_ACTIONS.JOIN_INSTANCE:
      return !gameInstance.gameState.isStarted;
    case C2S_ACTIONS.START_GAME:
      return !gameInstance.gameState.isStarted;
    case C2S_ACTIONS.SELECT_CARD:
      return !getCurrentRoundState(gameInstance).selectedCard[uuid];
    case C2S_ACTIONS.START_ROUND:
      return getCurrentRoundState(gameInstance).roundWinner;
    case C2S_ACTIONS.CHAT_MESSAGE:
      return true;
    case C2S_ACTIONS.UPDATE_PROFILE:
      return true;
  }
} /* isActionAllowed */

/**
 * Handles a new request to the WebSocket server; always tries to accept
 * @param { Types.WSRequest } webSocketRequest inbound WebSocket request object
 */
function handleRequest(webSocketRequest) {
  console.log(`Request received at "${webSocketRequest.remoteAddress}"`);

  const webSocketConnection = acceptRequest(webSocketRequest);

  console.log(`WebSocket connected at "${webSocketConnection.remoteAddress}"`);

  /**
   * Handles message event for a given WebSocket connection
   * @param { { type: 'utf8'|'binary', utf8Data: string } } data message object received
   */
  function handleMessage(data) {
    console.log(
      `Message received at "${webSocketConnection.remoteAddress}": "${data.utf8Data}"`,
    );

    try {
      const messageObj = JSON.parse(data.utf8Data);

      if (!isActionAllowed(webSocketConnection, messageObj.action)) {
        console.log('Action received out-of-order');
        return;
      }

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
    console.log(
      `WebSocket disconnected at "${webSocketConnection.remoteAddress}" with code "${code}" and desc "${desc}"`,
    );
  } /* handleClose */

  webSocketConnection.on('message', handleMessage);
  webSocketConnection.on('close', handleClose);
} /* handleRequest */

webSocketServer.on('request', handleRequest);
