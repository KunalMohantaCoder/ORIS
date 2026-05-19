const fs = require("node:fs");
const path = require("node:path");
const { disableDefaultFreeApis } = require("./env");

const INPUT_FILE = path.join(process.cwd(), "config", "FREE_API_INPUT_SECTION.md");
const DEFAULT_FILE = path.join(process.cwd(), "config", "default-free-apis.json");

const SECTIONS = [
  "[ORBITAL DATA APIs]",
  "[SPACE DEBRIS APIs]",
  "[SATELLITE TRACKING APIs]",
  "[EARTH / SPACE VISUALIZATION APIs]",
  "[PHYSICS / EDUCATIONAL DATA APIs]",
  "[SURVEY / ANALYTICS APIs]"
];

const ENV_PATTERN = /\$\{([A-Z0-9_]+)\}/gi;

function collectEnvPlaceholders(value, names = new Set()) {
  if (typeof value === "string") {
    [...value.matchAll(ENV_PATTERN)].forEach((match) => names.add(match[1]));
    return names;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectEnvPlaceholders(item, names));
    return names;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectEnvPlaceholders(item, names));
  }
  return names;
}

function resolveEnvPlaceholders(value) {
  if (typeof value === "string") {
    return value.replace(ENV_PATTERN, (_, name) => process.env[name] || "");
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveEnvPlaceholders(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveEnvPlaceholders(item)])
    );
  }
  return value;
}

function maskSensitiveUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.forEach((value, key) => {
      if (/key|token|secret|password|signature/i.test(key)) {
        parsed.searchParams.set(key, value ? "***" : "");
      }
    });
    return parsed.toString();
  } catch {
    return url.replace(/([?&][^=]*(?:key|token|secret|password|signature)[^=]*=)[^&]+/gi, "$1***");
  }
}

function prepareSource(source, section) {
  const placeholders = [
    ...collectEnvPlaceholders(source.url),
    ...collectEnvPlaceholders(source.headers)
  ];
  const missingEnv = [...new Set(placeholders)].filter((name) => !process.env[name]);
  return {
    ...resolveEnvPlaceholders(source),
    section,
    displayUrl: maskSensitiveUrl(source.url),
    missingEnv
  };
}

function readDefaults() {
  if (disableDefaultFreeApis) return {};
  try {
    return JSON.parse(fs.readFileSync(DEFAULT_FILE, "utf8"));
  } catch (error) {
    console.warn(`[ORIS] Default API registry unavailable: ${error.message}`);
    return {};
  }
}

function parseSourceLine(line, section) {
  const trimmed = line.replace(/^-+\s*/, "").replace(/^[-*]\s*/, "").trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    trimmed === "PASTE APIs HERE" ||
    trimmed.includes("FREE API INPUT SECTION") ||
    trimmed === "--------------------------------------------------"
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && parsed.url) {
      return {
        enabled: true,
        free: true,
        name: parsed.name || parsed.url,
        type: parsed.type || "generic-json",
        section,
        ...parsed
      };
    }
  } catch {
    // Plain URL and KEY=URL formats are supported below.
  }

  const keyValue = trimmed.match(/^([^=]+)=(https?:\/\/.+)$/i);
  if (keyValue) {
    return {
      enabled: true,
      free: true,
      name: keyValue[1].trim(),
      type: "generic-json",
      url: keyValue[2].trim(),
      section
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return {
      enabled: true,
      free: true,
      name: trimmed,
      type: "generic-json",
      url: trimmed,
      section
    };
  }

  return null;
}

function readUserSources() {
  const sources = {};
  try {
    const text = fs.readFileSync(INPUT_FILE, "utf8");
    let currentSection = null;

    text.split(/\r?\n/).forEach((line) => {
      const sectionMatch = line.trim().match(/^\[(.+)]$/);
      if (sectionMatch) {
        currentSection = `[${sectionMatch[1]}]`;
        if (!sources[currentSection]) sources[currentSection] = [];
        return;
      }
      if (!currentSection) return;
      const source = parseSourceLine(line, currentSection);
      if (source) {
        sources[currentSection].push(source);
      }
    });
  } catch (error) {
    console.warn(`[ORIS] User API input section unavailable: ${error.message}`);
  }
  return sources;
}

function getRegistry() {
  const defaults = readDefaults();
  const userSources = readUserSources();
  return SECTIONS.reduce((registry, section) => {
    registry[section] = [
      ...(defaults[section] || []).map((source) => ({ section, enabled: true, ...source })),
      ...(userSources[section] || [])
    ]
      .map((source) => prepareSource(source, section))
      .filter((source) => source.enabled !== false && source.url);
    return registry;
  }, {});
}

function getSourcesBySections(sections) {
  const registry = getRegistry();
  return sections.flatMap((section) => registry[section] || []);
}

function getTransparencyReport() {
  const registry = getRegistry();
  return SECTIONS.map((section) => ({
    section,
    sources: (registry[section] || []).map((source) => ({
      name: source.name,
      url: source.displayUrl || maskSensitiveUrl(source.url),
      type: source.type || "generic-json",
      category: source.category || "unclassified",
      free: source.free !== false,
      missingEnv: source.missingEnv || [],
      userConfigured: !String(source.name || "").startsWith("CelesTrak")
    }))
  }));
}

module.exports = {
  SECTIONS,
  getRegistry,
  getSourcesBySections,
  getTransparencyReport,
  maskSensitiveUrl
};
