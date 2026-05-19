const {
  altitudeFromMeanMotion,
  hashNumber,
  orbitalVelocityFromAltitude,
  regimeFromAltitude,
  round
} = require("../utils/math");

function estimateMassKg(type, altitudeKm, name = "") {
  if (type === "debris") return hashNumber(name, 0.8, 85);
  if (String(name).toLowerCase().includes("station")) return hashNumber(name, 350000, 430000);
  if (altitudeKm > 30000) return hashNumber(name, 900, 4200);
  if (altitudeKm > 2000) return hashNumber(name, 350, 1800);
  return hashNumber(name, 120, 1300);
}

function normalizeObjectType(raw, source) {
  const category = String(source.category || source.section || "").toLowerCase();
  const name = String(raw.OBJECT_NAME || raw.name || raw.objectName || "").toLowerCase();
  const rawType = String(raw.type || raw.object_type || raw.objectType || "").toLowerCase();
  if (category.includes("debris") || name.includes("debris") || name.includes("deb") || rawType.includes("debris")) {
    return "debris";
  }
  if (
    rawType.includes("inactive") ||
    rawType.includes("rocket") ||
    name.includes("rocket body") ||
    name.includes("upper stage") ||
    /\br\/b\b/.test(name)
  ) {
    return "inactive";
  }
  return "active";
}

function normalizeOrbitalRecord(raw, source = {}, index = 0) {
  const name = raw.OBJECT_NAME || raw.objectName || raw.name || raw.OBJECT || `Unclassified Object ${index + 1}`;
  const noradId = Number(raw.NORAD_CAT_ID || raw.noradId || raw.norad_id || raw.catalogNumber || index + 100000);
  const inclinationDeg = Number(raw.INCLINATION || raw.inclinationDeg || raw.inclination || 0);
  const meanMotion = Number(raw.MEAN_MOTION || raw.meanMotion || raw.mean_motion || 0);
  const explicitAltitude = Number(raw.altitudeKm || raw.altitude_km || raw.apogeeKm || raw.ALTITUDE_KM);
  const altitudeKm = Number.isFinite(explicitAltitude) && explicitAltitude > 0
    ? explicitAltitude
    : altitudeFromMeanMotion(meanMotion) || hashNumber(`${name}-${noradId}`, 420, 36000);
  const type = normalizeObjectType(raw, source);
  const regime = raw.regime || regimeFromAltitude(altitudeKm);
  const velocityKmS = Number(raw.velocityKmS || raw.velocity_kms || orbitalVelocityFromAltitude(altitudeKm));
  const latitude = Number.isFinite(Number(raw.latitude || raw.latitude_deg))
    ? Number(raw.latitude || raw.latitude_deg)
    : hashNumber(`${noradId}-lat`, -58, 58);
  const longitude = Number.isFinite(Number(raw.longitude || raw.longitude_deg))
    ? Number(raw.longitude || raw.longitude_deg)
    : hashNumber(`${noradId}-lon`, -180, 180);

  return {
    id: String(raw.id || noradId || `${source.name}-${index}`),
    noradId,
    name: String(name).replace(/\s+/g, " ").trim(),
    type,
    status: type,
    regime,
    altitudeKm: round(altitudeKm, 2),
    inclinationDeg: round(inclinationDeg, 2),
    eccentricity: round(Number(raw.ECCENTRICITY || raw.eccentricity || 0), 5),
    velocityKmS: round(velocityKmS, 3),
    massKg: round(Number(raw.massKg || raw.mass_kg || estimateMassKg(type, altitudeKm, name)), 2),
    latitude: round(latitude, 4),
    longitude: round(longitude, 4),
    orbitalPeriodMin: round(meanMotion > 0 ? 1440 / meanMotion : (2 * Math.PI * (6371 + altitudeKm)) / velocityKmS / 60, 2),
    launchYear: Number(raw.LAUNCH_DATE ? String(raw.LAUNCH_DATE).slice(0, 4) : raw.launchYear || hashNumber(name, 1985, 2025).toFixed(0)),
    country: raw.COUNTRY || raw.country || "Public catalog",
    source: source.name || raw.source || "Fallback dataset"
  };
}

function payloadToArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return payloadToArray(parsed);
    } catch {
      return [];
    }
  }
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && Array.isArray(payload.objects)) return payload.objects;
  return [];
}

function normalizeOrbitalPayload(payload, source = {}) {
  return payloadToArray(payload)
    .map((record, index) => normalizeOrbitalRecord(record, source, index))
    .filter((record) => Number.isFinite(record.altitudeKm));
}

module.exports = {
  normalizeOrbitalPayload,
  normalizeOrbitalRecord
};
