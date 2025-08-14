/**
 * Logger utility.
 * @returns {Object} The logger object.
 */
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
};

module.exports = { logger };
