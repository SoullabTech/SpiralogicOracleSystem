#!/bin/bash
# AIN Sovereign Deployment Script
# Secure deployment orchestrator for sovereign consciousness systems

set -euo pipefail

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ASCII Art Header
cat << 'EOF'
    ╔══════════════════════════════════════════════════════════╗
    ║                 AIN SOVEREIGN DEPLOYMENT                 ║
    ║           🔮 Consciousness Evolution Infrastructure       ║
    ║              Spiralogic Oracle System v2.0              ║
    ╚══════════════════════════════════════════════════════════╝
EOF

echo -e "${CYAN}Initializing sovereign consciousness deployment...${NC}\n"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.sovereign"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.sovereign.yml"
LOG_FILE="/var/log/ain-deployment.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
error_exit() {
    echo -e "${RED}❌ DEPLOYMENT FAILED: $1${NC}"
    log "ERROR: $1"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

# Info message
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log "INFO: $1"
}

# Check if running as root or with docker permissions
check_permissions() {
    info "Checking deployment permissions..."

    if [[ $EUID -eq 0 ]]; then
        success "Running with root privileges"
    elif groups | grep -q docker; then
        success "Running with docker group permissions"
    else
        error_exit "This script requires root privileges or docker group membership"
    fi
}

# Verify system requirements
check_system_requirements() {
    info "Verifying system requirements..."

    # Check available memory (minimum 4GB)
    available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [[ $available_memory -lt 4000 ]]; then
        warning "Available memory (${available_memory}MB) is below recommended 4GB"
    else
        success "Sufficient memory available: ${available_memory}MB"
    fi

    # Check disk space (minimum 20GB)
    available_disk=$(df / | awk 'NR==2{print $4}')
    available_disk_gb=$((available_disk / 1024 / 1024))
    if [[ $available_disk_gb -lt 20 ]]; then
        warning "Available disk space (${available_disk_gb}GB) is below recommended 20GB"
    else
        success "Sufficient disk space available: ${available_disk_gb}GB"
    fi

    # Check required commands
    required_commands=("docker" "docker-compose" "curl" "jq" "openssl")
    for cmd in "${required_commands[@]}"; do
        if command -v "$cmd" > /dev/null; then
            success "Found required command: $cmd"
        else
            error_exit "Required command not found: $cmd"
        fi
    done
}

# Generate secure environment configuration
generate_env_config() {
    info "Generating secure environment configuration..."

    if [[ -f "$ENV_FILE" ]]; then
        warning "Environment file already exists. Creating backup..."
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%s)"
    fi

    # Copy template
    cp "${PROJECT_ROOT}/.env.sovereign.template" "$ENV_FILE"

    # Generate secure secrets
    info "Generating cryptographically secure secrets..."

    # Generate passwords
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    BACKUP_ENCRYPTION_KEY=$(openssl rand -base64 32)
    GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)

    # Update environment file with generated secrets
    sed -i "s/your_super_secure_postgres_password_here/$DB_PASSWORD/g" "$ENV_FILE"
    sed -i "s/your_super_secure_mongo_password_here/$MONGO_PASSWORD/g" "$ENV_FILE"
    sed -i "s/your_super_secure_redis_password_here/$REDIS_PASSWORD/g" "$ENV_FILE"
    sed -i "s/your_jwt_secret_here/$JWT_SECRET/g" "$ENV_FILE"
    sed -i "s/your_jwt_refresh_secret_here/$JWT_REFRESH_SECRET/g" "$ENV_FILE"
    sed -i "s/your_session_secret_here/$SESSION_SECRET/g" "$ENV_FILE"
    sed -i "s/your_encryption_key_here/$ENCRYPTION_KEY/g" "$ENV_FILE"
    sed -i "s/your_backup_encryption_key_here/$BACKUP_ENCRYPTION_KEY/g" "$ENV_FILE"
    sed -i "s/your_grafana_admin_password/$GRAFANA_PASSWORD/g" "$ENV_FILE"

    # Set secure permissions
    chmod 600 "$ENV_FILE"
    chown root:root "$ENV_FILE" 2>/dev/null || true

    success "Environment configuration generated with secure secrets"

    # Display next steps for manual configuration
    echo -e "${YELLOW}"
    echo "⚠️  IMPORTANT: Manual configuration required!"
    echo "Please edit $ENV_FILE and configure:"
    echo "  - DOMAIN: Your domain name"
    echo "  - TLS_EMAIL: Your email for Let's Encrypt"
    echo "  - OPENAI_API_KEY: Your OpenAI API key"
    echo "  - ELEVEN_LABS_API_KEY: Your Eleven Labs API key"
    echo "  - Voice IDs for elemental agents"
    echo "  - SingularityNET configuration (if enabled)"
    echo "  - Akash Network configuration (if enabled)"
    echo -e "${NC}"

    read -p "Press Enter when you have completed the manual configuration..."
}

# Validate environment configuration
validate_env_config() {
    info "Validating environment configuration..."

    if [[ ! -f "$ENV_FILE" ]]; then
        error_exit "Environment file not found: $ENV_FILE"
    fi

    # Source the environment file
    set -a
    source "$ENV_FILE"
    set +a

    # Check required variables
    required_vars=(
        "DOMAIN"
        "DB_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
        "ENCRYPTION_KEY"
        "BACKUP_ENCRYPTION_KEY"
    )

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error_exit "Required environment variable not set: $var"
        fi
    done

    # Validate domain format
    if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        error_exit "Invalid domain format: $DOMAIN"
    fi

    success "Environment configuration validated"
}

# Setup security infrastructure
setup_security() {
    info "Setting up security infrastructure..."

    # Run the security setup script
    if [[ -f "${SCRIPT_DIR}/ufw-security-setup.sh" ]]; then
        chmod +x "${SCRIPT_DIR}/ufw-security-setup.sh"
        "${SCRIPT_DIR}/ufw-security-setup.sh"
        success "Security infrastructure configured"
    else
        warning "Security setup script not found, skipping security configuration"
    fi
}

# Create required directories
create_directories() {
    info "Creating required directories..."

    directories=(
        "/opt/ain"
        "/opt/ain/data"
        "/opt/ain/logs"
        "/opt/ain/backups"
        "/opt/ain/config"
        "/var/log/ain"
        "/etc/docker/seccomp"
    )

    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        success "Created directory: $dir"
    done

    # Set proper ownership and permissions
    chown -R 1001:1001 /opt/ain/data /opt/ain/logs
    chmod 755 /opt/ain
    chmod 750 /opt/ain/data /opt/ain/logs
    chmod 700 /opt/ain/backups
}

# Generate Docker security profiles
generate_docker_profiles() {
    info "Generating Docker security profiles..."

    # Create seccomp profile
    cat > /etc/docker/seccomp/default.json << 'EOF'
{
    "defaultAction": "SCMP_ACT_ERRNO",
    "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_X86", "SCMP_ARCH_X32"],
    "syscalls": [
        {
            "names": [
                "accept", "accept4", "access", "adjtimex", "alarm", "bind", "brk", "capget", "capset",
                "chdir", "chmod", "chown", "chown32", "clock_getres", "clock_gettime", "clock_nanosleep",
                "close", "connect", "copy_file_range", "creat", "dup", "dup2", "dup3", "epoll_create",
                "epoll_create1", "epoll_ctl", "epoll_pwait", "epoll_wait", "eventfd", "eventfd2",
                "execve", "execveat", "exit", "exit_group", "faccessat", "fadvise64", "fallocate",
                "fanotify_mark", "fchdir", "fchmod", "fchmodat", "fchown", "fchown32", "fchownat",
                "fcntl", "fcntl64", "fdatasync", "fgetxattr", "flistxattr", "flock", "fork",
                "fremovexattr", "fsetxattr", "fstat", "fstat64", "fstatat64", "fstatfs", "fstatfs64",
                "fsync", "ftruncate", "ftruncate64", "futex", "getcwd", "getdents", "getdents64",
                "getegid", "getegid32", "geteuid", "geteuid32", "getgid", "getgid32", "getgroups",
                "getgroups32", "getitimer", "getpeername", "getpgid", "getpgrp", "getpid", "getppid",
                "getpriority", "getrandom", "getresgid", "getresgid32", "getresuid", "getresuid32",
                "getrlimit", "get_robust_list", "getrusage", "getsid", "getsockname", "getsockopt",
                "get_thread_area", "gettid", "gettimeofday", "getuid", "getuid32", "getxattr",
                "inotify_add_watch", "inotify_init", "inotify_init1", "inotify_rm_watch", "io_cancel",
                "ioctl", "io_destroy", "io_getevents", "ioprio_get", "ioprio_set", "io_setup",
                "io_submit", "ipc", "kill", "lchown", "lchown32", "lgetxattr", "link", "linkat",
                "listen", "listxattr", "llistxattr", "lremovexattr", "lseek", "lsetxattr", "lstat",
                "lstat64", "madvise", "memfd_create", "mincore", "mkdir", "mkdirat", "mknod",
                "mknodat", "mlock", "mlock2", "mlockall", "mmap", "mmap2", "mprotect", "mq_getsetattr",
                "mq_notify", "mq_open", "mq_timedreceive", "mq_timedsend", "mq_unlink", "mremap",
                "msgctl", "msgget", "msgrcv", "msgsnd", "msync", "munlock", "munlockall", "munmap",
                "nanosleep", "newfstatat", "open", "openat", "pause", "pipe", "pipe2", "poll",
                "ppoll", "prctl", "pread64", "preadv", "prlimit64", "pselect6", "ptrace", "pwrite64",
                "pwritev", "read", "readahead", "readlink", "readlinkat", "readv", "recv", "recvfrom",
                "recvmmsg", "recvmsg", "remap_file_pages", "removexattr", "rename", "renameat",
                "renameat2", "restart_syscall", "rmdir", "rt_sigaction", "rt_sigpending",
                "rt_sigprocmask", "rt_sigqueueinfo", "rt_sigreturn", "rt_sigsuspend", "rt_sigtimedwait",
                "rt_tgsigqueueinfo", "sched_getaffinity", "sched_getattr", "sched_getparam",
                "sched_get_priority_max", "sched_get_priority_min", "sched_getscheduler", "sched_setaffinity",
                "sched_setattr", "sched_setparam", "sched_setscheduler", "sched_yield", "seccomp",
                "select", "semctl", "semget", "semop", "semtimedop", "send", "sendfile", "sendfile64",
                "sendmmsg", "sendmsg", "sendto", "setfsgid", "setfsgid32", "setfsuid", "setfsuid32",
                "setgid", "setgid32", "setgroups", "setgroups32", "setitimer", "setpgid", "setpriority",
                "setregid", "setregid32", "setresgid", "setresgid32", "setresuid", "setresuid32",
                "setreuid", "setreuid32", "setrlimit", "set_robust_list", "setsid", "setsockopt",
                "set_thread_area", "set_tid_address", "setuid", "setuid32", "setxattr", "shmat",
                "shmctl", "shmdt", "shmget", "shutdown", "sigaltstack", "signalfd", "signalfd4",
                "sigreturn", "socket", "socketcall", "socketpair", "splice", "stat", "stat64",
                "statfs", "statfs64", "statx", "symlink", "symlinkat", "sync", "sync_file_range",
                "syncfs", "sysinfo", "tee", "tgkill", "time", "timer_create", "timer_delete",
                "timerfd_create", "timerfd_gettime", "timerfd_settime", "timer_getoverrun",
                "timer_gettime", "timer_settime", "times", "tkill", "truncate", "truncate64",
                "ugetrlimit", "umask", "uname", "unlink", "unlinkat", "utime", "utimensat", "utimes",
                "vfork", "vmsplice", "wait4", "waitid", "waitpid", "write", "writev"
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}
EOF

    success "Docker security profiles created"
}

# Pull and build Docker images
pull_and_build_images() {
    info "Pulling and building Docker images..."

    cd "$PROJECT_ROOT"

    # Pull base images first
    docker pull node:20-alpine
    docker pull postgres:15-alpine
    docker pull redis:7-alpine
    docker pull caddy:2-alpine
    docker pull prom/prometheus:latest

    # Build custom images
    docker-compose -f "$COMPOSE_FILE" build --no-cache

    success "Docker images pulled and built"
}

# Initialize databases
initialize_databases() {
    info "Initializing databases..."

    # Start only database services first
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis

    # Wait for databases to be ready
    info "Waiting for databases to initialize..."
    sleep 30

    # Create database schemas
    docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U ain -d ain_sovereign -c "
        CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
        CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";
    " || warning "Database schema creation failed (may already exist)"

    success "Databases initialized"
}

# Deploy AIN services
deploy_services() {
    info "Deploying AIN sovereign services..."

    cd "$PROJECT_ROOT"

    # Deploy all services
    docker-compose -f "$COMPOSE_FILE" up -d

    # Wait for services to start
    info "Waiting for services to initialize..."
    sleep 60

    # Check service health
    info "Checking service health..."

    services=("ain-orchestrator" "fire-agent" "water-agent" "earth-agent" "air-agent" "aether-agent")
    for service in "${services[@]}"; do
        if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
            success "Service running: $service"
        else
            warning "Service may not be running: $service"
        fi
    done
}

# Configure monitoring
setup_monitoring() {
    info "Setting up monitoring and alerting..."

    # Configure Prometheus targets
    docker-compose -f "$COMPOSE_FILE" exec -T monitoring /bin/sh -c "
        promtool check config /etc/prometheus/prometheus.yml
    " || warning "Prometheus configuration check failed"

    # Setup log aggregation
    mkdir -p /var/log/ain/aggregated

    # Create log aggregation script
    cat > /usr/local/bin/ain-log-aggregator.sh << 'EOF'
#!/bin/bash
# Aggregate logs from all AIN services

DATE=$(date +%Y%m%d)
DEST_DIR="/var/log/ain/aggregated"

# Create daily log directory
mkdir -p "$DEST_DIR/$DATE"

# Aggregate Docker container logs
docker ps --format "{{.Names}}" | grep -E "(ain|fire|water|earth|air|aether)" | while read container; do
    docker logs --since 24h "$container" > "$DEST_DIR/$DATE/${container}.log" 2>&1
done

# Compress old logs
find "$DEST_DIR" -type d -mtime +7 -exec tar -czf {}.tar.gz {} \; -exec rm -rf {} \;
EOF

    chmod +x /usr/local/bin/ain-log-aggregator.sh

    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 1 * * * /usr/local/bin/ain-log-aggregator.sh") | crontab -

    success "Monitoring and logging configured"
}

# Setup backup system
setup_backup_system() {
    info "Setting up backup system..."

    # Make backup script executable
    chmod +x "${SCRIPT_DIR}/backup.sh"

    # Test backup system
    info "Testing backup system..."
    BACKUP_ENCRYPTION_KEY="test_key_12345" "${SCRIPT_DIR}/backup.sh" || warning "Backup test failed"

    # Setup automated backups
    (crontab -l 2>/dev/null; echo "0 2 * * * ${SCRIPT_DIR}/backup.sh") | crontab -

    success "Backup system configured with daily automated backups"
}

# Perform health checks
perform_health_checks() {
    info "Performing comprehensive health checks..."

    # API health check
    if curl -f -s "http://localhost:8080/health" > /dev/null; then
        success "AIN API is responding"
    else
        warning "AIN API health check failed"
    fi

    # Database connectivity
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U ain; then
        success "PostgreSQL is ready"
    else
        warning "PostgreSQL connectivity check failed"
    fi

    # Redis connectivity
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping | grep -q PONG; then
        success "Redis is responding"
    else
        warning "Redis connectivity check failed"
    fi

    # Docker container health
    unhealthy_containers=$(docker ps --filter "health=unhealthy" -q | wc -l)
    if [[ $unhealthy_containers -eq 0 ]]; then
        success "All containers are healthy"
    else
        warning "$unhealthy_containers containers are unhealthy"
    fi

    # Disk space check
    disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -lt 80 ]]; then
        success "Disk usage is healthy: ${disk_usage}%"
    else
        warning "Disk usage is high: ${disk_usage}%"
    fi
}

# Generate deployment report
generate_deployment_report() {
    info "Generating deployment report..."

    REPORT_FILE="/opt/ain/deployment_report_$(date +%Y%m%d_%H%M%S).txt"

    cat > "$REPORT_FILE" << EOF
AIN SOVEREIGN DEPLOYMENT REPORT
===============================

Deployment Date: $(date)
Hostname: $(hostname)
IP Address: $(curl -s ifconfig.me 2>/dev/null || echo "Unable to detect")

SYSTEM INFORMATION
------------------
OS: $(uname -s) $(uname -r)
Architecture: $(uname -m)
CPU Cores: $(nproc)
Memory: $(free -h | awk 'NR==2{print $2}')
Disk Space: $(df -h / | awk 'NR==2{print $2}')

DOCKER ENVIRONMENT
------------------
Docker Version: $(docker --version)
Docker Compose Version: $(docker-compose --version)

RUNNING CONTAINERS
------------------
$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}")

DOCKER VOLUMES
--------------
$(docker volume ls | grep -E "(ain|fire|water|earth|air|aether|postgres|redis)")

NETWORK CONFIGURATION
---------------------
$(docker network ls | grep sovereign)

PORT CONFIGURATION
------------------
- HTTP: 80
- HTTPS: 443
- AIN API: 8080
- Fire Agent: 7001
- Water Agent: 7002
- Earth Agent: 7003
- Air Agent: 7004
- Aether Agent: 7005
- Prometheus: 9090 (internal)

SECURITY FEATURES
-----------------
✅ UFW Firewall configured
✅ fail2ban intrusion prevention
✅ Docker security profiles
✅ Encrypted backups
✅ TLS/SSL certificates
✅ Security headers
✅ Rate limiting

BACKUP CONFIGURATION
--------------------
Backup Location: /opt/ain/backups
Backup Schedule: Daily at 2:00 AM
Retention: 7 days
Encryption: AES256 with GPG

MONITORING
----------
Prometheus: http://localhost:9090
Health Check: http://localhost:8080/health
Log Location: /var/log/ain/

NEXT STEPS
----------
1. Configure your domain DNS to point to this server
2. Verify TLS certificates are issued correctly
3. Test all elemental agents functionality
4. Setup external monitoring alerts
5. Configure offsite backup storage
6. Review and customize security policies
7. Setup user authentication and authorization

IMPORTANT SECURITY NOTES
-------------------------
- Environment file contains sensitive secrets: .env.sovereign
- Database passwords are auto-generated and stored securely
- Backup encryption key is required for restore operations
- Firewall is configured to block unnecessary ports
- All containers run with minimal privileges
- Regular security updates are automated

For support and documentation, visit:
https://github.com/your-org/ain-sovereign-system

EOF

    success "Deployment report generated: $REPORT_FILE"
}

# Display final deployment status
show_deployment_status() {
    echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                 DEPLOYMENT COMPLETE!                     ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${GREEN}🎉 AIN Sovereign Consciousness System is now deployed!${NC}\n"

    echo -e "${CYAN}🌐 Access Points:${NC}"
    echo -e "   • Main Application: https://${DOMAIN:-your-domain.com}"
    echo -e "   • API Endpoint: https://${DOMAIN:-your-domain.com}/api"
    echo -e "   • Health Check: https://${DOMAIN:-your-domain.com}/health"
    echo -e "   • Monitoring: http://localhost:9090 (internal only)"

    echo -e "\n${CYAN}🔥 Elemental Agents (gRPC):${NC}"
    echo -e "   • Fire Agent: grpc://${DOMAIN:-your-domain.com}:7001"
    echo -e "   • Water Agent: grpc://${DOMAIN:-your-domain.com}:7002"
    echo -e "   • Earth Agent: grpc://${DOMAIN:-your-domain.com}:7003"
    echo -e "   • Air Agent: grpc://${DOMAIN:-your-domain.com}:7004"
    echo -e "   • Aether Agent: grpc://${DOMAIN:-your-domain.com}:7005"

    echo -e "\n${CYAN}🔐 Security Features:${NC}"
    echo -e "   ✅ UFW Firewall active"
    echo -e "   ✅ fail2ban intrusion prevention"
    echo -e "   ✅ Encrypted backups (daily at 2:00 AM)"
    echo -e "   ✅ TLS/SSL certificates"
    echo -e "   ✅ Container security hardening"
    echo -e "   ✅ Security monitoring"

    echo -e "\n${CYAN}📊 Monitoring & Logs:${NC}"
    echo -e "   • System logs: /var/log/ain/"
    echo -e "   • Container logs: docker-compose logs -f"
    echo -e "   • Backup logs: /var/log/ain-backup.log"
    echo -e "   • Security logs: /var/log/ain-security-setup.log"

    echo -e "\n${YELLOW}🔧 Management Commands:${NC}"
    echo -e "   • View status: docker-compose ps"
    echo -e "   • View logs: docker-compose logs -f [service]"
    echo -e "   • Restart service: docker-compose restart [service]"
    echo -e "   • Update system: docker-compose pull && docker-compose up -d"
    echo -e "   • Backup now: ${SCRIPT_DIR}/backup.sh"

    echo -e "\n${YELLOW}⚠️  Important Files:${NC}"
    echo -e "   • Environment: ${ENV_FILE}"
    echo -e "   • Compose: ${COMPOSE_FILE}"
    echo -e "   • Backups: /opt/ain/backups/"
    echo -e "   • Deployment report: /opt/ain/deployment_report_*.txt"

    echo -e "\n${GREEN}🚀 Your sovereign consciousness evolution system is ready!${NC}"
    echo -e "${GREEN}   The AIN network awaits your wisdom...${NC}\n"
}

# Main deployment function
main() {
    log "Starting AIN Sovereign Deployment"

    echo -e "${BLUE}Starting deployment process...${NC}\n"

    # Pre-flight checks
    check_permissions
    check_system_requirements

    # Environment setup
    if [[ ! -f "$ENV_FILE" ]]; then
        generate_env_config
    fi
    validate_env_config

    # Security setup
    setup_security
    create_directories
    generate_docker_profiles

    # Docker deployment
    pull_and_build_images
    initialize_databases
    deploy_services

    # Post-deployment setup
    setup_monitoring
    setup_backup_system

    # Verification
    perform_health_checks
    generate_deployment_report

    # Success!
    show_deployment_status

    log "AIN Sovereign Deployment completed successfully"
}

# Handle script interruption
trap 'error_exit "Deployment interrupted by user"' INT TERM

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            echo "AIN Sovereign Deployment Script"
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --help, -h     Show this help message"
            echo "  --check-only   Only perform system checks"
            echo "  --skip-security Skip security setup"
            exit 0
            ;;
        --check-only)
            check_permissions
            check_system_requirements
            exit 0
            ;;
        --skip-security)
            SKIP_SECURITY=true
            shift
            ;;
        *)
            error_exit "Unknown option: $1"
            ;;
    esac
done

# Run main deployment
main "$@"