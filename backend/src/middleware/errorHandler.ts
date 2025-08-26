import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  keyValue?: any;
  errors?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  console.error('Error:', err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message);
    error = {
      ...error,
      statusCode: 400,
      message: message.join(', ')
    };
  }

  // Erreur de duplication (clé unique)
  if (err.code === '11000') {
    const message = 'Ressource déjà existante';
    error = {
      ...error,
      statusCode: 400,
      message
    };
  }

  // Erreur de cast (ID invalide)
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = {
      ...error,
      statusCode: 404,
      message
    };
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

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Erreur serveur',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};