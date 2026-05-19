const express = require("express");
const collisionRoutes = require("./collision.routes");
const kesslerRoutes = require("./kessler.routes");
const orbitalRoutes = require("./orbital.routes");
const physicsRoutes = require("./physics.routes");
const sourcesRoutes = require("./sources.routes");
const surveyRoutes = require("./survey.routes");
const sustainabilityRoutes = require("./sustainability.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ORIS API",
    timestamp: new Date().toISOString()
  });
});

router.use("/orbital", orbitalRoutes);
router.use("/collision", collisionRoutes);
router.use("/kessler", kesslerRoutes);
router.use("/survey", surveyRoutes);
router.use("/sustainability", sustainabilityRoutes);
router.use("/physics", physicsRoutes);
router.use("/sources", sourcesRoutes);

module.exports = router;
