/**
 * Custom async handler to wrap async route handlers
 * Automatically forwards errors to Express error middleware
 *
 * @param {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<any>} fn
 * @returns {import("express").RequestHandler}
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
