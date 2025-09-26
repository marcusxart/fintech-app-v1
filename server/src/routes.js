const { Router } = require("express");
const authRoutes = require("./auth/auth.routes");
const countriesRoutes = require("./countries/countries.routes");
const settingsRoutes = require("./settings/settings.routes");

const router = Router();

/**
 * Root health check route
 *
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 */
router.get("/", (_req, res) => {
  res.send("✅Server running");
});

router.use("/auth", authRoutes);
router.use("/countries", countriesRoutes);
router.use("/settings", settingsRoutes);

module.exports = router;
