import { Request, Response, NextFunction } from 'express';

// Simple rate limiter en mémoire (pour la production, utilisez Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const clientData = requestCounts.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    // Nouveau client ou fenêtre expirée
    requestCounts.set(clientIP, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      }
    });
  }
  
  // Incrémenter le compteur
  clientData.count++;
  requestCounts.set(clientIP, clientData);
  
  // Ajouter les headers de rate limiting
  res.set({
    'X-RateLimit-Limit': MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': (MAX_REQUESTS - clientData.count).toString(),
    'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
  });
  
  next();
};

// Nettoyer les anciens enregistrements toutes les heures
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 3600000); // 1 heure