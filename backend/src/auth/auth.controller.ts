import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import asyncHandler from "../utils/asyncHandler";

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    const results = await AuthService.createAccount(data);

    res.status(201).json({
      status: "success",
      ...results,
    });
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const results = await AuthService.login(email, password);

    res.status(200).json({
      status: "success",
      ...results,
    });
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;

    await AuthService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  });

  /**
   * Verify email
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    await AuthService.verifyEmail(token);

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  });

  /**
   * Forgot password
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const resetToken = await AuthService.forgotPassword(email);

    // Controller decides how to send token (email/SMS)
    res.status(200).json({
      status: "success",
      message: "Password reset token generated",
      resetToken,
    });
  });

  /**
   * Reset password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    await AuthService.resetPassword(token, newPassword);

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  });

  /**
   * Get current user profile
   */
  static me = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await AuthService.me(userId);

    res.status(200).json({
      status: "success",
      user,
    });
  });
}
