#!/bin/bash
# =============================================================================
# Maya & Sesame Production Deployment Script
# =============================================================================
# Complete deployment automation for Maya Backend + Sesame CSM TTS
# Usage: ./deploy.sh [build|start|stop|restart|logs|status|health]

set -e  # Exit on any error

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="maya-sesame"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# =============================================================================
# Helper Functions
# =============================================================================

print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              🧘 Maya & Sesame Production Deploy              ║"
    echo "║                Sacred Tech Infrastructure                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Check if required files exist
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "docker-compose.prod.yml not found!"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        log_warn "$ENV_FILE not found. Creating template..."
        create_env_template
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create environment template
create_env_template() {
    cat > "$ENV_FILE" << EOF
# =============================================================================
# Maya & Sesame Production Environment Variables
# =============================================================================
# IMPORTANT: Replace all placeholder values with your actual secrets!

# Next.js Application
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this
NEXTAUTH_URL=https://yourdomain.com

# Supabase Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key

# Redis Cache
REDIS_PASSWORD=your-secure-redis-password

# Optional: Hugging Face (for CSM model downloads)
HUGGINGFACE_HUB_TOKEN=your-hf-token

# =============================================================================
# You can also use separate .env files per service:
# - .env.maya (Maya-specific vars)
# - .env.sesame (Sesame-specific vars)
# =============================================================================
EOF
    
    log_warn "Created $ENV_FILE template. Please edit it with your actual values before deploying!"
    log_info "Opening $ENV_FILE for editing..."
    
    # Try to open the file in common editors
    if command -v code &> /dev/null; then
        code "$ENV_FILE"
    elif command -v nano &> /dev/null; then
        nano "$ENV_FILE"
    elif command -v vim &> /dev/null; then
        vim "$ENV_FILE"
    else
        log_info "Please manually edit $ENV_FILE with your environment variables"
    fi
    
    echo ""
    read -p "Press Enter after you've configured your environment variables..."
}

# Create necessary directories
setup_directories() {
    log_step "Setting up volume directories..."
    
    mkdir -p volumes/{maya-uploads,maya-temp,maya-logs}
    mkdir -p volumes/{sesame-audio,sesame-logs}
    mkdir -p volumes/{redis-data,nginx-logs}
    
    # Set proper permissions
    chmod 755 volumes/*/
    
    log_success "Volume directories created"
}

# Seed sample files
seed_sample_files() {
    log_step "🌱 Seeding Maya's Wisdom Foundation..."
    
    if [ ! -f "backend/scripts/seed-sample-file.ts" ]; then
        log_warn "Sample file seeder not found. Skipping seeding."
        return
    fi
    
    # Check if npm/node is available in backend
    cd backend
    if ! command -v npm &> /dev/null; then
        log_warn "npm not found. Skipping sample files seeding."
        cd ..
        return
    fi
    
    log_info "Running Maya's Wisdom Foundation seeder..."
    if npm run seed:sample > /dev/null 2>&1; then
        log_success "✨ Maya's Library populated with wisdom foundation"
    else
        log_warn "Sample file seeding failed or file already exists"
    fi
    cd ..
}

# Build all images
build_images() {
    log_step "Building production images..."
    
    log_info "Building Maya Backend image..."
    docker compose -f "$COMPOSE_FILE" build maya-backend
    
    log_info "Building Sesame TTS image..."
    docker compose -f "$COMPOSE_FILE" build sesame-tts
    
    log_success "All images built successfully"
}

# Start services
start_services() {
    log_step "Starting production services..."
    
    docker compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services started in detached mode"
    
    # Wait a moment for services to initialize
    sleep 5
    
    show_status
}

# Stop services
stop_services() {
    log_step "Stopping production services..."
    
    docker compose -f "$COMPOSE_FILE" down
    
    log_success "Services stopped"
}

# Restart services
restart_services() {
    log_step "Restarting production services..."
    
    stop_services
    sleep 2
    start_services
}

# Show service status
show_status() {
    log_step "Checking service status..."
    
    echo ""
    docker compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log_info "Service Health Status:"
    
    # Check Maya Backend health
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Maya Backend is healthy (http://localhost:3000)"
    else
        log_error "Maya Backend health check failed"
    fi
    
    # Check Sesame TTS health
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        log_success "Sesame TTS is healthy (http://localhost:8000)"
    else
        log_error "Sesame TTS health check failed"
    fi
    
    # Check Redis
    if docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis is healthy"
    else
        log_error "Redis health check failed"
    fi
}

# Show logs
show_logs() {
    local service="${2:-}"
    
    if [ -z "$service" ]; then
        log_info "Showing logs for all services (use Ctrl+C to exit):"
        docker compose -f "$COMPOSE_FILE" logs -f
    else
        log_info "Showing logs for $service (use Ctrl+C to exit):"
        docker compose -f "$COMPOSE_FILE" logs -f "$service"
    fi
}

# Run health checks
run_health_checks() {
    log_step "Running comprehensive health checks..."
    
    echo ""
    log_info "🔍 Maya Backend Health:"
    curl -s http://localhost:3000/api/health | jq '.' || log_error "Maya health endpoint failed"
    
    echo ""
    log_info "🔍 Sesame TTS Health:"
    curl -s http://localhost:8000/health | jq '.' || log_error "Sesame health endpoint failed"
    
    echo ""
    log_info "🔍 Container Health Status:"
    docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    log_info "🔍 Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
}

# Show usage
show_usage() {
    print_banner
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  build     - Build all production images"
    echo "  start     - Start all production services"
    echo "  stop      - Stop all production services"
    echo "  restart   - Restart all production services"
    echo "  status    - Show service status and health"
    echo "  logs      - Show logs for all services"
    echo "  logs <service> - Show logs for specific service"
    echo "  health    - Run comprehensive health checks"
    echo "  seed      - Seed sample files for Library demo"
    echo "  setup     - Initial setup (directories, env file)"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # Initial setup"
    echo "  $0 build     # Build images"
    echo "  $0 start     # Start services"
    echo "  $0 status    # Check status"
    echo "  $0 logs maya-backend  # Show Maya logs"
    echo "  $0 health    # Full health check"
    echo ""
}

# =============================================================================
# Main Script Logic
# =============================================================================

# Parse command line arguments
case "${1:-help}" in
    "build")
        print_banner
        check_prerequisites
        setup_directories
        build_images
        ;;
    "start")
        print_banner
        check_prerequisites
        setup_directories
        seed_sample_files
        start_services
        ;;
    "stop")
        print_banner
        stop_services
        ;;
    "restart")
        print_banner
        restart_services
        ;;
    "status")
        print_banner
        show_status
        ;;
    "logs")
        show_logs "$@"
        ;;
    "health")
        print_banner
        run_health_checks
        ;;
    "seed")
        print_banner
        log_info "Running sample files seeder manually..."
        seed_sample_files
        ;;
    "setup")
        print_banner
        check_prerequisites
        setup_directories
        seed_sample_files
        log_success "Setup completed! Run '$0 build' to build images."
        ;;
    "help"|"--help"|"-h"|*)
        show_usage
        ;;
esac

log_info "🧘 Sacred deployment complete. Maya awaits your connection."