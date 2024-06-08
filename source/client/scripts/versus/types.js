/** @module types */

export const C2S_ACTIONS = {
  INITIALIZE_INSTANCE: 'initialize_instance',
  UPDATE_PROFILE: 'update_profile',
  JOIN_INSTANCE: 'join_instance',
  START_GAME: 'start_game',
  SELECT_CARD: 'select_card',
  CHAT_MESSAGE: 'chat_message',
};

export const S2C_ACTIONS = {
  UPDATE_UUID: 'update_uuid',
  UPDATE_INSTANCE: 'update_instance',
  START_GAME: 'start_game',
  CARD_SELECTED: 'card_selected',
  REVEAL_CARDS: 'reveal_cards',
  GAME_END: 'game_end',
  CHAT_MESSAGE: 'chat_message',
  SYSTEM_MESSAGE: 'system_message',
  UPDATE_PROFILE: 'update_profile',
  FORCE_REFRESH: 'force_refresh',
  WORLD_EVENT: 'world_event',
  INSTANCE_CLOSED: 'instance_closed',
};

export const WORLD_EVENTS = {
  LOWER_WINS: 'lower_wins',
  SUITE_REVERSED: 'suite_reversed',
  SUITE_BOOST_WANDS: 'suite_boost_wands',
  SUITE_BOOST_CUPS: 'suite_boost_cups',
  SUITE_BOOST_SWORDS: 'suite_boost_swords',
  SUITE_BOOST_PENTACLES: 'suite_boost_pentacles',
  RANDOM_VALUE: 'random_value',
  RANDOM_SUITE: 'random_suite',
  NONE: 'none',
};

export const UPDATE_USERNAME_LISTENER_NAME = 'versus-username-update';

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
 * @typedef { Card|'played' } IndeterminateCard
 */

/**
 * @typedef {
 *  {
 *    action: C2S_ACTIONS.INITIALIZE_INSTANCE,
 *    playerUUID: UUID
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
 *    action: C2S_ACTIONS.CHAT_MESSAGE,
 *    messageContents: string
 *  }
 * } ClientToServerMessage
 */

/**
 * @typedef {
 *  {
 *   action: S2C_ACTIONS.UPDATE_UUID,
 *   playerUUID: UUID
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
 *    action: S2C_ACTIONS.GAME_END,
 *    gameWinner: ServerToClientProfile
 *  } |
 *  {
 *    action: S2C_ACTIONS.CHAT_MESSAGE,
 *    messageContents: string,
 *    profile: ServerToClientProfile
 *  } |
 *  {
 *    action: S2C_ACTIONS.SYSTEM_MESSAGE,
 *    messageContents: string
 *  } |
 *  {
 *    action: S2C_ACTIONS.UPDATE_PROFILE,
 *    profile: ServerToClientProfile
 *  } |
 *  {
 *    action: S2C_ACTIONS.FORCE_REFRESH,
 *    gameState: GameState
 *  } |
 *  {
 *    action: S2C_ACTIONS.WORLD_EVENT,
 *    worldEvent: string
 *  } |
 *  {
 *    action: S2C_ACTIONS.INSTANCE_CLOSED
 *  }
 * } ServerToClientMessage
 */

/**
 * @typedef { string } UUID
 */

/**
 * @typedef { {
 *  score: number,
 *  remainingCards: Card[]
 * } } PlayerGameState
 */

/**
 * @typedef { {
 *  selectedCard: Record<UUID, Card>,
 *  roundWinner: UUID
 * } } RoundState
 */

/**
 * @typedef { {
 *  byPlayer: Record<UUID, PlayerGameState>,
 *  byRound: RoundState[],
 *  isStarted: boolean,
 *  gameWinner: UUID
 * } } GameState
 */
