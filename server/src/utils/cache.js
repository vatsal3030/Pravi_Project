// ============================================
// In-Memory Cache Utility with TTL
// Reduces database roundtrip latency for heavy reads
// ============================================

class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 30) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  // Invalidate all keys matching a prefix or pattern
  invalidate(prefix = '') {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new MemoryCache();
module.exports = cache;
