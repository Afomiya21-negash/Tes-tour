// Simple in-memory cache for performance optimization
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live for each cache entry
  }

  set(key, value, ttlMs = 300000) { // Default 5 minutes TTL
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  get(key) {
    // Check if key exists and hasn't expired
    if (this.cache.has(key) && this.ttl.get(key) > Date.now()) {
      return this.cache.get(key);
    }
    
    // Remove expired entry
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.ttl.delete(key);
    }
    
    return null;
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (expiry <= now) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      totalKeys: this.cache.size,
      expiredKeys: Array.from(this.ttl.entries()).filter(([_, expiry]) => expiry <= Date.now()).length
    };
  }
}

// Global cache instance
const cache = new SimpleCache();

// Clean up expired entries every 10 minutes
setInterval(() => {
  cache.cleanup();
  if (process.env.NODE_ENV === 'development') {
    const stats = cache.getStats();
    console.log('🗄️ Cache cleanup completed:', stats);
  }
}, 600000);

export { cache };
