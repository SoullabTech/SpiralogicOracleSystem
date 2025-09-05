#!/bin/bash
# 🌀 Spiralogic Oracle System - Complete Stack Manager
# Manages the entire Maya + CSM + Database + API stack

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    echo "🌀 Spiralogic Oracle System - Stack Manager"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start         Start the complete stack"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  status        Show service status"
    echo "  logs          Show logs (follow mode)"
    echo "  health        Check health of all services"
    echo "  build         Build all containers"
    echo "  clean         Clean up containers and volumes"
    echo "  test          Run system tests"
    echo "  update        Update and rebuild services"
    echo ""
    echo "Service-specific commands:"
    echo "  csm           Manage CSM service only"
    echo "  backend       Manage backend service only"
    echo "  frontend      Manage frontend service only"
    echo "  db            Manage database services only"
    echo ""
    echo "Options:"
    echo "  --gpu         Force GPU support for CSM"
    echo "  --cpu         Force CPU-only mode for CSM"
    echo "  --dev         Use development configuration"
    echo "  --prod        Use production configuration"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start complete stack"
    echo "  $0 logs csm             # Show CSM logs"
    echo "  $0 restart backend      # Restart backend only"
    echo "  $0 health               # Check all services"
}

check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found${NC}"
        exit 1
    fi
    
    # Check docker-compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        echo -e "${RED}❌ docker-compose not found${NC}"
        exit 1
    fi
    
    # Check .env.local
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}⚠️  .env.local not found, creating template...${NC}"
        cp .env.example .env.local 2>/dev/null || echo "# Add your API keys here" > .env.local
    fi
    
    echo -e "${GREEN}✅ Prerequisites OK${NC}"
}

start_stack() {
    local service="$1"
    echo "🚀 Starting Spiralogic stack${service:+ ($service)}..."
    
    check_prerequisites
    
    if [ -n "$service" ]; then
        docker-compose up -d "$service"
    else
        docker-compose up -d
    fi
    
    echo -e "${GREEN}✅ Stack started${NC}"
    show_status
}

stop_stack() {
    local service="$1"
    echo "🛑 Stopping Spiralogic stack${service:+ ($service)}..."
    
    if [ -n "$service" ]; then
        docker-compose stop "$service"
    else
        docker-compose down
    fi
    
    echo -e "${GREEN}✅ Stack stopped${NC}"
}

restart_stack() {
    local service="$1"
    echo "🔄 Restarting Spiralogic stack${service:+ ($service)}..."
    
    if [ -n "$service" ]; then
        docker-compose restart "$service"
    else
        docker-compose restart
    fi
    
    echo -e "${GREEN}✅ Stack restarted${NC}"
    show_status
}

show_status() {
    echo ""
    echo "📊 Service Status:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
    echo ""
}

show_logs() {
    local service="$1"
    echo "📋 Showing logs${service:+ for $service}..."
    
    if [ -n "$service" ]; then
        docker-compose logs -f --tail=100 "$service"
    else
        docker-compose logs -f --tail=50
    fi
}

check_health() {
    echo "🏥 Health Check:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # CSM Service
    echo -n "  CSM (Voice):     "
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
    
    # Backend API
    echo -n "  Backend API:     "
    if curl -s http://localhost:3333/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
    
    # Frontend
    echo -n "  Frontend:        "
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
    
    # Redis
    echo -n "  Redis:           "
    if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
    
    # MongoDB
    echo -n "  MongoDB:         "
    if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
    
    echo ""
}

build_stack() {
    echo "🏗️  Building Spiralogic stack..."
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Build complete${NC}"
}

clean_stack() {
    echo "🧹 Cleaning up Spiralogic stack..."
    echo -e "${YELLOW}This will remove all containers, networks, and optionally volumes${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down --volumes --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup complete${NC}"
    else
        echo "Cleanup cancelled"
    fi
}

run_tests() {
    echo "🧪 Running system tests..."
    
    # Wait for services to be ready
    echo "Waiting for services..."
    sleep 10
    
    # Test CSM
    echo -n "Testing CSM: "
    if curl -s -X POST http://localhost:8000/generate \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "text=Test" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Test Backend
    echo -n "Testing Backend: "
    if curl -s http://localhost:3333/api/v1/health | grep -q "healthy\|ok"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Run Maya tests if available
    if [ -f "backend/test-maya-csm-integration.js" ]; then
        echo "Running Maya integration tests..."
        cd backend && node test-maya-csm-integration.js
    fi
    
    echo -e "${GREEN}✅ Tests complete${NC}"
}

update_stack() {
    echo "🔄 Updating Spiralogic stack..."
    
    # Pull latest images
    docker-compose pull
    
    # Rebuild custom images
    docker-compose build
    
    # Restart services
    docker-compose up -d
    
    echo -e "${GREEN}✅ Update complete${NC}"
    show_status
}

# Main command processing
case "${1:-help}" in
    start)
        start_stack "$2"
        ;;
    stop)
        stop_stack "$2"
        ;;
    restart)
        restart_stack "$2"
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$2"
        ;;
    health)
        check_health
        ;;
    build)
        build_stack
        ;;
    clean)
        clean_stack
        ;;
    test)
        run_tests
        ;;
    update)
        update_stack
        ;;
    csm)
        case "$2" in
            start) start_stack "sesame-csm" ;;
            stop) stop_stack "sesame-csm" ;;
            restart) restart_stack "sesame-csm" ;;
            logs) show_logs "sesame-csm" ;;
            *) echo "Usage: $0 csm [start|stop|restart|logs]" ;;
        esac
        ;;
    backend)
        case "$2" in
            start) start_stack "backend" ;;
            stop) stop_stack "backend" ;;
            restart) restart_stack "backend" ;;
            logs) show_logs "backend" ;;
            *) echo "Usage: $0 backend [start|stop|restart|logs]" ;;
        esac
        ;;
    frontend)
        case "$2" in
            start) start_stack "frontend" ;;
            stop) stop_stack "frontend" ;;
            restart) restart_stack "frontend" ;;
            logs) show_logs "frontend" ;;
            *) echo "Usage: $0 frontend [start|stop|restart|logs]" ;;
        esac
        ;;
    db)
        case "$2" in
            start) start_stack "mongo redis" ;;
            stop) stop_stack "mongo redis" ;;
            restart) restart_stack "mongo redis" ;;
            logs) show_logs "mongo" ;;
            *) echo "Usage: $0 db [start|stop|restart|logs]" ;;
        esac
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac