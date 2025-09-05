const { Otp } = require("../database/models");
const { generateOtp } = require("../utils/otpGenerator");
const withTransaction = require("../utils/withTransaction");
const { BadRequestError } = require("../utils/appError");
const { Op } = require("sequelize");

class OtpService {
  /**
   * Generate OTP for user
   */
  static async generateOtp(userId, type, transaction = null) {
    const otpCode = generateOtp(6, "numeric");
    const expireMinutes = parseInt(process.env.OTP_EXPIRES_IN, 10);

    const runner = transaction
      ? async (fn) => fn(transaction)
      : withTransaction;

    await runner(async (trx) => {
      await Otp.destroy({
        where: { userId, type },
        transaction: trx,
      });

      await Otp.create(
        {
          userId,
          code: otpCode,
          type,
          expiresAt: new Date(Date.now() + expireMinutes * 60 * 1000),
          used: false,
        },
        { transaction: trx }
      );
    });

    return otpCode;
  }

  /**
   * Verify OTP
   */
  static async verifyOtp(userId, type, code, transaction = null) {
    const runner = transaction
      ? async (fn) => fn(transaction)
      : withTransaction;

    return runner(async (trx) => {
      const otp = await Otp.findOne({
        where: {
          userId,
          type,
          code,
          used: false,
          expiresAt: { [Op.gt]: new Date() },
        },
        transaction: trx,
        lock: trx.LOCK.UPDATE,
      });

      if (!otp) throw new BadRequestError("Invalid or expired OTP");

      otp.used = true;
      await otp.save({ transaction: trx });

      return true;
    });
  }
}

module.exports = OtpService;
