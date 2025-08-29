const AuthService = require("./auth.service");
const asyncHandler = require("../utils/asyncHandler");

class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req, res) => {
    const data = req.body;

    const results = await AuthService.createAccount(data);

    // TODO: send verification email here

    res.status(201).json({
      status: "success",
      message: "Account created successfully. Please verify your email.",
      ...results,
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

    // TODO: optionally send email notification about password change

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  });

  /**
   * Verify email
   */
  static verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    await AuthService.verifyEmail(token);

    // TODO: send confirmation email after successful verification

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  });

  /**
   * resend email verification token
   */
  static resendVerifyToken = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const token = await AuthService.resendVerifyToken(email);

    // TODO: send confirmation email after successful verification

    res.status(200).json({
      status: "success",
      message:
        "A new verification email has been sent. Please check your inbox.",
      token,
    });
  });

  /**
   * Forgot password
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const token = await AuthService.forgotPassword(email);

    // TODO: send reset token to user's email

    res.status(200).json({
      status: "success",
      message: "Password reset token generated",
      token,
    });
  });

  /**
   * Reset password
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.query;
    console.log(token);
    const { newPassword, confirmPassword } = req.body;

    await AuthService.resetPassword(token, newPassword, confirmPassword);

    // TODO: send confirmation email about password reset

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
      user,
    });
  });
}

module.exports = AuthController;
