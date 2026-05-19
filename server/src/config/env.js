const path = require("node:path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

module.exports = {
  apiCacheTtlMs: Number(process.env.API_CACHE_TTL_SECONDS || 900) * 1000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL || "",
  disableDefaultFreeApis: String(process.env.DISABLE_DEFAULT_FREE_APIS || "false") === "true",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000)
};
