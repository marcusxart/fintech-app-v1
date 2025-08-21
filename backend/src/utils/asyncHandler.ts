import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Custom async handler to wrap async route handlers
 * Automatically forwards errors to Express error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
