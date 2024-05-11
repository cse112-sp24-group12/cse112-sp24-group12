/** @module types */

export const C2S_ACTIONS = {
  CREATE_PROFILE: 'create_profile',
  JOIN_INSTANCE: 'join_instance',
  START_GAME: 'start_game',
  SELECT_CARD: 'select_card',
  START_ROUND: 'start_round',
  CHAT_MESSAGE: 'chat_message',
};

export const S2C_ACTIONS = {
  UPDATE_INSTANCE: 'update_instance',
  START_GAME: 'start_game',
  CARD_SELECTED: 'card_selected',
  REVEAL_CARDS: 'reveal_cards',
  START_ROUND: 'start_round',
  GAME_END: 'game_end',
  CHAT_MESSAGE: 'chat_message',
};

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
 *    action: C2S_ACTIONS.CREATE_PROFILE,
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
 *  }
 * } ClientToServerMessage
 */

/**
 * @typedef {
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
 *  }
 * } ServerToClientMessage
 */
