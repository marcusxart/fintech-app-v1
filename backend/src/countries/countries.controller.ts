// src/countries/countries.controller.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { countries } from "../utils/countries";
import { NotFoundError } from "../utils/appError";
import getHost from "../utils/getHost";

export class CountriesController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const host = getHost(req);
    const countriesData = countries.map((c) => ({
      ...c,
      flag: `${host}/public/flags/${c.name.toLowerCase()}.png`,
    }));

    res.status(200).json({
      status: "success",
      count: countriesData.length,
      countries: countriesData,
    });
  });

  static getByCode = asyncHandler(async (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase(); // normalize input
    const country = countries.find((c) => c.countryCode.toUpperCase() === code);

    if (!country) {
      throw new NotFoundError("Country not found");
    }

    const host = getHost(req);
    const result = {
      ...country,
      flag: `${host}/public/flags/${country.name.toLowerCase()}.png`,
    };

    res.status(200).json({
      status: "success",
      country: result,
    });
  });
}
