import { DecodedUser } from "../users/types";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}
