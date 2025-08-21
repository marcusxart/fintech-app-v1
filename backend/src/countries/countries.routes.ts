// src/countries/countries.routes.ts
import { Router } from "express";
import { CountriesController } from "./countries.controller";

const router = Router();

router.get("/", CountriesController.getAll);
router.get("/:code", CountriesController.getByCode);

export default router;
