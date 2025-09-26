const { Router } = require("express");
const SettingsController = require("./settings.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

router.use(authMiddleware);

router.get("/", SettingsController.getMySettings);
router.patch("/two-factor", SettingsController.toggleTwoFactor);

module.exports = router;
