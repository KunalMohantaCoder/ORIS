const { getSourcesBySections } = require("../config/apiRegistry");
const { round } = require("../utils/math");
const { loadJson } = require("./dataLoader");
const { fetchApiSource } = require("./httpClient");
const { normalizeOrbitalPayload } = require("./normalizers");

const ORBITAL_SECTIONS = [
  "[ORBITAL DATA APIs]",
  "[SPACE DEBRIS APIs]",
  "[SATELLITE TRACKING APIs]"
];

function dedupeObjects(objects) {
  const map = new Map();
  objects.forEach((object) => {
    const key = object.noradId ? `norad:${object.noradId}` : object.id;
    if (!map.has(key)) {
      map.set(key, object);
    }
  });
  return [...map.values()];
}

async function fetchConfiguredObjects() {
  const sources = getSourcesBySections(ORBITAL_SECTIONS);
  const records = [];
  const sourceReports = [];

  await Promise.all(
    sources.map(async (source) => {
      try {
        const response = await fetchApiSource(source);
        const normalized = normalizeOrbitalPayload(response.body, source);
        const limited = normalized.slice(0, Number(source.limit || 500));
        records.push(...limited);
        sourceReports.push({
          name: source.name,
          url: source.displayUrl || source.url,
          status: "online",
          records: limited.length,
          cached: response.cached,
          fetchedAt: response.fetchedAt
        });
      } catch (error) {
        sourceReports.push({
          name: source.name,
          url: source.displayUrl || source.url,
          status: "fallback",
          records: 0,
          error: error.message
        });
      }
    })
  );

  return { objects: dedupeObjects(records), sourceReports };
}

function loadFallbackObjects() {
  return loadJson("orbitalObjects.json", []);
}

function applyFilters(objects, query = {}) {
  const search = String(query.search || "").toLowerCase();
  const type = String(query.type || "all").toLowerCase();
  const regime = String(query.regime || "all").toUpperCase();
  const limit = Math.min(Number(query.limit || 1200), 2500);

  return objects
    .filter((object) => (type === "all" ? true : object.type === type))
    .filter((object) => (regime === "ALL" ? true : object.regime === regime))
    .filter((object) => {
      if (!search) return true;
      return (
        object.name.toLowerCase().includes(search) ||
        String(object.noradId).includes(search) ||
        object.regime.toLowerCase().includes(search)
      );
    })
    .slice(0, limit);
}

async function getOrbitalObjects(query = {}) {
  const remote = await fetchConfiguredObjects();
  const fallback = loadFallbackObjects();
  const objects = remote.objects.length >= 20 ? remote.objects : fallback;

  return {
    data: applyFilters(objects, query),
    meta: {
      mode: remote.objects.length >= 20 ? "live-free-api" : "fallback-dataset",
      totalAvailable: objects.length,
      filtered: applyFilters(objects, query).length,
      sources: remote.sourceReports
    }
  };
}

function summarize(objects) {
  const byType = objects.reduce((acc, object) => {
    acc[object.type] = (acc[object.type] || 0) + 1;
    return acc;
  }, {});
  const byRegime = objects.reduce((acc, object) => {
    acc[object.regime] = (acc[object.regime] || 0) + 1;
    return acc;
  }, {});
  const altitudeAverage =
    objects.reduce((total, object) => total + Number(object.altitudeKm || 0), 0) / Math.max(objects.length, 1);
  const debrisPressure = round(((byType.debris || 0) / Math.max(objects.length, 1)) * 100, 2);
  const leoCrowding = round(((byRegime.LEO || 0) / Math.max(objects.length, 1)) * 100, 2);

  return {
    totalObjects: objects.length,
    activeSatellites: byType.active || 0,
    inactiveSatellites: byType.inactive || 0,
    debrisObjects: byType.debris || 0,
    byType,
    byRegime,
    averageAltitudeKm: round(altitudeAverage, 2),
    debrisPressure,
    leoCrowding,
    riskPosture:
      debrisPressure > 35 || leoCrowding > 72 ? "critical" : debrisPressure > 22 ? "high" : "elevated",
    updatedAt: new Date().toISOString()
  };
}

async function getOrbitalSummary() {
  const { data, meta } = await getOrbitalObjects({ limit: 2500 });
  return {
    data: summarize(data),
    meta
  };
}

function altitudeBand(altitudeKm) {
  if (altitudeKm < 500) return "120-500 km";
  if (altitudeKm < 800) return "500-800 km";
  if (altitudeKm < 1200) return "800-1200 km";
  if (altitudeKm < 2000) return "1200-2000 km";
  if (altitudeKm < 25000) return "MEO shell";
  if (altitudeKm < 38000) return "GEO belt";
  return "High elliptical";
}

async function getOrbitalHeatmap() {
  const { data, meta } = await getOrbitalObjects({ limit: 2500 });
  const grouped = new Map();
  data.forEach((object) => {
    const key = `${object.regime}:${altitudeBand(object.altitudeKm)}`;
    const current = grouped.get(key) || {
      regime: object.regime,
      band: altitudeBand(object.altitudeKm),
      active: 0,
      inactive: 0,
      debris: 0,
      total: 0,
      riskScore: 0
    };
    current[object.type] += 1;
    current.total += 1;
    current.riskScore = round(current.debris * 2.7 + current.inactive * 1.6 + current.active * 0.6, 2);
    grouped.set(key, current);
  });

  return {
    data: [...grouped.values()].sort((a, b) => b.riskScore - a.riskScore),
    meta
  };
}

module.exports = {
  getOrbitalHeatmap,
  getOrbitalObjects,
  getOrbitalSummary,
  summarize
};
