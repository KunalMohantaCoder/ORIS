const express = require("express");
const { simulateKesslerScenario } = require("../services/kesslerService");

const router = express.Router();

router.post("/simulate", async (req, res, next) => {
  try {
    res.json(await simulateKesslerScenario(req.body));
  } catch (error) {
    next(error);
  }
});

router.get("/simulate", async (req, res, next) => {
  try {
    res.json(await simulateKesslerScenario(req.query));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
