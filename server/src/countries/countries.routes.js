// src/countries/countries.routes.ts
const { Router } = require("express");
const CountriesController = require("./countries.controller");

const router = Router();

router.get("/", CountriesController.getAll);
router.get("/:code", CountriesController.getByCode);

module.exports = router;
