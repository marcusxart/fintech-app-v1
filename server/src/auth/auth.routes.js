const { Router } = require("express");
const AuthController = require("./auth.controller");
const validateMiddleware = require("../middlewares/vaildate.middleware");
const {
  createAccountSchema,
  loginSchema,
  changePasswordSchema,
  emailSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require("./auth.validator");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Public routes
router.post(
  "/register",
  validateMiddleware(createAccountSchema),
  AuthController.register
);

router.post("/login", validateMiddleware(loginSchema), AuthController.login);

router.post(
  "/forgot-password",
  validateMiddleware(emailSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateMiddleware(resetPasswordSchema),
  AuthController.resetPassword
);

router.post(
  "/verify-email",
  validateMiddleware(verifyEmailSchema),
  AuthController.verifyEmail
);
router.post(
  "/resend-verify-email-token",
  validateMiddleware(emailSchema),
  AuthController.resendVerifyToken
);

// Protected
router.use(authMiddleware);

router.get("/me", AuthController.me);

router.post(
  "/change-password",
  validateMiddleware(changePasswordSchema),
  AuthController.changePassword
);

module.exports = router;
