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
  refreshTokenSchema,
} = require("./auth.validator");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// 🔹 Public routes
router.post(
  "/sign-up",
  validateMiddleware(createAccountSchema),
  AuthController.register
);

router.post("/sign-in", validateMiddleware(loginSchema), AuthController.login);

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
  "/send-verify-email",
  validateMiddleware(emailSchema),
  AuthController.sendEmailVerifyCode
);
router.post(
  "/refresh-token",
  validateMiddleware(refreshTokenSchema),
  AuthController.refreshToken
);

// 🔹 Protected routes
router.use(authMiddleware);

router.get("/me", AuthController.me);
router.post("/sign-out", AuthController.logout);
router.post(
  "/change-password",
  validateMiddleware(changePasswordSchema),
  AuthController.changePassword
);

module.exports = router;
