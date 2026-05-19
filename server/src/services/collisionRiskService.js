const { clamp, distanceKm, round } = require("../utils/math");
const { getOrbitalObjects, getOrbitalSummary } = require("./orbitalDataService");

function riskLevel(score) {
  if (score >= 80) return "critical";
  if (score >= 58) return "high";
  if (score >= 32) return "medium";
  return "low";
}

function analyzePair(objectA, objectB, overrides = {}) {
  const missDistanceKm = Number(overrides.missDistanceKm || distanceKm(objectA, objectB));
  const relativeVelocityKmS = Number(
    overrides.relativeVelocityKmS ||
      Math.abs(Number(objectA.velocityKmS || 0) - Number(objectB.velocityKmS || 0)) +
        (objectA.regime === "LEO" || objectB.regime === "LEO" ? 4.8 : 1.4)
  );
  const projectileMassKg = Number(overrides.projectileMassKg || Math.min(objectA.massKg || 10, objectB.massKg || 10));
  const kineticEnergyJ = 0.5 * projectileMassKg * (relativeVelocityKmS * 1000) ** 2;
  const sameRegimeFactor = objectA.regime === objectB.regime ? 1 : 0.35;
  const debrisFactor = objectA.type === "debris" || objectB.type === "debris" ? 1.35 : 0.85;
  const distanceFactor = clamp(1 - Math.log10(Math.max(missDistanceKm, 0.01)) / 4.7, 0, 1);
  const velocityFactor = clamp(relativeVelocityKmS / 15, 0.08, 1.2);
  const energyFactor = clamp(Math.log10(Math.max(kineticEnergyJ, 1)) / 11, 0, 1.2);
  const score = clamp(
    100 * distanceFactor * velocityFactor * sameRegimeFactor * debrisFactor + energyFactor * 22,
    0,
    100
  );

  return {
    objectA,
    objectB,
    missDistanceKm: round(missDistanceKm, 3),
    relativeVelocityKmS: round(relativeVelocityKmS, 3),
    projectileMassKg: round(projectileMassKg, 2),
    kineticEnergyJ: Math.round(kineticEnergyJ),
    probabilityPercent: round(clamp(score / 12.5, 0.02, 8.5), 3),
    riskScore: round(score, 2),
    riskLevel: riskLevel(score),
    drivers: {
      sameRegime: objectA.regime === objectB.regime,
      debrisInvolved: objectA.type === "debris" || objectB.type === "debris",
      distanceFactor: round(distanceFactor, 3),
      velocityFactor: round(velocityFactor, 3)
    }
  };
}

async function simulateCollision(payload = {}) {
  const { data: objects } = await getOrbitalObjects({ limit: 2500 });
  const objectA =
    objects.find((object) => String(object.id) === String(payload.objectAId)) ||
    objects.find((object) => String(object.noradId) === String(payload.objectAId)) ||
    objects.find((object) => object.type === "active") ||
    objects[0];
  const objectB =
    objects.find((object) => String(object.id) === String(payload.objectBId)) ||
    objects.find((object) => String(object.noradId) === String(payload.objectBId)) ||
    objects.find((object) => object.type === "debris" && object.regime === objectA.regime) ||
    objects[1];

  return analyzePair(objectA, objectB, payload);
}

async function getCrowdingAnalysis() {
  const { data: objects } = await getOrbitalObjects({ limit: 1200 });
  const { data: summary } = await getOrbitalSummary();
  const debris = objects.filter((object) => object.type === "debris").slice(0, 80);
  const assets = objects.filter((object) => object.type === "active").slice(0, 120);
  const candidatePairs = [];

  assets.forEach((asset) => {
    const nearest = debris
      .filter((fragment) => fragment.regime === asset.regime)
      .map((fragment) => analyzePair(asset, fragment))
      .sort((a, b) => b.riskScore - a.riskScore)[0];
    if (nearest) candidatePairs.push(nearest);
  });

  return {
    data: {
      warnings: candidatePairs.sort((a, b) => b.riskScore - a.riskScore).slice(0, 12),
      density: summary.byRegime,
      riskPosture: summary.riskPosture,
      shellPressure: [
        { shell: "LEO", score: round((summary.byRegime.LEO || 0) * 0.12 + (summary.debrisObjects || 0) * 0.08, 2) },
        { shell: "MEO", score: round((summary.byRegime.MEO || 0) * 0.18, 2) },
        { shell: "GEO", score: round((summary.byRegime.GEO || 0) * 0.22 + (summary.inactiveSatellites || 0) * 0.05, 2) },
        { shell: "HEO", score: round((summary.byRegime.HEO || 0) * 0.2, 2) }
      ]
    }
  };
}

module.exports = {
  analyzePair,
  getCrowdingAnalysis,
  riskLevel,
  simulateCollision
};
