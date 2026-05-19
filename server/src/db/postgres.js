const { Pool } = require("pg");
const { databaseUrl } = require("../config/env");

let pool;

function getPool() {
  if (!databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const activePool = getPool();
  if (!activePool) return null;
  return activePool.query(sql, params);
}

module.exports = { getPool, query };
