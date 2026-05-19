const { clamp, round } = require("../utils/math");
const { getOrbitalSummary } = require("./orbitalDataService");

async function simulateKesslerScenario(options = {}) {
  const { data: summary } = await getOrbitalSummary();
  const years = clamp(Number(options.years || 35), 5, 80);
  const initialDebris = Number(options.initialDebris || summary.debrisObjects || 22000);
  const initialActive = Number(options.initialActive || summary.activeSatellites || 9000);
  const annualLaunches = Number(options.annualLaunches || 260);
  const mitigationRate = clamp(Number(options.mitigationRate || 0.18), 0, 0.9);
  const collisionGrowthFactor = clamp(Number(options.collisionGrowthFactor || 0.045), 0.005, 0.16);
  let debris = initialDebris;
  let activeAssets = initialActive;
  let cumulativeCollisions = 0;
  const startYear = new Date().getFullYear();

  const series = Array.from({ length: years + 1 }, (_, index) => {
    const crowdingPressure = clamp((debris / Math.max(activeAssets + debris, 1)) * 1.7, 0.05, 1.35);
    const expectedCollisions = crowdingPressure * collisionGrowthFactor * Math.sqrt(activeAssets / 1000);
    const debrisCreated = expectedCollisions * 900 + annualLaunches * 3.2;
    const removed = debris * mitigationRate * 0.018;
    debris = Math.max(0, debris + debrisCreated - removed);
    activeAssets = Math.max(0, activeAssets + annualLaunches * 0.72 - expectedCollisions * 2.4);
    cumulativeCollisions += expectedCollisions;

    return {
      year: startYear + index,
      debrisObjects: Math.round(debris),
      activeAssets: Math.round(activeAssets),
      expectedCollisions: round(expectedCollisions, 3),
      cumulativeCollisions: round(cumulativeCollisions, 2),
      sustainabilityIndex: round(clamp(100 - (debris / (activeAssets + 1)) * 8 - cumulativeCollisions * 0.6, 0, 100), 2)
    };
  });

  const eventStream = series
    .filter((point, index) => index % Math.max(1, Math.floor(years / 12)) === 0)
    .map((point, index) => ({
      id: `event-${index}`,
      year: point.year,
      radius: 18 + index * 6,
      angle: (index * 47) % 360,
      intensity: clamp(point.expectedCollisions * 22, 4, 100)
    }));

  return {
    data: {
      scenario: {
        years,
        initialDebris,
        initialActive,
        annualLaunches,
        mitigationRate,
        collisionGrowthFactor
      },
      series,
      eventStream,
      terminalState: series[series.length - 1]
    }
  };
}

module.exports = { simulateKesslerScenario };
