const { round } = require("../utils/math");
const { query } = require("../db/postgres");
const { loadJson } = require("./dataLoader");

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "Unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function objectToChartRows(object, nameKey = "name", valueKey = "value") {
  return Object.entries(object).map(([name, value]) => ({
    [nameKey]: name,
    [valueKey]: value
  }));
}

function monthKey(dateLike) {
  const date = new Date(dateLike);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function scorePriority(value) {
  return { Low: 1, Medium: 2, High: 3, Critical: 4 }[value] || 1;
}

async function getSurveyAnalytics() {
  let responses = loadJson("surveyResponses.json", []);
  try {
    const dbRows = await query(
      `select
        submitted_at as "submittedAt",
        awareness_level as "awarenessLevel",
        gps_dependency as "gpsDependency",
        communication_dependency as "communicationDependency",
        sustainability_priority as "sustainabilityPriority",
        age_group as "ageGroup",
        region
      from survey_responses
      order by submitted_at asc`
    );
    if (dbRows?.rows?.length) responses = dbRows.rows;
  } catch (error) {
    console.warn(`[ORIS] Survey database read skipped: ${error.message}`);
  }
  const trends = responses.reduce((acc, row) => {
    const key = monthKey(row.submittedAt);
    const current = acc.get(key) || {
      month: key,
      responses: 0,
      highAwareness: 0,
      dailyGps: 0,
      sustainabilityScore: 0
    };
    current.responses += 1;
    current.highAwareness += row.awarenessLevel === "High" ? 1 : 0;
    current.dailyGps += row.gpsDependency === "Daily" ? 1 : 0;
    current.sustainabilityScore += scorePriority(row.sustainabilityPriority);
    acc.set(key, current);
    return acc;
  }, new Map());

  const trendRows = [...trends.values()].map((row) => ({
    ...row,
    highAwarenessPercent: round((row.highAwareness / row.responses) * 100, 1),
    dailyGpsPercent: round((row.dailyGps / row.responses) * 100, 1),
    sustainabilityScore: round((row.sustainabilityScore / row.responses) * 25, 1)
  }));

  const dailyGps = responses.filter((row) => row.gpsDependency === "Daily").length;
  const dailyComms = responses.filter((row) => row.communicationDependency === "Daily").length;
  const highOrCritical = responses.filter((row) => ["High", "Critical"].includes(row.sustainabilityPriority)).length;

  return {
    data: {
      totalResponses: responses.length,
      awareness: objectToChartRows(countBy(responses, "awarenessLevel")),
      gpsDependency: objectToChartRows(countBy(responses, "gpsDependency")),
      communicationDependency: objectToChartRows(countBy(responses, "communicationDependency")),
      sustainabilityPriority: objectToChartRows(countBy(responses, "sustainabilityPriority")),
      regionMix: objectToChartRows(countBy(responses, "region")),
      ageGroups: objectToChartRows(countBy(responses, "ageGroup")),
      trendRows,
      insight: {
        dailyGpsPercent: round((dailyGps / responses.length) * 100, 1),
        dailyCommunicationPercent: round((dailyComms / responses.length) * 100, 1),
        sustainabilitySupportPercent: round((highOrCritical / responses.length) * 100, 1)
      },
      responses
    }
  };
}

module.exports = { getSurveyAnalytics };
