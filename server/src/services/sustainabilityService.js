const { clamp, round } = require("../utils/math");
const { loadJson } = require("./dataLoader");
const { simulateKesslerScenario } = require("./kesslerService");
const { getOrbitalHeatmap } = require("./orbitalDataService");

async function getSustainabilityForecast() {
  const launchTrends = loadJson("launchTrends.json", []);
  const kessler = await simulateKesslerScenario({
    years: 25,
    mitigationRate: 0.28,
    collisionGrowthFactor: 0.037
  });
  const heatmap = await getOrbitalHeatmap();
  const latest = launchTrends[launchTrends.length - 1] || {};
  const previous = launchTrends[launchTrends.length - 3] || latest;
  const launchGrowth = latest.launches && previous.launches
    ? round(((latest.launches - previous.launches) / previous.launches) * 100, 1)
    : 0;

  const recommendations = [
    {
      priority: "Critical",
      title: "Prioritize controlled deorbit plans for dense LEO shells",
      impact: "Reduces long-lived fragments in the highest traffic region."
    },
    {
      priority: "High",
      title: "Expand conjunction screening for inactive satellites and rocket bodies",
      impact: "Large derelict objects dominate catastrophic collision energy."
    },
    {
      priority: "High",
      title: "Adopt shared ephemeris publishing and maneuver transparency",
      impact: "Improves collision prediction windows for mixed public/private constellations."
    },
    {
      priority: "Medium",
      title: "Model launch cadence against orbital carrying capacity",
      impact: "Keeps future constellation growth inside sustainability thresholds."
    }
  ];

  return {
    data: {
      launchTrends,
      launchGrowthPercent: launchGrowth,
      forecast: kessler.data.series.map((point) => ({
        year: point.year,
        debrisObjects: point.debrisObjects,
        activeAssets: point.activeAssets,
        sustainabilityIndex: point.sustainabilityIndex,
        congestionRisk: round(clamp(100 - point.sustainabilityIndex, 0, 100), 1)
      })),
      heatmap: heatmap.data,
      recommendations
    }
  };
}

module.exports = { getSustainabilityForecast };
