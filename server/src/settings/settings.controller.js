const asyncHandler = require("../utils/asyncHandler");
const SettingsService = require("./settings.service");

class SettingsController {
  /**
   * Get current user settings
   */
  static getMySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await SettingsService.getByUserId(userId);

    res.status(200).json({
      status: "success",
      ...settings.toJSON(),
    });
  });

  /**
   * Toggle 2FA (twoFactorEnabled)
   */
  static toggleTwoFactor = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await SettingsService.toggleTwoFactor(userId);

    res.status(200).json({
      status: "success",
      ...result,
    });
  });
}

module.exports = SettingsController;
