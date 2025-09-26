const AuthService = require("./auth.service");
const asyncHandler = require("../utils/asyncHandler");

class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req, res) => {
    const data = req.body;

    await AuthService.createAccount(data);

    // TODO: send verification email here
    res.status(201).json({
      status: "success",
      message: "Account created successfully. Please verify your email.",
    });
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const results = await AuthService.login(email, password);

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      ...results,
    });
  });

  // Verify 2FA
  static verify2FA = asyncHandler(async (req, res) => {
    const { userId, code } = req.query;
    console.log(req.query);
    const tokens = await AuthService.verify2FA(userId, code);

    res.status(200).json({
      status: "success",
      message: "2FA verified successfully",
      ...tokens,
    });
  });

  /**
   * Logout user (invalidate refresh token)
   */
  static logout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await AuthService.logout(userId);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  });

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      status: "success",
      message: "Access token refreshed successfully",
      ...tokens,
    });
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    await AuthService.changePassword(
      userId,
      oldPassword,
      newPassword,
      confirmPassword
    );

    await AuthService.logout(userId);

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  });

  /**
   * Verify email
   */
  static verifyEmail = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    await AuthService.verifyEmail(email, code);

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  });

  /**
   * Resend email verification code
   */
  static sendEmailVerifyCode = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const code = await AuthService.sendEmailVerifyCode(email);

    res.status(200).json({
      status: "success",
      message:
        "A new verification email has been sent. Please check your inbox.",
      code,
    });
  });

  /**
   * Forgot password
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const code = await AuthService.forgotPassword(email);

    res.status(200).json({
      status: "success",
      message: "Password reset OTP generated",
      code,
    });
  });

  /**
   * Reset password
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { newPassword, confirmPassword, email, code } = req.body;

    await AuthService.resetPassword(email, newPassword, confirmPassword, code);

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  });

  /**
   * Get current user profile
   */
  static me = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await AuthService.me(userId);

    res.status(200).json({
      status: "success",
      ...user.toJSON(),
    });
  });
}

module.exports = AuthController;
