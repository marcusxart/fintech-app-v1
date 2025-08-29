const { ZodError } = require("zod");
const { BadRequestError } = require("../utils/appError");

/**
 * Middleware to validate request data using a Zod schema
 *
 * @param {import("zod").ZodSchema} schema - Zod schema to validate against
 * @returns {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void}
 */
const validate = (schema) => {
  return (req, _res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = result.body;
      // req.query = result.query;
      req.params = result.params;

      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const message = e.issues?.[0]?.message;

        if (message) {
          return next(new BadRequestError(message));
        }
      }
      next(new BadRequestError("Validation error"));
    }
  };
};

module.exports = validate;
