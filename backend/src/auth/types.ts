import { UserDBAttributes } from "../users/types";

export interface AccountCreationAttributes
  extends Omit<
    UserDBAttributes,
    | "id"
    | "emailVerified"
    | "verifyToken"
    | "resetPasswordToken"
    | "resetPasswordExpires"
  > {
  confirmPassword?: string;
}
