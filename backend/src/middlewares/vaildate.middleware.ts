import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/appError";

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = result.body;
      req.query = result.query;
      req.params = result.params;
      next();
    } catch (e: any) {
      const message = e.errors?.[0]?.message || "Validation error";
      next(new BadRequestError(message));
    }
  };
