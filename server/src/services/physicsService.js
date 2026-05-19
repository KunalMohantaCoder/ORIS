const { EARTH_MU_KM3_S2, EARTH_RADIUS_KM, orbitalVelocityFromAltitude, round } = require("../utils/math");

function getPhysicsConcepts() {
  return {
    data: [
      {
        title: "Orbital Velocity",
        formula: "v = sqrt(mu / r)",
        variables: "mu = Earth gravitational parameter, r = orbital radius",
        explanation:
          "A stable circular orbit balances forward velocity with gravitational acceleration toward Earth."
      },
      {
        title: "Escape Velocity",
        formula: "v_escape = sqrt(2mu / r)",
        variables: "r = distance from Earth's center",
        explanation:
          "Escape velocity is the speed needed to leave Earth's gravity well without additional propulsion."
      },
      {
        title: "Kinetic Energy",
        formula: "E_k = 1/2 mv^2",
        variables: "m = mass, v = relative velocity",
        explanation:
          "Even small debris fragments become dangerous because collision energy scales with velocity squared."
      },
      {
        title: "Momentum",
        formula: "p = mv",
        variables: "m = mass, v = velocity",
        explanation:
          "Momentum transfer during impact determines fragmentation and attitude disturbance."
      },
      {
        title: "Gravitational Force",
        formula: "F = Gm1m2 / r^2",
        variables: "G = gravitational constant, r = separation",
        explanation:
          "Orbital motion follows from inverse-square gravity and tangential velocity."
      }
    ]
  };
}

function runPhysicsCalculation(input = {}) {
  const altitudeKm = Number(input.altitudeKm || 550);
  const massKg = Number(input.massKg || 260);
  const radiusKm = EARTH_RADIUS_KM + altitudeKm;
  const orbitalVelocityKmS = orbitalVelocityFromAltitude(altitudeKm);
  const escapeVelocityKmS = Math.sqrt((2 * EARTH_MU_KM3_S2) / radiusKm);
  const kineticEnergyJ = 0.5 * massKg * (orbitalVelocityKmS * 1000) ** 2;
  const momentum = massKg * orbitalVelocityKmS * 1000;

  return {
    data: {
      altitudeKm: round(altitudeKm, 2),
      massKg: round(massKg, 2),
      orbitalVelocityKmS: round(orbitalVelocityKmS, 3),
      escapeVelocityKmS: round(escapeVelocityKmS, 3),
      kineticEnergyJ: Math.round(kineticEnergyJ),
      momentumKgMs: Math.round(momentum),
      orbitalPeriodMin: round((2 * Math.PI * radiusKm) / orbitalVelocityKmS / 60, 2)
    }
  };
}

module.exports = {
  getPhysicsConcepts,
  runPhysicsCalculation
};
