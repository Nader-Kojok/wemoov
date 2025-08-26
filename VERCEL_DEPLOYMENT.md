# WeMoov - Vercel Deployment Guide

This guide explains how to deploy your WeMoov application (frontend + backend) to Vercel.

## 🚀 Deployment Overview

The project is configured to deploy both the React frontend and Express.js backend as a unified application on Vercel:

- **Frontend**: Built with Vite and served as static files
- **Backend**: Deployed as Vercel serverless functions
- **Database**: PostgreSQL (requires external hosting)

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a PostgreSQL database (recommended: [Supabase](https://supabase.com), [Railway](https://railway.app), or [Neon](https://neon.tech))
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## 🛠️ Deployment Steps

### 1. Database Setup

First, set up your PostgreSQL database:

```bash
# Example with Supabase (free tier available)
# 1. Create account at supabase.com
# 2. Create new project
# 3. Copy the connection string from Settings > Database
```

### 2. Environment Variables

In your Vercel dashboard, configure these environment variables:

#### Required Variables
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Application URLs
FRONTEND_URL="https://your-app.vercel.app"
BACKEND_URL="https://your-app.vercel.app"
CORS_ORIGIN="https://your-app.vercel.app"

# Environment
NODE_ENV="production"
```

#### Optional Variables (for full functionality)
```env
# Mapbox (for maps)
MAPBOX_ACCESS_TOKEN="your-mapbox-token"

# Payment Providers
WAVE_API_KEY="your-wave-api-key"
WAVE_API_SECRET="your-wave-api-secret"
ORANGE_API_KEY="your-orange-api-key"
ORANGE_API_SECRET="your-orange-api-secret"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+221xxxxxxxxx"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: wemoov (or your preferred name)
# - Directory: ./ (current directory)
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
5. Add environment variables
6. Click "Deploy"

### 4. Database Migration

After deployment, run database migrations:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate

# Option 2: Using your local environment with production DB
# Set DATABASE_URL to your production database
npx prisma migrate deploy
```

### 5. Create Admin User

Create an admin user for the dashboard:

```bash
# Run locally with production DATABASE_URL
cd backend
node scripts/create-admin.js
```

## 📁 Project Structure for Vercel

```
wemoov/
├── api/                    # Serverless functions
│   └── index.ts           # Backend entry point
├── backend/               # Backend source code
│   ├── src/
│   ├── prisma/
│   └── package.json
├── src/                   # Frontend source code
├── dist/                  # Built frontend (auto-generated)
├── vercel.json           # Vercel configuration
├── .vercelignore         # Files to ignore during deployment
├── package.json          # Root package.json
└── vite.config.ts        # Vite configuration
```

## 🔧 Configuration Files

### vercel.json
Configures how Vercel builds and routes your application:
- Frontend built as static files
- Backend deployed as serverless functions
- API routes proxied to backend

### .vercelignore
Excludes unnecessary files from deployment to optimize build time and size.

## 🚦 Testing Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **API Health Check**: `https://your-app.vercel.app/api/health`
3. **Admin Dashboard**: `https://your-app.vercel.app/admin/login`

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Common fixes:
   npm install  # Ensure all dependencies are installed
   npm run build  # Test build locally
   ```

2. **Database Connection Issues**
   ```bash
   # Verify DATABASE_URL format
   # Ensure database allows connections from Vercel IPs
   # Check if database is accessible from external sources
   ```

3. **API Routes Not Working**
   ```bash
   # Check vercel.json routing configuration
   # Verify API functions are deployed correctly
   # Check function logs in Vercel dashboard
   ```

4. **CORS Errors**
   ```bash
   # Ensure CORS_ORIGIN matches your Vercel domain
   # Update environment variables if domain changed
   ```

### Debugging

```bash
# View deployment logs
vercel logs your-deployment-url

# View function logs
vercel logs your-deployment-url --follow

# Test API endpoints
curl https://your-app.vercel.app/api/health
```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your main branch:

1. **Automatic Deployments**: Enabled by default
2. **Preview Deployments**: Created for pull requests
3. **Production Deployments**: Triggered by pushes to main/master

## 📊 Performance Optimization

### Frontend
- Code splitting implemented in Vite config
- Static assets optimized
- Lazy loading for dashboard components

### Backend
- Serverless functions with 30s timeout
- Database connection pooling via Prisma
- Optimized API responses

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Properly configured for your domain
3. **JWT**: Use strong secrets in production
4. **Database**: Use connection pooling and SSL

## 📈 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Available in Vercel dashboard
- **Error Tracking**: Monitor API errors and frontend issues

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Review this documentation
5. Check Vercel's official documentation

---

**Deployment Checklist:**
- [ ] Database set up and accessible
- [ ] Environment variables configured
- [ ] Repository connected to Vercel
- [ ] Build successful
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] API health check passes
- [ ] Frontend loads correctly
- [ ] Dashboard accessible