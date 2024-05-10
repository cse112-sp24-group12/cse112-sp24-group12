/** @module types */

export const C2S_ACTIONS = {
  CREATE_PROFILE: 'create_profile',
  JOIN_INSTANCE: 'join_instance',
  START_GAME: 'start_game',
  SELECT_CARD: 'select_card',
};

export const S2C_ACTIONS = {
  UPDATE_INSTANCE: 'update_instance',
  START_GAME: 'start_game',
  CARD_SELECTED: 'card_selected',
  REVEAL_CARDS: 'reveal_cards',
};

/**
 * @typedef { string } UUID
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
 *    profile: ClientToServerMessage
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
 *  }
 * } ServerToClientMessage
 */
