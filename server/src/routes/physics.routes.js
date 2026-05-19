const express = require("express");
const { getPhysicsConcepts, runPhysicsCalculation } = require("../services/physicsService");

const router = express.Router();

router.get("/concepts", (req, res) => {
  res.json(getPhysicsConcepts());
});

router.post("/calculate", (req, res) => {
  res.json(runPhysicsCalculation(req.body));
});

module.exports = router;
