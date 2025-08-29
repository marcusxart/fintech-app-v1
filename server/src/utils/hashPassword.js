const bcrypt = require("bcrypt");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);

if (!SALT_ROUNDS) {
  throw new Error("SALT_ROUNDS must be defined in environment variables");
}

/**
 * Hash a password using bcrypt
 *
 * @param {string} password - Plain text password
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password against a bcrypt hash
 *
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Whether the password matches the hash
 */
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, verifyPassword };
