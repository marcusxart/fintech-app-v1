const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./appError");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in environment variables");
}

/**
 * Generate an access token
 *
 * @param {Object} payload - User payload (decoded user object)
 * @returns {string} Signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify an access token
 *
 * @param {string} token - JWT string
 * @returns {Object} Decoded user payload
 * @throws {UnauthorizedError} If the token is expired or invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired. Please login again."
        : "Invalid token.";
    throw new UnauthorizedError(message);
  }
};

module.exports = { generateAccessToken, verifyAccessToken };
