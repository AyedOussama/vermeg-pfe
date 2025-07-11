// ============================================================================
// CACHE HOOK - Simple in-memory cache for better performance
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum cache size (default: 100)
}

/**
 * Simple in-memory cache hook for API responses and computed data
 */
export const useCache = <T = any>(options: CacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutes default TTL
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [, forceUpdate] = useState({});

  // Force re-render when cache changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Clean expired entries
  const cleanExpired = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
      }
    }
  }, []);

  // Set cache entry
  const set = useCallback((key: string, data: T, customTtl?: number) => {
    const cache = cacheRef.current;
    
    // Clean expired entries first
    cleanExpired();
    
    // If cache is full, remove oldest entry
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    });
    
    triggerUpdate();
  }, [ttl, maxSize, cleanExpired, triggerUpdate]);

  // Get cache entry
  const get = useCallback((key: string): T | null => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
      triggerUpdate();
      return null;
    }
    
    return entry.data;
  }, [triggerUpdate]);

  // Check if key exists and is valid
  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  // Remove specific key
  const remove = useCallback((key: string) => {
    const cache = cacheRef.current;
    const deleted = cache.delete(key);
    if (deleted) {
      triggerUpdate();
    }
    return deleted;
  }, [triggerUpdate]);

  // Clear all cache
  const clear = useCallback(() => {
    cacheRef.current.clear();
    triggerUpdate();
  }, [triggerUpdate]);

  // Get cache stats
  const getStats = useCallback(() => {
    const cache = cacheRef.current;
    cleanExpired();
    
    return {
      size: cache.size,
      maxSize,
      keys: Array.from(cache.keys())
    };
  }, [maxSize, cleanExpired]);

  // Auto-cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(cleanExpired, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, [cleanExpired]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getStats
  };
};

/**
 * Hook for caching API responses with automatic fetching
 */
export const useCachedApi = <T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) => {
  const { enabled = true, ...cacheOptions } = options;
  const cache = useCache<T>(cacheOptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return null;

    // Return cached data if available and not forcing refresh
    if (!forceRefresh && cache.has(key)) {
      return cache.get(key);
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetcher();
      cache.set(key, data);
      setLoading(false);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [key, fetcher, enabled, cache]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (enabled && !cache.has(key)) {
      fetchData().catch(() => {
        // Error is already handled in fetchData
      });
    }
  }, [key, enabled, cache, fetchData]);

  return {
    data: cache.get(key),
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate: () => cache.remove(key)
  };
};

/**
 * Hook for caching computed values
 */
export const useMemoCache = <T = any>(
  key: string,
  computeFn: () => T,
  dependencies: any[],
  ttl?: number
) => {
  const cache = useCache<T>({ ttl });
  
  return useCallback(() => {
    const cacheKey = `${key}-${JSON.stringify(dependencies)}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    const result = computeFn();
    cache.set(cacheKey, result, ttl);
    return result;
  }, [key, computeFn, dependencies, cache, ttl]);
};
