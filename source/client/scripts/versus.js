/** @module versus */

/**
 * @typedef { {
 *  suite: string,
 *  number: number,
 * } } CardName
 */

/**
 *
 * @param { CardName[] } drawnCardNames
 */
export function handleCardsDrawn(drawnCardNames) {
  const cardSelectEl = document.querySelector('#card_select_list');

  cardSelectEl.replaceChildren(
    ...drawnCardNames.map((drawnCardName) => {
      const drawnCardEl = document.createElement('option');
      drawnCardEl.value = JSON.stringify(drawnCardName);
      drawnCardEl.innerText = JSON.stringify(drawnCardName);
      return drawnCardEl;
    }),
  );
} /* handleCardsDrawn */

/**
 *
 
export function handleRoundStart() {
 
} /* handleRoundStart
 */

/**
 *
 */
export function handleOpponentMove() {
  const opponentCardEl = document.querySelector('#opponent_card');

  opponentCardEl.innerText = 'Played';
} /* handleOpponentMove */

/**
 *
 * @param { CardName } opponentCardName
 * @param { 'user'|'opponent' } roundWinner
 */
export function handleRevealCards(opponentCardName, roundWinner) {
  const opponentCardEl = document.querySelector('#opponent_card');
  const roundWinnerEl = document.querySelector('#round_winner');

  opponentCardEl.innerText = JSON.stringify(opponentCardName);
  roundWinnerEl.innerText = roundWinner;
} /* handleRevealCards */

/**
 *
 * @param { 'user'|'opponent' } gameWinner
 */
export function handleGameEnd(gameWinner) {
  const gameWinnerEl = document.querySelector('#game_winner');

  gameWinnerEl.innerText = gameWinner;
} /* handleGameEnd */
