// Système de cache simple en mémoire pour optimiser les requêtes fréquentes

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  /**
   * Récupère une valeur du cache
   * @param key Clé du cache
   * @returns La valeur si elle existe et n'est pas expirée, sinon null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier si l'élément a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Stocke une valeur dans le cache
   * @param key Clé du cache
   * @param data Données à stocker
   * @param ttl Durée de vie en millisecondes (défaut: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Supprime une valeur du cache
   * @param key Clé du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoie les éléments expirés du cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retourne la taille actuelle du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Récupère ou calcule une valeur avec mise en cache automatique
   * @param key Clé du cache
   * @param fetchFunction Fonction pour récupérer les données si elles ne sont pas en cache
   * @param ttl Durée de vie en millisecondes
   * @returns La valeur mise en cache ou nouvellement calculée
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    // Essayer de récupérer depuis le cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si pas en cache, exécuter la fonction et mettre en cache
    const data = await fetchFunction();
    this.set(key, data, ttl);
    return data;
  }
}

// Instance globale du cache
export const cache = new MemoryCache();

// Nettoyer le cache toutes les 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Types pour les clés de cache communes
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard:stats',
  USER_COUNT: 'users:count',
  BOOKING_COUNT: 'bookings:count',
  REVENUE_STATS: 'payments:revenue'
} as const;

// Durées de cache communes (en millisecondes)
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000  // 1 heure
} as const;