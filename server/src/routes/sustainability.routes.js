const express = require("express");
const { getSustainabilityForecast } = require("../services/sustainabilityService");

const router = express.Router();

router.get("/forecast", async (req, res, next) => {
  try {
    res.json(await getSustainabilityForecast());
  } catch (error) {
    next(error);
  }
});

module.exports = router;
