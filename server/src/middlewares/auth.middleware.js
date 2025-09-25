const { verifyAccessToken, verifyRefreshToken } = require("../utils/jwt");
const { UnauthorizedError } = require("../utils/appError");
const { Users } = require("../database/models");

/**
 * Authentication middleware to verify JWT access token
 *
 * @param {import("express").Request & { user?: any }} req - Express request (extended with user)
 * @param {import("express").Response} _res - Express response
 * @param {import("express").NextFunction} next - Express next function
 */
const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Please provide a valid token (Bearer <token>).")
    );
  }

  const token = header.split(" ")[1];
  req.user = verifyAccessToken(token);

  try {
    const payload = verifyAccessToken(token);

    const user = await Users.findByPk(payload.id);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.refreshToken) {
      throw new UnauthorizedError("Session expired, please login again.");
    }

    req.user = { id: user.id, email: user.email };

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
