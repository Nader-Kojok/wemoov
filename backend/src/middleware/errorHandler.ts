import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validationHelpers.js';
import { createErrorResponse } from '../utils/responseHelpers.js';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  keyValue?: any;
  errors?: any;
}

/**
 * Async handler wrapper to catch async errors and pass them to error middleware
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handling middleware
 * @param error - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle validation errors
  if (error instanceof ValidationError) {
    return res.status(400).json(createErrorResponse(error.message, error.code));
  }

  // Handle Prisma errors
  if (error.code && error.code.startsWith('P')) {
    return handlePrismaError(error, res);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(createErrorResponse('Token invalide', 'INVALID_TOKEN'));
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(createErrorResponse('Token expiré', 'TOKEN_EXPIRED'));
  }

  // Handle multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(createErrorResponse('Fichier trop volumineux', 'FILE_TOO_LARGE'));
  }

  // Handle syntax errors in JSON
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json(createErrorResponse('JSON invalide', 'INVALID_JSON'));
  }

  // Legacy error handling for backward compatibility
  let err = { ...error };
  err.message = error.message;

  // Erreur de validation Mongoose (legacy)
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors || {}).map((val: any) => val.message);
    return res.status(400).json(createErrorResponse(message.join(', '), 'VALIDATION_ERROR'));
  }

  // Erreur de duplication (clé unique) (legacy)
  if (error.code === '11000') {
    return res.status(400).json(createErrorResponse('Ressource déjà existante', 'DUPLICATE_RESOURCE'));
  }

  // Erreur de cast (ID invalide) (legacy)
  if (error.name === 'CastError') {
    return res.status(404).json(createErrorResponse('Ressource non trouvée', 'RESOURCE_NOT_FOUND'));
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = {
      ...error,
      statusCode: 401,
      message
    };
  }

  // Token expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = {
      ...error,
      statusCode: 401,
      message
    };
  }

  // Default server error
  res.status(error.statusCode || 500).json(createErrorResponse(
    'Erreur interne du serveur',
    'INTERNAL_SERVER_ERROR'
  ));
};

/**
 * Handle Prisma-specific errors
 * @param error - Prisma error
 * @param res - Express response
 */
const handlePrismaError = (error: any, res: Response) => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json(createErrorResponse(
        `${field} déjà utilisé`,
        'UNIQUE_CONSTRAINT_VIOLATION'
      ));

    case 'P2025':
      // Record not found
      return res.status(404).json(createErrorResponse(
        'Ressource non trouvée',
        'RECORD_NOT_FOUND'
      ));

    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json(createErrorResponse(
        'Référence invalide',
        'FOREIGN_KEY_CONSTRAINT'
      ));

    case 'P2014':
      // Required relation missing
      return res.status(400).json(createErrorResponse(
        'Relation requise manquante',
        'REQUIRED_RELATION_MISSING'
      ));

    case 'P2021':
    case 'P2022':
      // Table/Column does not exist
      return res.status(500).json(createErrorResponse(
        'Erreur de base de données',
        'DATABASE_ERROR'
      ));

    default:
      return res.status(500).json(createErrorResponse(
        'Erreur de base de données',
        'DATABASE_ERROR'
      ));
  }
};

/**
 * Not found middleware for unmatched routes
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json(createErrorResponse(
    `Route ${req.originalUrl} non trouvée`,
    'ROUTE_NOT_FOUND'
  ));
};