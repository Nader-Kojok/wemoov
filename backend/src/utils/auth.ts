import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

// Interface pour le payload JWT
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Hacher un mot de passe
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Erreur lors du hachage du mot de passe');
  }
};

// Vérifier un mot de passe
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Erreur lors de la vérification du mot de passe');
  }
};

// Générer un token JWT
export const generateToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  try {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'wemoov-api',
      audience: 'wemoov-client'
    } as jwt.SignOptions);
  } catch (error) {
    throw new Error('Erreur lors de la génération du token');
  }
};

// Vérifier et décoder un token JWT
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'wemoov-api',
      audience: 'wemoov-client'
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expiré');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token invalide');
    }
    throw new Error('Erreur lors de la vérification du token');
  }
};

// Extraire le token du header Authorization
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

// Générer un token de réinitialisation de mot de passe
export const generateResetToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Générer un code de vérification SMS (6 chiffres)
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Vérifier si un token est expiré
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

// Obtenir le temps d'expiration d'un token
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Créer un token de session temporaire (pour les opérations sensibles)
export const generateSessionToken = (userId: string, action: string): string => {
  try {
    const payload = {
      userId,
      action,
      type: 'session'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '15m', // 15 minutes pour les opérations sensibles
      issuer: 'wemoov-api',
      audience: 'wemoov-session'
    });
  } catch (error) {
    throw new Error('Erreur lors de la génération du token de session');
  }
};