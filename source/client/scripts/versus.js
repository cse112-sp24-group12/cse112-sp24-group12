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
export function handleOpponentMove() {} /* handleOpponentMove */

/**
 *
 * @param { CardName } opponentCardName
 * @param { "user"|"opponent" } roundWinner
 */
export function handleRevealCards(
  opponentCardName,
  roundWinner,
) {} /* handleRevealCards */

// TODO: handle game ends
