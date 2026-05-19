const cache = new Map();

function getCache(key) {
  const record = cache.get(key);
  if (!record) return null;
  if (record.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return record.value;
}

function setCache(key, value, ttlMs) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

function clearCache() {
  cache.clear();
}

module.exports = { clearCache, getCache, setCache };
