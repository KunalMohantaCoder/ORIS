const express = require("express");
const { getTransparencyReport } = require("../config/apiRegistry");
const { loadJson } = require("../services/dataLoader");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    data: {
      apiRegistry: getTransparencyReport(),
      references: loadJson("references.json", []),
      fallbackDatasets: [
        "server/src/data/orbitalObjects.json",
        "server/src/data/surveyResponses.json",
        "server/src/data/launchTrends.json"
      ],
      policy: "ORIS uses free public APIs and local fallback datasets only. Paid APIs are intentionally excluded."
    }
  });
});

module.exports = router;
