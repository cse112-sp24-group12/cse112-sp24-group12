/** @module types */

export const C2S_ACTIONS = {
  CREATE_INSTANCE: 'create_instance',
  UPDATE_PROFILE: 'update_profile',
  JOIN_INSTANCE: 'join_instance',
  START_GAME: 'start_game',
  SELECT_CARD: 'select_card',
  START_ROUND: 'start_round',
  CHAT_MESSAGE: 'chat_message',
  REQUEST_REJOIN: 'request_rejoin',
};

export const S2C_ACTIONS = {
  UPDATE_UUID: 'update_uuid',
  UPDATE_INSTANCE: 'update_instance',
  START_GAME: 'start_game',
  CARD_SELECTED: 'card_selected',
  REVEAL_CARDS: 'reveal_cards',
  START_ROUND: 'start_round',
  GAME_END: 'game_end',
  CHAT_MESSAGE: 'chat_message',
  REJOIN_RESPONSE: 'rejoin_response',
};

/**
 * @typedef { any } WSConnection
 */

/**
 * @typedef { any } WSRequest
 */

/**
 * @typedef { string|null } UUID
 */

/**
 * @typedef { {
 *  username: string,
 *  profileImageName: string
 * } } ClientToServerProfile
 */

/**
 * @typedef { {
 *  uuid: UUID,
 *  username: string,
 *  profileImageName: string
 * } } ServerToClientProfile
 */

/**
 * @typedef { {
 *  suite: string,
 *  number: number
 * } } Card
 */

/**
 * @typedef {
 *  {
 *    action: C2S_ACTIONS.CREATE_INSTANCE,
 *  } |
 *  {
 *    action: C2S_ACTIONS.UPDATE_PROFILE,
 *    profile: ClientToServerProfile
 *  } |
 *  {
 *    action: C2S_ACTIONS.JOIN_INSTANCE,
 *    gameCode: number
 *  } |
 *  {
 *    action: C2S_ACTIONS.START_GAME
 *  } |
 *  {
 *    action: C2S_ACTIONS.SELECT_CARD,
 *    selectedCard: Card
 *  } |
 *  {
 *    action: S2C_ACTIONS.START_ROUND,
 *  } |
 *  {
 *    action: C2S_ACTIONS.CHAT_MESSAGE,
 *    messageContents: string
 *  } |
 *  {
 *    action: C2S_ACTIONS.REQUEST_REJOIN,
 *    playerUUID: UUID
 *  }
 * } ClientToServerMessage
 */

/**
 * @typedef {
 *  {
 *   action: S2C_ACTIONS.UPDATE_UUID,
 *   playerUUID: UUID: UUID
 *  } |
 *  {
 *    action: S2C_ACTIONS.UPDATE_INSTANCE,
 *    instanceInfo: {
 *      gameCode: number,
 *      profileList: ServerToClientProfile[]
 *    }
 *  } |
 *  {
 *    action: S2C_ACTIONS.START_GAME,
 *    drawnCards: Card[]
 *  } |
 *  {
 *    action: S2C_ACTIONS.CARD_SELECTED
 *  } |
 *  {
 *    action: S2C_ACTIONS.REVEAL_CARDS,
 *    opponentSelectedCard: Card,
 *    roundWinner: ServerToClientProfile
 *  } |
 *  {
 *    action: S2C_ACTIONS.START_ROUND,
 *  } |
 *  {
 *    action: S2C_ACTIONS.GAME_END,
 *    gameWinner: ServerToClientProfile
 *  } |
 *  {
 *    action: S2C_ACTIONS.CHAT_MESSAGE,
 *    messageContents: string,
 *    profile: ServerToClientProfile
 *  } | 
 *  {
 *    action: S2C_ACTIONS.REJOIN_RESPONSE,
 *    didRejoin: boolean
 *  }
 * } ServerToClientMessage
 */

/**
 * @typedef { string } UUID
 */

/**
 * @typedef { {
 *  score: number,
 *  remainingCards: Card[],
 * } } PlayerGameState
 */

/**
 * @typedef { {
 *  selectedCard: {
 *    [playerUUID: UUID]: Card,
 *  },
 *  roundWinner: UUID
 * } } RoundState
 */

/**
 * @typedef { {
 *  byPlayer: {
 *    [playerUUID: UUID]: PlayerGameState
 *  },
 *  byRound: RoundState[]
 *  isStarted: boolean
 * } } GameState
 */

/**
 * @typedef { {
 *  gameCode: number,
 *  webSocketConnections: WSConnection[],
 *  gameState: GameState
 * } } GameInstance
 */
