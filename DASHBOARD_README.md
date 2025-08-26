# Dashboard d'Administration WeMoov

Tableau de bord complet pour la gestion de la plateforme WeMoov.

## 🚀 Fonctionnalités Implémentées

### ✅ Fonctionnalités Principales

#### 1. **Vue d'ensemble (Dashboard)**
- Statistiques générales en temps réel
- Métriques des utilisateurs (total, clients, chauffeurs, actifs)
- Statistiques des réservations (total, en attente, terminées, annulées)
- Revenus totaux et mensuels
- État des véhicules disponibles
- Actions rapides pour les tâches courantes

#### 2. **Gestion des Utilisateurs**
- Liste paginée de tous les utilisateurs
- Filtrage par rôle (Client, Chauffeur, Admin)
- Recherche par nom, email ou téléphone
- Activation/désactivation des comptes
- Détails complets des utilisateurs
- Historique des réservations par utilisateur

#### 3. **Gestion des Réservations**
- Liste complète des réservations avec pagination
- Filtrage par statut et type de service
- Assignation de chauffeurs aux réservations
- Suivi en temps réel des statuts
- Informations détaillées des trajets
- Gestion des paiements associés

#### 4. **Authentification Sécurisée**
- Connexion admin avec JWT
- Protection des routes par rôle
- Vérification automatique des tokens
- Déconnexion sécurisée

### 🔄 Fonctionnalités à Venir

#### 1. **Gestion des Chauffeurs & Véhicules**
- Liste des chauffeurs avec leurs véhicules
- Gestion des disponibilités
- Historique des courses
- Évaluations et commentaires

#### 2. **Gestion des Paiements**
- Suivi des transactions
- Rapports financiers
- Gestion des remboursements
- Intégration Wave Money/Orange Money

#### 3. **Statistiques Avancées**
- Graphiques de performance
- Analyses de tendances
- Rapports personnalisés
- Export des données

## 🛠️ Installation et Configuration

### Prérequis
- Node.js 18+
- PostgreSQL
- Backend WeMoov configuré

### 1. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer la base de données
npm run db:generate
npm run db:push

# Créer un utilisateur admin
npm run create-admin

# Démarrer le serveur
npm run dev
```

### 2. Configuration Frontend

```bash
# Installer les dépendances (depuis la racine)
npm install

# Démarrer le serveur de développement
npm run dev
```

## 🔐 Accès au Dashboard

### URL d'accès
- **Connexion**: http://localhost:5173/admin/login
- **Dashboard**: http://localhost:5173/dashboard

### Compte Admin par Défaut
- **Email**: admin@wemoov.com
- **Mot de passe**: admin123

> ⚠️ **Important**: Changez ces identifiants en production !

## 📊 API Endpoints du Dashboard

Tous les endpoints nécessitent une authentification admin (`Authorization: Bearer <token>`).

### Statistiques
- `GET /api/dashboard/stats` - Statistiques générales
- `GET /api/dashboard/revenue?period=month` - Revenus par période

### Utilisateurs
- `GET /api/dashboard/users` - Liste des utilisateurs
- `GET /api/dashboard/users/:id` - Détails d'un utilisateur
- `PATCH /api/dashboard/users/:id/status` - Activer/désactiver un utilisateur

### Réservations
- `GET /api/dashboard/bookings` - Liste des réservations
- `PATCH /api/dashboard/bookings/:id/assign` - Assigner un chauffeur
- `GET /api/dashboard/drivers/available` - Chauffeurs disponibles

## 🎨 Interface Utilisateur

### Design System
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **Icônes**: Lucide React
- **Composants**: Radix UI

### Fonctionnalités UX
- Interface responsive (mobile, tablette, desktop)
- Navigation intuitive avec sidebar
- Recherche et filtrage en temps réel
- Pagination automatique
- Modales pour les actions importantes
- Feedback visuel pour toutes les actions

## 🔒 Sécurité

### Authentification
- JWT avec expiration
- Vérification des rôles
- Protection CSRF
- Validation des données

### Autorisations
- Accès limité aux administrateurs
- Vérification des permissions sur chaque route
- Logs des actions sensibles

## 📱 Responsive Design

Le dashboard est entièrement responsive :
- **Mobile** (< 768px): Navigation en overlay
- **Tablette** (768px - 1024px): Sidebar collapsible
- **Desktop** (> 1024px): Sidebar fixe

## 🚀 Déploiement

### Variables d'Environnement

```env
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3001
CORS_ORIGIN="https://your-domain.com"

# Frontend
VITE_API_URL="https://api.your-domain.com"
```

### Build de Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
# Servir les fichiers du dossier dist/
```

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de connexion à la base de données**
   - Vérifiez `DATABASE_URL` dans `.env`
   - Assurez-vous que PostgreSQL est démarré

2. **Token invalide**
   - Vérifiez `JWT_SECRET` dans `.env`
   - Reconnectez-vous au dashboard

3. **CORS Error**
   - Vérifiez `CORS_ORIGIN` dans le backend
   - Assurez-vous que les URLs correspondent

### Logs

```bash
# Logs du backend
cd backend
npm run dev

# Logs du frontend
npm run dev
```

## 📈 Métriques et Performance

### Optimisations Implémentées
- Pagination pour les grandes listes
- Recherche côté serveur
- Cache des statistiques
- Lazy loading des composants

### Monitoring
- Logs des erreurs
- Temps de réponse API
- Utilisation mémoire

## 🤝 Contribution

### Structure du Code

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── DashboardLayout.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── UsersManagement.tsx
│   │   └── BookingsManagement.tsx
│   ├── AdminLogin.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   └── Dashboard.tsx
└── main.tsx

backend/src/
├── controllers/
│   └── dashboardController.ts
├── routes/
│   └── dashboard.ts
└── scripts/
    └── create-admin.js
```

### Standards de Code
- TypeScript strict
- ESLint + Prettier
- Composants fonctionnels React
- Hooks personnalisés pour la logique

## 📞 Support

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez les logs d'erreur
3. Créez une issue sur le repository

---

**WeMoov Dashboard v1.0** - Tableau de bord d'administration complet pour la gestion de votre plateforme de transport.