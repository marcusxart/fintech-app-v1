const { Otp } = require("../database/models");
const { generateOtp } = require("../utils/otpGenerator");
const withTransaction = require("../utils/withTransaction");
const { BadRequestError } = require("../utils/appError");
const { Op } = require("sequelize");

class OtpService {
  /**
   * Generate OTP for user
   */
  static async generateOtp(userId, type) {
    const otpCode = generateOtp(6, "numeric");
    const expireMinutes = parseInt(process.env.OTP_EXPIRES_IN, 10);

    await withTransaction(async (transaction) => {
      await Otp.update(
        { used: true },
        { where: { userId, type, used: false }, transaction }
      );

      await Otp.destroy({
        where: { userId, type },
        transaction,
      });

      await Otp.create(
        {
          userId,
          code: otpCode,
          type,
          expiresAt: new Date(Date.now() + expireMinutes * 60 * 1000),
        },
        { transaction }
      );
    });

    return otpCode;
  }

  /**
   * Verify OTP
   */
  static async verifyOtp(userId, type, code) {
    return await withTransaction(async (transaction) => {
      const otp = await Otp.findOne({
        where: {
          userId,
          type,
          code,
          used: false,
          expiresAt: { [Op.gt]: new Date() },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!otp) throw new BadRequestError("Invalid or expired OTP");

      otp.used = true;
      await otp.save({ transaction });

      return true;
    });
  }
}

module.exports = OtpService;
