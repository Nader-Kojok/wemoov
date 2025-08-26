# WeMoov Backend API

Backend API pour WeMoov - Service de transport au Sénégal

## 🚀 Fonctionnalités

- ✅ **Authentification JWT** - Inscription, connexion, gestion des profils
- ✅ **Gestion des réservations** - CRUD complet avec statuts et permissions
- ✅ **Modèles de données** - Users, Bookings, Vehicles, Drivers, Payments
- ✅ **Validation des données** - Validation complète des inputs
- ✅ **Sécurité** - Rate limiting, CORS, Helmet
- ✅ **Base de données** - PostgreSQL avec Prisma ORM
- 🔄 **Services de géolocalisation** - Intégration Mapbox (à implémenter)
- 🔄 **Paiements mobiles** - Wave Money/Orange Money (à implémenter)
- 🔄 **Notifications SMS** - Twilio (à implémenter)

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL 13+
- npm ou yarn

## 🛠️ Installation

### 1. Cloner et installer les dépendances

```bash
cd backend
npm install
```

### 2. Configuration de l'environnement

Copiez le fichier `.env.example` vers `.env` et configurez vos variables :

```bash
cp .env.example .env
```

**Variables importantes à configurer :**

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/wemoov_db?schema=public"

# JWT Secret (générez une clé sécurisée)
JWT_SECRET="your-super-secret-jwt-key-here"

# Port du serveur
PORT=3001

# URL du frontend pour CORS
CORS_ORIGIN="http://localhost:5173"
```

### 3. Configuration de la base de données

#### Option A : Base de données locale PostgreSQL

1. Installez PostgreSQL sur votre système
2. Créez une base de données :

```sql
CREATE DATABASE wemoov_db;
CREATE USER wemoov_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE wemoov_db TO wemoov_user;
```

3. Mettez à jour `DATABASE_URL` dans `.env`

#### Option B : Base de données cloud (Supabase)

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Copiez l'URL de connexion PostgreSQL dans `.env`

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations (créer les tables)
npm run db:push

# Optionnel : Ouvrir Prisma Studio pour visualiser les données
npm run db:studio
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3001`

### Mode production

```bash
# Compiler le TypeScript
npm run build

# Démarrer le serveur
npm start
```

## 📡 API Endpoints

### Santé du serveur
- `GET /health` - Vérifier l'état du serveur

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (protégé)
- `PUT /api/auth/profile` - Modifier le profil (protégé)

### Réservations
- `GET /api/bookings` - Liste des réservations (protégé)
- `POST /api/bookings` - Créer une réservation (protégé)
- `GET /api/bookings/:id` - Détails d'une réservation (protégé)
- `PUT /api/bookings/:id` - Modifier une réservation (protégé)
- `PATCH /api/bookings/:id/cancel` - Annuler une réservation (protégé)

### Services
- `GET /api/services` - Liste des services disponibles
- `POST /api/services/quote` - Calculer un devis

### Véhicules
- `GET /api/vehicles` - Types de véhicules disponibles
- `GET /api/vehicles/:id` - Détails d'un véhicule

### Géolocalisation
- `POST /api/geocoding/search` - Recherche d'adresses
- `POST /api/geocoding/reverse` - Géocodage inverse
- `POST /api/geocoding/directions` - Calcul d'itinéraires
- `GET /api/geocoding/zones` - Zones de service

### Paiements
- `POST /api/payments/initiate` - Initier un paiement
- `POST /api/payments/callback/wave` - Callback Wave Money
- `POST /api/payments/callback/orange` - Callback Orange Money
- `GET /api/payments/:id/status` - Statut d'un paiement

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Inscription

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+221701234567",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Utilisation du token

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Structure de la base de données

### Modèles principaux

- **User** - Utilisateurs (clients, chauffeurs, admins)
- **Driver** - Informations spécifiques aux chauffeurs
- **Vehicle** - Véhicules disponibles
- **Booking** - Réservations de transport
- **Payment** - Paiements et transactions
- **Service** - Services proposés

### Relations

- Un utilisateur peut avoir plusieurs réservations
- Un chauffeur est lié à un utilisateur
- Une réservation peut avoir plusieurs paiements
- Un véhicule peut être assigné à plusieurs chauffeurs

## 🛡️ Sécurité

- **Rate Limiting** - 100 requêtes par 15 minutes par IP
- **CORS** - Configuré pour le frontend
- **Helmet** - Headers de sécurité
- **Validation** - Validation stricte des données d'entrée
- **Hachage des mots de passe** - bcrypt avec 12 rounds

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer en mode développement
npm run build        # Compiler TypeScript
npm start           # Démarrer en production

# Base de données
npm run db:generate  # Générer le client Prisma
npm run db:push     # Appliquer le schéma à la DB
npm run db:migrate  # Créer une migration
npm run db:studio   # Ouvrir Prisma Studio
```

## 🌍 Spécificités Sénégal

### Numéros de téléphone
- Format accepté : `+221XXXXXXXXX`, `221XXXXXXXXX`, `7XXXXXXXX`, `3XXXXXXXX`
- Validation automatique et normalisation

### Zones de service
- **Dakar** : Plateau, Médina, HLM, Sicap, etc.
- **Banlieue** : Pikine, Guédiawaye, Parcelles Assainies, etc.
- **Aéroport** : AIBD (Diass)

### Services de transport
- **Navette Aéroport** : 15 000 FCFA (tarif fixe)
- **Course en ville** : À partir de 2 000 FCFA
- **Location à l'heure** : 8 000 FCFA/heure
- **Voyage inter-ville** : Sur devis
- **Événements** : Sur devis

## 🚧 Prochaines étapes

1. **Intégration Mapbox** - Géolocalisation et calcul d'itinéraires
2. **Paiements mobiles** - Wave Money et Orange Money
3. **Notifications SMS** - Confirmations et mises à jour
4. **Dashboard admin** - Interface de gestion
5. **Tests automatisés** - Tests unitaires et d'intégration

## 📞 Support

Pour toute question ou problème :
- Créez une issue sur le repository
- Contactez l'équipe de développement

## 📄 Licence

ISC - WeMoov Team