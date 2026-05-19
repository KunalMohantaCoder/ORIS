const { apiCacheTtlMs } = require("../config/env");
const { getCache, setCache } = require("./cache");

async function fetchApiSource(source, options = {}) {
  if (source.missingEnv?.length) {
    throw new Error(`Missing environment variable(s): ${source.missingEnv.join(", ")}`);
  }

  const method = source.method || "GET";
  const cacheKey = `${method}:${source.url}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 12000);

  try {
    const response = await fetch(source.url, {
      method,
      headers: source.headers || {},
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    const result = {
      body,
      cached: false,
      fetchedAt: new Date().toISOString(),
      source: {
        name: source.name,
        url: source.url,
        section: source.section,
        type: source.type || "generic-json"
      }
    };
    setCache(cacheKey, result, source.ttlMs || apiCacheTtlMs);
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { fetchApiSource };
