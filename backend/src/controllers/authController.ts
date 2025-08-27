import { Request, Response } from 'express';
import { prisma } from '../utils/database.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';
import { validateUserData, validateLoginData, normalizePhoneNumber } from '../utils/validation.js';
import { CreateUserRequest, LoginRequest, ApiResponse, AuthResponse } from '../types/index.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHelpers.js';

// Inscription d'un nouvel utilisateur
export const register = async (req: Request, res: Response) => {
  try {
    const userData: CreateUserRequest = req.body;

    // Validation des données
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhoneNumber(userData.phone);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email.toLowerCase() },
          { phone: normalizedPhone }
        ]
      }
    });

    if (existingUser) {
      const message = existingUser.email === userData.email.toLowerCase() 
        ? 'Un compte avec cet email existe déjà'
        : 'Un compte avec ce numéro de téléphone existe déjà';
      return res.status(409).json(createErrorResponse(message, 'USER_ALREADY_EXISTS'));
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(userData.password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        phone: normalizedPhone,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        password: hashedPassword,
        role: userData.role || 'CLIENT'
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Générer le token JWT
    const token = generateToken(user);

    res.status(201).json(createSuccessResponse({
      user,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as AuthResponse));

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json(createErrorResponse('Erreur serveur lors de l\'inscription', 'REGISTRATION_ERROR'));
  }
};

// Connexion d'un utilisateur
export const login = async (req: Request, res: Response) => {
  try {
    const loginData: LoginRequest = req.body;

    // Validation des données
    const validationErrors = validateLoginData(loginData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: {
        email: loginData.email.toLowerCase()
      }
    });

    if (!user) {
      return res.status(401).json(createErrorResponse('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS'));
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json(createErrorResponse('Compte désactivé. Contactez le support.', 'ACCOUNT_DISABLED'));
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(loginData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(createErrorResponse('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS'));
    }

    // Générer le token JWT
    const token = generateToken(user);

    // Retourner les données utilisateur (sans le mot de passe)
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(createSuccessResponse({
      user: userWithoutPassword,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as AuthResponse));

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json(createErrorResponse('Erreur serveur lors de la connexion', 'LOGIN_ERROR'));
  }
};

// Obtenir le profil de l'utilisateur connecté
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('Utilisateur non authentifié', 'UNAUTHENTICATED'));
    }

    // Récupérer les données complètes de l'utilisateur avec ses relations
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            scheduledDate: true,
            totalPrice: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Les 5 dernières réservations
        },
        driver: {
          select: {
            id: true,
            licenseNumber: true,
            isAvailable: true,
            rating: true,
            totalRides: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json(createErrorResponse('Utilisateur non trouvé', 'USER_NOT_FOUND'));
    }

    res.status(200).json(createSuccessResponse(user));

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json(createErrorResponse('Erreur serveur lors de la récupération du profil', 'PROFILE_ERROR'));
  }
};

// Mettre à jour le profil de l'utilisateur
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('Utilisateur non authentifié', 'UNAUTHENTICATED'));
    }

    const { firstName, lastName, phone } = req.body;
    const updateData: any = {};

    // Validation et préparation des données à mettre à jour
    if (firstName !== undefined) {
      if (firstName.trim().length < 2) {
        return res.status(400).json(createErrorResponse('Le prénom doit contenir au moins 2 caractères', 'VALIDATION_ERROR'));
      }
      updateData.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (lastName.trim().length < 2) {
        return res.status(400).json(createErrorResponse('Le nom doit contenir au moins 2 caractères', 'VALIDATION_ERROR'));
      }
      updateData.lastName = lastName.trim();
    }

    if (phone !== undefined) {
      const normalizedPhone = normalizePhoneNumber(phone);
      
      // Vérifier si le numéro n'est pas déjà utilisé par un autre utilisateur
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: normalizedPhone,
          id: { not: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(409).json(createErrorResponse('Ce numéro de téléphone est déjà utilisé', 'PHONE_ALREADY_EXISTS'));
      }

      updateData.phone = normalizedPhone;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json(createSuccessResponse(updatedUser));

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json(createErrorResponse('Erreur serveur lors de la mise à jour du profil', 'PROFILE_UPDATE_ERROR'));
  }
};