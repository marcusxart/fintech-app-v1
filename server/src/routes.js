const { Router } = require("express");
const authRoutes = require("./auth/auth.routes");
const countriesRoutes = require("./countries/countries.routes");

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

module.exports = router;
