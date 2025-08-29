const { verifyAccessToken } = require("../utils/jwt");
const { UnauthorizedError } = require("../utils/appError");

/**
 * Authentication middleware to verify JWT access token
 *
 * @param {import("express").Request & { user?: any }} req - Express request (extended with user)
 * @param {import("express").Response} _res - Express response
 * @param {import("express").NextFunction} next - Express next function
 */
const authenticate = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Please provide a valid token (Bearer <token>).")
    );
  }

  const token = header.split(" ")[1];
  req.user = verifyAccessToken(token);

  next();
};

module.exports = authenticate;
