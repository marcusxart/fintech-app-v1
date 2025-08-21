import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import countriesRoutes from "./countries/countries.routes";
import { Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("✅Server running");
});

router.use("/auth", authRoutes);
router.use("/countries", countriesRoutes);

export default router;
