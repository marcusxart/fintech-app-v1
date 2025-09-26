const { Settings } = require("../database/models");
const { NotFoundError } = require("../utils/appError");
const { settingsExcludes } = require("../utils/excludes");
const withTransaction = require("../utils/withTransaction");

class SettingsService {
  /**
   * Get settings by userId
   */
  static async getByUserId(userId) {
    const settings = await Settings.findOne({
      where: { userId },
      attributes: { exclude: settingsExcludes },
    });

    if (!settings) {
      throw new NotFoundError("Settings not found for this user");
    }

    return settings;
  }

  /**
   * Toggle 2FA (twoFactorEnabled) for a user
   */
  static async toggleTwoFactor(userId) {
    return withTransaction(async (transaction) => {
      const settings = await Settings.findOne({
        where: { userId },
        transaction,
      });

      if (!settings) {
        throw new NotFoundError("Settings not found for this user");
      }

      settings.twoFactorEnabled = !settings.twoFactorEnabled;
      await settings.save({ transaction });

      return {
        message: `Two-factor authentication ${
          settings.twoFactorEnabled ? "enabled" : "disabled"
        } successfully`,
        twoFactorEnabled: settings.twoFactorEnabled,
      };
    });
  }
}

module.exports = SettingsService;
