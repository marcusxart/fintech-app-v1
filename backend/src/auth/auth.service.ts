import { Users } from "../users/users.model";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/appError";
import { userExcludes } from "../utils/excludes";
import { hashPassword, verifyPassword } from "../utils/hashPassword";
import { generateAccessToken } from "../utils/jwt";
import { AccountCreationAttributes } from "./types";
import crypto from "crypto";
import { Op } from "sequelize";

export class AuthService {
  /**
   * Create a new account
   */
  static async createAccount(data: AccountCreationAttributes) {
    const existing = await Users.findOne({ where: { email: data.email } });
    if (existing) throw new BadRequestError("Email already exists");

    if (data.password !== data.confirmPassword) {
      throw new BadRequestError("Passwords do not match");
    }

    const hashed = await hashPassword(data.password);

    const user = await Users.create({
      name: data.name,
      email: data.email,
      password: hashed,
      countryCode: data.countryCode,
      phoneNumber: data.phoneNumber,
    });

    const token = generateAccessToken({ id: user.id, email: user.email });

    return {
      user: await Users.findByPk(user.id, {
        attributes: { exclude: userExcludes },
      }),
      token,
    };
  }

  /**
   * Login with email + password
   */
  static async login(email: string, password: string) {
    const user = await Users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const token = generateAccessToken({ id: user.id, email: user.email });

    return {
      user: await Users.findByPk(user.id, {
        attributes: { exclude: userExcludes },
      }),
      token,
    };
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    oldPass: string,
    newPass: string
  ) {
    const user = await Users.findByPk(userId);
    if (!user) throw new UnauthorizedError("User not found");

    const isMatch = await verifyPassword(oldPass, user.password);
    if (!isMatch) throw new ForbiddenError("Old password is incorrect");

    // Prevent using the same password
    const isSame = await verifyPassword(newPass, user.password);
    if (isSame) {
      throw new BadRequestError(
        "New password must be different from old password"
      );
    }

    user.password = await hashPassword(newPass);
    await user.save();

    return true;
  }

  /**
   * Verify Email
   */
  static async verifyEmail(token: string) {
    const user = await Users.findOne({ where: { verifyToken: token } });
    if (!user)
      throw new BadRequestError("Invalid or expired verification token");

    user.emailVerified = true;
    user.verifyToken = null;
    await user.save();

    return true;
  }

  /**
   * Forgot Password
   */
  static async forgotPassword(email: string) {
    const user = await Users.findOne({ where: { email } });
    if (!user) throw new NotFoundError("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return resetToken; // controller decides how to send (email/SMS/etc.)
  }

  /**
   * Reset Password
   */
  static async resetPassword(token: string, newPass: string) {
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await Users.findOne({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) throw new BadRequestError("Invalid or expired reset token");

    // Check if new password is same as old password
    const isSame = await verifyPassword(newPass, user.password);
    if (isSame) {
      throw new BadRequestError(
        "New password must be different from old password"
      );
    }

    user.password = await hashPassword(newPass);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return true;
  }

  /**
   * Get current user profile ("me")
   */
  static async me(userId: string) {
    const user = await Users.findByPk(userId, {
      attributes: { exclude: userExcludes },
    });

    if (!user) throw new UnauthorizedError("Unauthorized");

    return user;
  }
}
