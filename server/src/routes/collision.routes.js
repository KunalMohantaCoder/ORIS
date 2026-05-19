const express = require("express");
const { getCrowdingAnalysis, simulateCollision } = require("../services/collisionRiskService");

const router = express.Router();

router.get("/crowding", async (req, res, next) => {
  try {
    res.json(await getCrowdingAnalysis());
  } catch (error) {
    next(error);
  }
});

router.post("/simulate", async (req, res, next) => {
  try {
    res.json({ data: await simulateCollision(req.body) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
