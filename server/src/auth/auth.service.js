const { Users } = require("../database/models");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/appError");
const { userExcludes } = require("../utils/excludes");
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const { generateAccessToken } = require("../utils/jwt");
const withTransaction = require("../utils/withTransaction");
const crypto = require("crypto");
const { Op } = require("sequelize");

class AuthService {
  /**
   * Create a new account
   */
  static async createAccount(data) {
    return withTransaction(async (transaction) => {
      const normalizedDialCode = data.dialCode.replace(/^00/, "+");
      const cleanedPhoneNumber = data.phoneNumber.replace(/^0+/, "");
      const fullPhoneNumber = `${normalizedDialCode}${cleanedPhoneNumber}`;

      const existing = await Users.findOne({
        where: {
          [Op.or]: [{ email: data.email }, { phoneNumber: fullPhoneNumber }],
        },
        transaction,
      });

      if (existing) {
        if (existing.email === data.email) {
          throw new BadRequestError("Email already exists");
        }
        if (existing.phoneNumber === fullPhoneNumber) {
          throw new BadRequestError("Phone number already exists");
        }
      }

      if (data.password !== data.confirmPassword) {
        throw new BadRequestError("Passwords do not match");
      }

      const hashed = await hashPassword(data.password);

      const formatName = (name) =>
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

      // Generate verify token
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const expireMinutes = parseInt(process.env.VERIFY_TOKEN_EXPIRES_IN, 10);

      await Users.create(
        {
          firstName: formatName(data.firstName),
          lastName: formatName(data.lastName),
          email: data.email,
          password: hashed,
          dialCode: data.dialCode,
          phoneNumber: fullPhoneNumber,
          verifyToken,
          verifyTokenExpires: new Date(Date.now() + expireMinutes * 60 * 1000),
        },
        {
          transaction,
        }
      );

      return {
        verifyToken,
      };
    });
  }

  /**
   * Login with email and password
   */
  static async login(email, password) {
    const user = await Users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const token = generateAccessToken({ id: user.id, email: user.email });

    return { token };
  }

  /**
   * Change the user's password
   */
  static async changePassword(userId, oldPass, newPass, confirmPass) {
    return withTransaction(async (transaction) => {
      const user = await Users.findByPk(userId, { transaction });
      if (!user) throw new UnauthorizedError("User not found");

      const isMatch = await verifyPassword(oldPass, user.password);
      if (!isMatch) throw new ForbiddenError("Old password is incorrect");

      if (newPass !== confirmPass) {
        throw new BadRequestError(
          "New password and confirm password do not match"
        );
      }

      const isSame = await verifyPassword(newPass, user.password);
      if (isSame) {
        throw new BadRequestError(
          "New password must be different from old password"
        );
      }

      user.password = await hashPassword(newPass);

      // ✅ Auto verify if still unverified
      if (!user.emailVerified) {
        user.emailVerified = true;
        user.verifyToken = null;
      }

      await user.save({ transaction });
      return true;
    });
  }

  /**
   * Verify a user's email with a token
   */
  static async verifyEmail(token) {
    return withTransaction(async (transaction) => {
      const user = await Users.findOne({
        where: {
          verifyToken: token,
          verifyTokenExpires: { [Op.gt]: new Date() },
        },
        transaction,
      });

      if (!user)
        throw new BadRequestError("Invalid or expired verification token");

      if (user.emailVerified)
        throw new BadRequestError("Email already verified");

      user.emailVerified = true;
      user.verifyToken = null;
      user.verifyTokenExpires = null;

      await user.save({ transaction });

      return true;
    });
  }

  /**
   * Resend verification token
   */
  static async resendVerifyToken(email) {
    return withTransaction(async (transaction) => {
      const user = await Users.findOne({ where: { email }, transaction });

      if (!user) throw new NotFoundError("User not found");

      if (user.emailVerified)
        throw new BadRequestError("Email already verified");

      const verifyToken = crypto.randomBytes(32).toString("hex");
      const expireMinutes = parseInt(process.env.VERIFY_TOKEN_EXPIRES_IN, 10);

      user.verifyToken = verifyToken;
      user.verifyTokenExpires = new Date(
        Date.now() + expireMinutes * 60 * 1000
      );

      await user.save({ transaction });
      return verifyToken;
    });
  }

  /**
   * Generate a reset password token for a user
   */
  static async forgotPassword(email) {
    return withTransaction(async (transaction) => {
      const user = await Users.findOne({ where: { email }, transaction });
      if (!user) throw new NotFoundError("User not found");

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      const expireMinutes = parseInt(
        process.env.RESET_TOKEN_EXPIRES_IN || "15",
        10
      );

      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = new Date(
        Date.now() + expireMinutes * 60 * 1000
      );

      await user.save({ transaction });
      return resetToken;
    });
  }

  /**
   * Reset a user's password with a valid token
   */
  static async resetPassword(token, newPass, confirmPass) {
    return withTransaction(async (transaction) => {
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await Users.findOne({
        where: {
          resetPasswordToken: resetTokenHash,
          resetPasswordExpires: { [Op.gt]: new Date() },
        },
        transaction,
      });

      if (!user) throw new BadRequestError("Invalid or expired reset token");
      // ✅ Check confirm password
      if (newPass !== confirmPass) {
        throw new BadRequestError(
          "New password and confirm password do not match"
        );
      }

      const isSame = await verifyPassword(newPass, user.password);
      if (isSame) {
        throw new BadRequestError(
          "New password must be different from old password"
        );
      }

      user.password = await hashPassword(newPass);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      // ✅ Auto verify if still unverified
      if (!user.emailVerified) {
        user.emailVerified = true;
        user.verifyToken = null;
        user.verifyTokenExpires = null;
      }

      await user.save({ transaction });
      return true;
    });
  }

  /**
   * Get the current logged-in user's profile
   */
  static async me(userId) {
    const user = await Users.findByPk(userId, {
      attributes: { exclude: userExcludes },
    });

    if (!user) throw new UnauthorizedError("Unauthorized");
    return user;
  }
}

module.exports = AuthService;
