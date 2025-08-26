#!/bin/bash

# WeMoov Vercel Deployment Script
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🚀 WeMoov Vercel Deployment Script"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Requirements check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd backend
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Run tests and linting
run_tests() {
    print_status "Running tests and linting..."
    
    # Run linting
    npm run lint
    
    print_success "Tests and linting passed"
}

# Build the project
build_project() {
    print_status "Building project..."
    
    # Test the build process
    npm run vercel-build
    
    print_success "Build completed successfully"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ ! -f ".env.production.example" ]; then
        print_error ".env.production.example file not found"
        exit 1
    fi
    
    print_warning "Make sure to configure these environment variables in Vercel:"
    echo ""
    echo "Required variables:"
    echo "- DATABASE_URL"
    echo "- JWT_SECRET"
    echo "- FRONTEND_URL"
    echo "- BACKEND_URL"
    echo "- CORS_ORIGIN"
    echo "- NODE_ENV=production"
    echo ""
    echo "Optional variables (see .env.production.example for full list):"
    echo "- MAPBOX_ACCESS_TOKEN"
    echo "- WAVE_API_KEY, WAVE_API_SECRET"
    echo "- ORANGE_API_KEY, ORANGE_API_SECRET"
    echo "- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN"
    echo ""
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    
    print_success "Deployment completed!"
}

# Post-deployment tasks
post_deployment() {
    print_status "Post-deployment tasks..."
    
    echo ""
    print_warning "Don't forget to:"
    echo "1. Run database migrations on your production database"
    echo "2. Create an admin user using the backend script"
    echo "3. Test the deployment:"
    echo "   - Visit your Vercel URL"
    echo "   - Check /api/health endpoint"
    echo "   - Test admin login at /admin/login"
    echo ""
    
    print_status "Database migration commands:"
    echo "npx prisma migrate deploy"
    echo "npx prisma generate"
    echo ""
    
    print_status "Create admin user:"
    echo "cd backend && node scripts/create-admin.js"
    echo ""
}

# Main deployment flow
main() {
    echo ""
    print_status "Starting deployment process..."
    echo ""
    
    check_requirements
    install_dependencies
    run_tests
    build_project
    check_env_vars
    
    echo ""
    read -p "Do you want to deploy to Vercel now? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_to_vercel
        post_deployment
    else
        print_status "Deployment skipped. Run 'vercel --prod' when ready."
    fi
    
    echo ""
    print_success "Deployment script completed!"
    print_status "Check the VERCEL_DEPLOYMENT.md file for detailed instructions."
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_requirements
        ;;
    "install")
        install_dependencies
        ;;
    "build")
        build_project
        ;;
    "deploy")
        deploy_to_vercel
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check   - Check requirements only"
        echo "  install - Install dependencies only"
        echo "  build   - Build project only"
        echo "  deploy  - Deploy to Vercel only"
        echo "  help    - Show this help"
        echo ""
        echo "Run without arguments for full deployment process."
        ;;
    *)
        main
        ;;
esac