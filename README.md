# WeMoov - Service de Transport au Sénégal

🚗 **WeMoov** est une plateforme de transport moderne pour le Sénégal, offrant des services de réservation de véhicules avec chauffeur, navettes aéroport, et solutions de transport d'entreprise.

## 🌟 Fonctionnalités

### Frontend (React + TypeScript)
- 🎨 Interface utilisateur moderne et responsive
- 🗺️ Intégration Mapbox pour la géolocalisation
- 📱 Design mobile-first avec Tailwind CSS
- 🔐 Authentification sécurisée
- 📊 Dashboard administrateur complet
- 🚀 Optimisé pour les performances

### Backend (Node.js + Express)
- 🔒 API REST sécurisée avec JWT
- 🗄️ Base de données PostgreSQL avec Prisma ORM
- 💳 Intégration paiements mobiles (Wave Money, Orange Money)
- 📧 Notifications SMS via Twilio
- 🛡️ Sécurité avancée (rate limiting, CORS, validation)
- 📈 Monitoring et logs détaillés

## 🚀 Déploiement

### Déploiement Rapide sur Vercel

```bash
# 1. Cloner le projet
git clone <your-repo-url>
cd wemoov

# 2. Utiliser le script de déploiement automatique
./deploy.sh
```

### Déploiement Manuel

1. **Prérequis**: Compte Vercel + Base de données PostgreSQL
2. **Configuration**: Voir [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
3. **Variables d'environnement**: Copier `.env.production.example`
4. **Déployer**: `vercel --prod`

## 🛠️ Développement Local

### Installation

```bash
# Installer les dépendances
npm install
cd backend && npm install && cd ..

# Configuration de la base de données
cd backend
cp .env.example .env
# Éditer .env avec vos paramètres
npm run db:generate
npm run db:push
npm run create-admin
```

### Démarrage

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Accès
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Dashboard Admin**: http://localhost:5173/admin/login
- **API Health**: http://localhost:3001/api/health

## 📁 Structure du Projet

```
wemoov/
├── src/                    # Frontend React
│   ├── components/         # Composants UI
│   ├── pages/             # Pages principales
│   └── types/             # Types TypeScript
├── backend/               # Backend Node.js
│   ├── src/               # Code source API
│   ├── prisma/            # Schéma base de données
│   └── scripts/           # Scripts utilitaires
├── api/                   # Fonctions serverless Vercel
├── vercel.json           # Configuration Vercel
└── deploy.sh             # Script de déploiement
```

## 🔧 Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: JWT
- **Cartes**: Mapbox GL JS
- **Paiements**: Wave Money, Orange Money
- **SMS**: Twilio
- **Déploiement**: Vercel (Frontend + Backend serverless)

## 📚 Documentation

- [Guide de Déploiement Vercel](./VERCEL_DEPLOYMENT.md)
- [Documentation Dashboard](./DASHBOARD_README.md)
- [Documentation Backend](./backend/README.md)
- [Optimisations](./backend/OPTIMIZATIONS.md)

## 🔐 Sécurité

- Authentification JWT sécurisée
- Validation stricte des données
- Rate limiting et protection CORS
- Chiffrement des mots de passe (bcrypt)
- Variables d'environnement sécurisées

## 🌍 Spécificités Sénégal

- Support des numéros de téléphone sénégalais
- Intégration Wave Money et Orange Money
- Zones de service configurables
- Interface en français

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs d'erreur
3. Créer une issue sur GitHub

---

**WeMoov** - Transport moderne et sécurisé au Sénégal 🇸🇳
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
