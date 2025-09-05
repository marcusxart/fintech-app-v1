const { Users, Media } = require("../database/models");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/appError");
const { userExcludes } = require("../utils/excludes");
const { mediaIncludes } = require("../utils/includes");
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const { generateAccessToken } = require("../utils/jwt");
const withTransaction = require("../utils/withTransaction");
const { Op } = require("sequelize");
const OtpService = require("../otp/otp.service");

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

      const user = await Users.create(
        {
          firstName: formatName(data.firstName),
          lastName: formatName(data.lastName),
          email: data.email,
          password: hashed,
          dialCode: data.dialCode,
          phoneNumber: fullPhoneNumber,
        },
        {
          transaction,
        }
      );

      return { userId: user.id };
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
  static async changePassword(userId, oldPass, newPass, confirmPass, code) {
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

      if (!user.emailVerified) {
        user.emailVerified = true;
      }

      if (!code) {
      }

      await user.save({ transaction });
      return true;
    });
  }

  /**
   * Verify a user's email with a token
   */
  static async verifyEmail(email, code) {
    return withTransaction(async (transaction) => {
      const user = await Users.findOne({ where: { email }, transaction });
      if (!user) throw new NotFoundError("User not found");

      if (user.emailVerified) {
        throw new BadRequestError("Email already verified");
      }

      await OtpService.verifyOtp(user.id, "verify-email", code, transaction);

      user.emailVerified = true;
      await user.save({ transaction });

      return true;
    });
  }

  /**
   * Resend verification token
   */
  static async sendEmailVerifyCode(email) {
    const user = await Users.findOne({ where: { email } });

    if (!user) throw new NotFoundError("User not found");

    if (user.emailVerified) throw new BadRequestError("Email already verified");

    const otpCode = await OtpService.generateOtp(user.id, "verify-email");

    return otpCode;
  }

  /**
   * Generate a reset password token for a user
   */
  static async forgotPassword(email) {
    const user = await Users.findOne({ where: { email } });
    if (!user) throw new NotFoundError("User not found");

    const otpCode = await OtpService.generateOtp(user.id, "reset-password");

    return otpCode;
  }

  /**
   * Reset a user's password with a valid token
   */
  static async resetPassword(email, newPass, confirmPass, code) {
    return withTransaction(async (transaction) => {
      const user = await Users.findOne({ where: { email }, transaction });
      if (!user) throw new NotFoundError("User not found");

      await OtpService.verifyOtp(user.id, "reset-password", code, transaction);

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

      if (!user.emailVerified) {
        user.emailVerified = true;
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
      include: [
        {
          model: Media,
          as: "profileImage",
          attributes: mediaIncludes,
        },
      ],
    });

    if (!user) throw new UnauthorizedError("Unauthorized");
    return user;
  }

  /**
   * Verify an OTP for a user (generic)
   */
  static async verifyOtp(email, type, code) {
    const user = await Users.findOne({ where: { email } });
    if (!user) throw new NotFoundError("User not found");

    if (user.emailVerified && type === "verify-email")
      throw new BadRequestError("Email already verified");

    if (user.phoneNumberVerified && type === "verify-phone-number")
      throw new BadRequestError("Phone number already verified");

    await OtpService.verifyOtp(user.id, type, code);

    return true;
  }
}

module.exports = AuthService;
