import { JwtPayload } from "jsonwebtoken";

export interface UserDBAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  countryCode: string;
  phoneNumber: string;
  emailVerified: boolean;
  verifyToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

// For Sequelize model (adds confirmPassword virtual)
export interface UserModelAttributes extends UserDBAttributes {
  confirmPassword?: string;
}

export interface DecodedUser extends JwtPayload {
  id: string;
  email: string;
}
