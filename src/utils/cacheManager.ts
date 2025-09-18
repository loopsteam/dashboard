// 缓存工具类
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; expiresIn: number }>;

  constructor() {
    this.cache = new Map();
  }

  // 设置缓存
  set(key: string, data: any, expiresInMinutes: number = 5): void {
    const expiresIn = Date.now() + (expiresInMinutes * 60 * 1000);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
    
    // 持久化到localStorage
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        expiresIn
      }));
    } catch (error) {
      console.warn('无法保存缓存到localStorage:', error);
    }
  }

  // 获取缓存
  get(key: string): any | null {
    // 先从内存缓存获取
    let cacheItem = this.cache.get(key);
    
    // 如果内存中没有，尝试从localStorage获取
    if (!cacheItem) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          cacheItem = JSON.parse(stored);
          if (cacheItem) {
            this.cache.set(key, cacheItem);
          }
        }
      } catch (error) {
        console.warn('无法从localStorage读取缓存:', error);
      }
    }

    if (!cacheItem) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > cacheItem.expiresIn) {
      this.delete(key);
      return null;
    }

    return cacheItem.data;
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('无法从localStorage删除缓存:', error);
    }
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('无法清空localStorage缓存:', error);
    }
  }

  // 检查缓存是否存在且有效
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// 导出单例实例
export const cacheManager = new CacheManager();