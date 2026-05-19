const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = path.join(process.cwd(), "server", "src", "data");

function loadJson(fileName, fallback = []) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.warn(`[ORIS] Failed to load ${fileName}: ${error.message}`);
    return fallback;
  }
}

module.exports = { loadJson };
