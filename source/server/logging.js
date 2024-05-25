/** @module logging */

import * as Types from './types.js';

const GREEN_FONT = '\x1b[32m';
const YELLOW_FONT = '\x1b[33m';
const RED_FONT = '\x1b[31m';
const GRAY_FONT = '\x1b[90m';
const MAGENTA_FONT = '\x1b[35m';
const RESET_FORMAT = '\x1b[0m';

/**
 *
 * @param { 'log'|'warn'|'error' } severity
 * @returns { string }
 */
function getSeverityFragment(severity) {
  switch (severity) {
    case 'log':
      return `[${GREEN_FONT}LOG${RESET_FORMAT}] `;
    case 'warn':
      return `[${YELLOW_FONT}WARN${RESET_FORMAT}] `;
    case 'error':
      return `[${RED_FONT}ERROR${RESET_FORMAT}] `;
    default:
      return '';
  }
} /* getSeverityFragment */

/**
 * 
 * @param { Types.GameInstance } gameInstance 
 * @returns { string }
 */
function getGameInstanceFragment(gameInstance) {
  return gameInstance ? `[Game ${gameInstance.gameCode}] ` : '';
} /* getGameInstanceFragment */

/**
 * 
 * @param { Types.WSConnection } webSocketConnection 
 * @returns { string }
 */
function getConnectionFragment(webSocketConnection) {
  return webSocketConnection ? `[UUID ${webSocketConnection.profile.uuid}] `: '';
} /* getConnectionFragment */

/**
 *
 * @param { string } logMessage
 * @param { {
 *  webSocketConnection: Types.WSConnection,
 *  gameInstance: Types.GameInstance
 *  severity: 'log'|'warn'|'error'|'connection'|'raw'
 * } } [info]
 */
export function log(
  logMessage,
  { webSocketConnection, gameInstance, severity } = {},
) {
  if (severity === 'raw') {
    console.log(`${GRAY_FONT}${logMessage}${RESET_FORMAT}`)
    return;
  }
  
  if (severity === 'connection') {
    console.log(`[${MAGENTA_FONT}CONN${RESET_FORMAT}] ${logMessage}`);
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

function dumpInfo() {
  console.log('-'.repeat(30) + `\nINFO DUMP\nPlayers online: ${12}\nTotal games: ${44}\nActive games: ${34}\n` + '-'.repeat(30));
} /*  */
