/** @module logging */

import * as Types from './types.js';

const INFO_DUMP_INTERVAL_MS = 60_000;
const INFO_DUMP_DIVIDER_LENGTH = 30;

const GREEN_FONT = '\x1b[32m';
const YELLOW_FONT = '\x1b[33m';
const RED_FONT = '\x1b[31m';
const GRAY_FONT = '\x1b[90m';
const MAGENTA_FONT = '\x1b[35m';
const CYAN_FONT = '\x1b[36m';

const CYAN_BG = '\x1b[46m';

const RESET_FORMAT = '\x1b[0m';

/**
 * Encapsulates text in ANSI codes for CLI styling
 * @param { string } text text to style
 * @param { string } fontStyle constant font style flag, e.g., RED_FONT
 * @returns { string } styled text
 */
function styleText(text, fontStyle) {
  return `${fontStyle}${text}${RESET_FORMAT}`;
} /* styleText */

/**
 * Constructs text fragment associated to severity variant
 * @param { 'log'|'warn'|'error' } severity severity of message
 * @returns { string } styled severity fragment
 */
function getSeverityFragment(severity) {
  switch (severity) {
    case 'log':
      return `[${styleText('LOG', GREEN_FONT)}] `;
    case 'warn':
      return `[${styleText('WARN', YELLOW_FONT)}] `;
    case 'error':
      return `[${styleText('ERROR', RED_FONT)}] `;
    default:
      return '';
  }
} /* getSeverityFragment */

/**
 * Constructs text fragment associated to game instance information
 * @param { Types.GameInstance } gameInstance associated game instance
 * @returns { string } fragment denoting game code
 */
function getGameInstanceFragment(gameInstance) {
  return gameInstance ? `[Game ${gameInstance.gameCode}] ` : '';
} /* getGameInstanceFragment */

/**
 * Constructs text fragment associated to connection/profile information
 * @param { Types.WSConnection } webSocketConnection associated WS connection
 * @returns { string } fragment denoting UUID of connected profile
 */
function getConnectionFragment(webSocketConnection) {
  return webSocketConnection
    ? `[UUID ${webSocketConnection.profile.uuid}] `
    : '';
} /* getConnectionFragment */

/**
 * Styles and displays message along with its attached identifiers
 * @param { string } logMessage central message to log
 * @param { {
 *  webSocketConnection: Types.WSConnection,
 *  gameInstance: Types.GameInstance,
 *  severity: 'log'|'warn'|'error'|'connection'|'raw'
 * } } [info] optional variants and additional identifying information
 */
export function log(
  logMessage,
  { webSocketConnection, gameInstance, severity } = {},
) {
  if (severity === 'raw') {
    console.log(styleText(logMessage, GRAY_FONT));
    return;
  }

  if (severity === 'connection') {
    console.log(`[${styleText('CONN', MAGENTA_FONT)}] ${logMessage}`);
    return;
  }

  if (!['log', 'warn', 'error'].includes(severity)) severity = 'log';

  console[severity](
    getSeverityFragment(severity) +
      getGameInstanceFragment(gameInstance) +
      getConnectionFragment(webSocketConnection) +
      logMessage,
  );
} /* log */

/**
 * Prints to the console an overview of current overall game information,
 * such as total active games and total active users
 * @param { Record<number, Types.GameInstance> } gameInstancesByGameCode map of game codes/instances
 * @param { Record<Types.UUID, Types.GameInstance> } gameInstancesByPlayerUUID map of game instances/player UUIDs
 */
function logOverview(gameInstancesByGameCode, gameInstancesByPlayerUUID) {
  const totalCurrentGamesCount = Object.keys(gameInstancesByGameCode).length;
  const activeCurrentGamesCount = Object.values(gameInstancesByGameCode).filter(
    (gameInstance) => gameInstance.gameState.isStarted,
  ).length;
  const totalCurrentPlayersCount = Object.keys(
    gameInstancesByPlayerUUID,
  ).length;

  console.log(
    `${styleText('-'.repeat(INFO_DUMP_DIVIDER_LENGTH), CYAN_FONT)}
${styleText('INFO DUMP', CYAN_BG)}
Total current games: ${totalCurrentGamesCount}
Active current games: ${activeCurrentGamesCount}
Total current players: ${totalCurrentPlayersCount}
${styleText('-'.repeat(INFO_DUMP_DIVIDER_LENGTH), CYAN_FONT)}`,
  );
} /* logOverview */

/**
 * Starts interval to print overview to log every X amount of time
 * @param { Record<number, Types.GameInstance> } gameInstancesByGameCode drilled arg
 * @param { Record<Types.UUID, Types.GameInstance> } gameInstancesByPlayerUUID drilled arg
 */
export function initializeLoggingOverviews(
  gameInstancesByGameCode,
  gameInstancesByPlayerUUID,
) {
  setInterval(
    () => logOverview(gameInstancesByGameCode, gameInstancesByPlayerUUID),
    INFO_DUMP_INTERVAL_MS,
  );
}
