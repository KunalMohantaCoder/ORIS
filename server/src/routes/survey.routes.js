const express = require("express");
const { getSurveyAnalytics } = require("../services/surveyService");

const router = express.Router();

router.get("/analytics", async (req, res, next) => {
  try {
    res.json(await getSurveyAnalytics());
  } catch (error) {
    next(error);
  }
});

module.exports = router;
