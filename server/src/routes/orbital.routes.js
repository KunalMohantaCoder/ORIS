const express = require("express");
const { getOrbitalHeatmap, getOrbitalObjects, getOrbitalSummary } = require("../services/orbitalDataService");

const router = express.Router();

router.get("/objects", async (req, res, next) => {
  try {
    res.json(await getOrbitalObjects(req.query));
  } catch (error) {
    next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    res.json(await getOrbitalSummary());
  } catch (error) {
    next(error);
  }
});

router.get("/heatmap", async (req, res, next) => {
  try {
    res.json(await getOrbitalHeatmap());
  } catch (error) {
    next(error);
  }
});

module.exports = router;
