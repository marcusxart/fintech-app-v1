const { AppError } = require("../utils/appError");
const logger = require("../utils/logger");

/**
 * Global error handling middleware
 *
 * @param {Error} err - Error object
 * @param {import("express").Request} _req - Express request
 * @param {import("express").Response} res - Express response
 * @param {import("express").NextFunction} _next - Express next function
 * @returns {import("express").Response} JSON response
 */
const globalErrorHandler = (err, _req, res, _next) => {
  // If error is our AppError, use its status/message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.log(err);
  logger.error(err.stack || "No stack trace");

  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

module.exports = globalErrorHandler;
