/**
 * Get the full host URL from an Express request
 *
 * @param {import("express").Request} req - Express request object
 * @returns {string} Full host URL (protocol + host)
 */
const getHost = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

module.exports = getHost;
