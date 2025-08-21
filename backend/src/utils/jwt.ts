import jwt, { SignOptions } from "jsonwebtoken";
import { DecodedUser } from "../users/types";
import { UnauthorizedError } from "../utils/appError";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "1h") as SignOptions["expiresIn"];

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in environment variables");
}

export const generateAccessToken = (payload: DecodedUser): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): DecodedUser => {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedUser;
  } catch (err: any) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired. Please login again."
        : "Invalid token.";
    throw new UnauthorizedError(message);
  }
};
