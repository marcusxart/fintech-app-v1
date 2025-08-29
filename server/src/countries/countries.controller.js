const asyncHandler = require("../utils/asyncHandler");
const countries = require("../utils/countries");
const { NotFoundError } = require("../utils/appError");
const getHost = require("../utils/getHost");

/**
 * Controller for handling country-related routes
 */
class CountriesController {
  /**
   * Get all countries
   *
   * @type {import("express").RequestHandler}
   */
  static getAll = asyncHandler(async (req, res) => {
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

  /**
   * Get a country by its country code
   *
   * @type {import("express").RequestHandler}
   */
  static getByCode = asyncHandler(async (req, res) => {
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

module.exports = CountriesController;
