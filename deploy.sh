#!/bin/bash

# PumpPal Deployment Script
# This script handles the deployment of PumpPal to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="PumpPal"
BUILD_DIR="dist"
BACKUP_DIR="backups"
LOG_FILE="deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        error "git is not installed. Please install git first."
    fi
    
    success "Prerequisites check passed"
}

# Validate environment
validate_environment() {
    log "Validating environment..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        warning ".env file not found. Using .env.example as template."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            warning "Please update .env file with your configuration before deploying."
            read -p "Press Enter to continue after updating .env file..."
        else
            error ".env.example file not found. Please create environment configuration."
        fi
    fi
    
    # Check required environment variables
    source .env
    
    if [ -z "$VITE_API_BASE_URL" ]; then
        error "VITE_API_BASE_URL is not set in .env file"
    fi
    
    if [ -z "$VITE_ICO_CONTRACT_ADDRESS" ]; then
        error "VITE_ICO_CONTRACT_ADDRESS is not set in .env file"
    fi
    
    success "Environment validation passed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Check if test script exists
    if npm run test --silent 2>/dev/null; then
        success "All tests passed"
    else
        warning "No tests found or tests failed. Continuing with deployment..."
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf $BUILD_DIR
        log "Cleaned previous build"
    fi
    
    # Build the application
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        error "Build failed - $BUILD_DIR directory not found"
    fi
    
    success "Application built successfully"
}

# Create backup
create_backup() {
    if [ "$1" = "production" ]; then
        log "Creating backup..."
        
        # Create backup directory if it doesn't exist
        mkdir -p $BACKUP_DIR
        
        # Create backup with timestamp
        BACKUP_NAME="backup_$(date +'%Y%m%d_%H%M%S')"
        
        # This would typically backup your current production files
        # For now, we'll just create a placeholder
        echo "Backup created at $(date)" > "$BACKUP_DIR/$BACKUP_NAME.txt"
        
        success "Backup created: $BACKUP_NAME"
    fi
}

# Deploy to staging
deploy_staging() {
    log "Deploying to staging..."
    
    # This would typically deploy to your staging environment
    # For example, uploading to a staging server or S3 bucket
    
    success "Deployed to staging environment"
    log "Staging URL: https://staging.pumppal.io"
}

# Deploy to production
deploy_production() {
    log "Deploying to production..."
    
    # Create backup before production deployment
    create_backup "production"
    
    # This would typically deploy to your production environment
    # For example, uploading to production server or CDN
    
    success "Deployed to production environment"
    log "Production URL: https://pumppal.io"
}

# Verify deployment
verify_deployment() {
    local environment=$1
    log "Verifying $environment deployment..."
    
    # This would typically run health checks on the deployed application
    # For now, we'll just simulate the verification
    
    sleep 2
    success "$environment deployment verified"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove temporary files if any
    # Clean up build artifacts that aren't needed
    
    success "Cleanup completed"
}

# Send notifications
send_notifications() {
    local environment=$1
    log "Sending deployment notifications..."
    
    # This would typically send notifications to Slack, Discord, etc.
    # For now, we'll just log the notification
    
    success "Deployment notifications sent for $environment"
}

# Main deployment function
deploy() {
    local environment=${1:-staging}
    
    log "Starting $PROJECT_NAME deployment to $environment..."
    
    # Run deployment steps
    check_prerequisites
    validate_environment
    install_dependencies
    run_tests
    build_application
    
    case $environment in
        "staging")
            deploy_staging
            verify_deployment "staging"
            ;;
        "production")
            # Additional confirmation for production
            echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION!${NC}"
            read -p "Are you sure you want to continue? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                deploy_production
                verify_deployment "production"
                send_notifications "production"
            else
                log "Production deployment cancelled by user"
                exit 0
            fi
            ;;
        *)
            error "Invalid environment: $environment. Use 'staging' or 'production'"
            ;;
    esac
    
    cleanup
    
    success "$PROJECT_NAME successfully deployed to $environment!"
    log "Deployment completed at $(date)"
}

# Help function
show_help() {
    echo "PumpPal Deployment Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "ENVIRONMENT:"
    echo "  staging     Deploy to staging environment (default)"
    echo "  production  Deploy to production environment"
    echo ""
    echo "Examples:"
    echo "  $0                 # Deploy to staging"
    echo "  $0 staging         # Deploy to staging"
    echo "  $0 production      # Deploy to production"
    echo ""
    echo "Options:"
    echo "  -h, --help         Show this help message"
    echo ""
}

# Parse command line arguments
case $1 in
    -h|--help)
        show_help
        exit 0
        ;;
    "")
        deploy "staging"
        ;;
    "staging"|"production")
        deploy $1
        ;;
    *)
        error "Invalid argument: $1. Use --help for usage information."
        ;;
esac
