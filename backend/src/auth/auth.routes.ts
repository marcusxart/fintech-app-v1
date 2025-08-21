import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../middlewares/vaildate.middleware";
import {
  createAccountSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validator";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(createAccountSchema),
  AuthController.register
);
router.post("/login", validate(loginSchema), AuthController.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

router.get(
  "/verify-email",
  validate(verifyEmailSchema),
  AuthController.verifyEmail
);

// Protected
router.use(authenticate);
router.get("/me", AuthController.me);
router.post(
  "/change-password",
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;
