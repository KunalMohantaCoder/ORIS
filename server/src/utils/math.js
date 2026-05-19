const EARTH_RADIUS_KM = 6371;
const EARTH_MU_KM3_S2 = 398600.4418;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function hashNumber(seed, min, max) {
  const text = String(seed || "oris");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  const normalized = Math.abs(Math.sin(hash) * 10000) % 1;
  return round(min + normalized * (max - min), 4);
}

function regimeFromAltitude(altitudeKm) {
  if (altitudeKm < 2000) return "LEO";
  if (Math.abs(altitudeKm - 35786) <= 2200) return "GEO";
  if (altitudeKm < 35786) return "MEO";
  return "HEO";
}

function orbitalVelocityFromAltitude(altitudeKm) {
  const radiusKm = EARTH_RADIUS_KM + Number(altitudeKm || 0);
  return Math.sqrt(EARTH_MU_KM3_S2 / radiusKm);
}

function altitudeFromMeanMotion(meanMotionRevPerDay) {
  const n = Number(meanMotionRevPerDay);
  if (!Number.isFinite(n) || n <= 0) return null;
  const meanMotionRadPerSecond = (n * 2 * Math.PI) / 86400;
  const semiMajorAxisKm = (EARTH_MU_KM3_S2 / meanMotionRadPerSecond ** 2) ** (1 / 3);
  return Math.max(120, semiMajorAxisKm - EARTH_RADIUS_KM);
}

function toCartesian(object) {
  const lat = ((Number(object.latitude) || 0) * Math.PI) / 180;
  const lon = ((Number(object.longitude) || 0) * Math.PI) / 180;
  const radius = EARTH_RADIUS_KM + Number(object.altitudeKm || 0);
  return {
    x: radius * Math.cos(lat) * Math.cos(lon),
    y: radius * Math.cos(lat) * Math.sin(lon),
    z: radius * Math.sin(lat)
  };
}

function distanceKm(objectA, objectB) {
  const a = toCartesian(objectA);
  const b = toCartesian(objectB);
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

module.exports = {
  EARTH_RADIUS_KM,
  EARTH_MU_KM3_S2,
  altitudeFromMeanMotion,
  clamp,
  distanceKm,
  hashNumber,
  orbitalVelocityFromAltitude,
  regimeFromAltitude,
  round
};
