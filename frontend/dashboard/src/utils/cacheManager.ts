import { ProcessedCronograma } from '../utils/cronogramaOperacionalProcessorPFUS3';

interface CacheEntry {
  data: ProcessedCronograma;
  timestamp: number;
  hash: string;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  get(key: string, content: string): ProcessedCronograma | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now - entry.timestamp > this.CACHE_DURATION;
    const hashChanged = entry.hash !== this.generateHash(content);

    if (isExpired || hashChanged) {
      this.cache.delete(key);
      return null;
    }

    console.log('✅ Cache hit for key:', key);
    return entry.data;
  }

  set(key: string, content: string, data: ProcessedCronograma): void {
    const hash = this.generateHash(content);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      hash,
    };

    this.cache.set(key, entry);
    console.log('💾 Cached data for key:', key);
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheManager = CacheManager.getInstance();
