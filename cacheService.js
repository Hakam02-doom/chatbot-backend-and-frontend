import NodeCache from 'node-cache';

class CacheService {
    constructor() {
        // Initialize cache with default TTL of 1 hour (3600 seconds)
        // and check for expired keys every 600 seconds (10 minutes)
        this.cache = new NodeCache({ 
            stdTTL: 3600, // 1 hour default TTL
            checkperiod: 600, // Check for expired keys every 10 minutes
            useClones: false, // Better performance for large objects
            maxKeys: 1000 // Limit to 1000 cached items to prevent memory issues
        });

        // Statistics tracking
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };

        console.log('Cache service initialized with 1-hour TTL and 1000 key limit');
    }

    // Generate a cache key from the message
    generateKey(message) {
        // Create a hash of the message for consistent key generation
        return `chat_${this.hashString(message.toLowerCase().trim())}`;
    }

    // Simple hash function for message
    hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    // Get cached response
    get(message) {
        const key = this.generateKey(message);
        const result = this.cache.get(key);
        
        if (result) {
            this.stats.hits++;
            console.log(`Cache HIT for key: ${key}`);
            return result;
        } else {
            this.stats.misses++;
            console.log(`Cache MISS for key: ${key}`);
            return null;
        }
    }

    // Set cached response
    set(message, response, ttl = null) {
        const key = this.generateKey(message);
        const success = this.cache.set(key, response, ttl);
        
        if (success) {
            this.stats.sets++;
            console.log(`Cache SET for key: ${key}${ttl ? ` with TTL: ${ttl}s` : ''}`);
        }
        
        return success;
    }

    // Delete specific cache entry
    delete(message) {
        const key = this.generateKey(message);
        const deleted = this.cache.del(key);
        
        if (deleted > 0) {
            this.stats.deletes++;
            console.log(`Cache DELETE for key: ${key}`);
        }
        
        return deleted > 0;
    }

    // Clear all cache
    clear() {
        this.cache.flushAll();
        console.log('Cache cleared');
    }

    // Get cache statistics
    getStats() {
        const keys = this.cache.keys();
        return {
            ...this.stats,
            totalKeys: keys.length,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0,
            memoryUsage: process.memoryUsage()
        };
    }

    // Get cache info
    getInfo() {
        const keys = this.cache.keys();
        return {
            keys: keys.length,
            maxKeys: 1000,
            defaultTTL: 3600,
            stats: this.getStats()
        };
    }

    // Set custom TTL for specific types of responses
    setWithCustomTTL(message, response, category = 'general') {
        let ttl;
        
        switch (category) {
            case 'weather':
                ttl = 1800; // 30 minutes
                break;
            case 'news':
                ttl = 3600; // 1 hour
                break;
            case 'general':
                ttl = 3600; // 1 hour
                break;
            case 'code':
                ttl = 7200; // 2 hours
                break;
            default:
                ttl = 3600; // 1 hour
        }
        
        return this.set(message, response, ttl);
    }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
