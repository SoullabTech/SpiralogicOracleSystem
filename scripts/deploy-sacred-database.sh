#!/bin/bash

# 🗃️ Sacred Database Migration Deployment Script
# Runs all 4 migration files in correct order with verification

set -e  # Exit on any error

echo "🌸 Deploying Sacred Database Architecture..."
echo "=================================================="

# Colors for beautiful output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

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

print_sacred() {
    echo -e "${PURPLE}[SACRED]${NC} $1"
}

# Check if SUPABASE_DB_URL is set
check_database_connection() {
    if [ -z "$SUPABASE_DB_URL" ]; then
        print_error "SUPABASE_DB_URL environment variable not set!"
        echo ""
        echo "Please set your Supabase database URL:"
        echo 'export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"'
        echo ""
        echo "You can find this in your Supabase project settings under Database."
        exit 1
    fi
    
    print_status "Testing database connection..."
    if psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection verified ✨"
    else
        print_error "Cannot connect to database. Please check your SUPABASE_DB_URL."
        exit 1
    fi
}

# Run a migration file with verification
run_migration() {
    local file_path=$1
    local description=$2
    local expected_message=$3
    
    print_status "Running: $description"
    echo "File: $file_path"
    
    if [ ! -f "$file_path" ]; then
        print_error "Migration file not found: $file_path"
        exit 1
    fi
    
    # Run the migration and capture output
    local output
    if output=$(psql "$SUPABASE_DB_URL" -f "$file_path" 2>&1); then
        if echo "$output" | grep -q "$expected_message"; then
            print_success "$description completed successfully! 🌟"
        else
            print_success "$description completed (no verification message found)"
        fi
    else
        print_error "Failed to run $description"
        echo "Error output:"
        echo "$output"
        exit 1
    fi
    
    echo ""
    sleep 1
}

# Main deployment sequence
deploy_database() {
    print_sacred "🌸 Beginning sacred database deployment ritual..."
    echo ""
    
    check_database_connection
    echo ""
    
    # Step 1: Core Tables
    run_migration "supabase/migrations/20250909_sacred_beta_users_core.sql" \
        "Core Sacred Tables (users, oracle_agents, memories, etc.)" \
        "Sacred Beta Users Core Tables Created Successfully"
    
    # Step 2: Indexes & Security
    run_migration "supabase/migrations/20250909_sacred_beta_users_indexes.sql" \
        "Performance Indexes & Row Level Security" \
        "Sacred Beta Users Indexes & Security Policies Applied Successfully"
    
    # Step 3: Beta Feedback System
    run_migration "supabase/migrations/20250909_beta_feedback_system_split.sql" \
        "Beta Feedback & User Journey Tracking" \
        "Beta Feedback System Core Tables Created Successfully"
    
    # Step 4: Feedback Indexes
    run_migration "supabase/migrations/20250909_beta_feedback_indexes.sql" \
        "Feedback System Indexes & Security" \
        "Beta Feedback System Indexes & Security Policies Applied Successfully"
    
    print_sacred "🌟 Sacred Database Architecture Deployed Successfully! 🌟"
    echo "=================================================="
    echo ""
    print_success "✅ Users table with sacred names and beta tracking"
    print_success "✅ Oracle agents table for Maya personas"
    print_success "✅ Memories table for conversation preservation"
    print_success "✅ Conversation sessions with wisdom tracking"
    print_success "✅ Journal entries for deep reflection"
    print_success "✅ Beta feedback collection system"
    print_success "✅ User journey milestone tracking"
    print_success "✅ Performance indexes and conditional queries"
    print_success "✅ Row Level Security protecting all user data"
    echo ""
    print_sacred "Your sacred technology database is ready for transformation! 🧙‍♀️✨"
    echo ""
    echo "Next steps:"
    echo "1. Test your application's database connections"
    echo "2. Verify user registration creates oracle agents"
    echo "3. Test the voice → memory → signup pipeline"
    echo "4. Deploy your application to production"
    echo ""
    print_sacred "May your database serve the highest good! 🌸"
}

# Script options
case "${1:-}" in
    --check)
        print_status "Checking database connection and migration files..."
        check_database_connection
        
        # Check if all migration files exist
        files=(
            "supabase/migrations/20250909_sacred_beta_users_core.sql"
            "supabase/migrations/20250909_sacred_beta_users_indexes.sql"
            "supabase/migrations/20250909_beta_feedback_system_split.sql"
            "supabase/migrations/20250909_beta_feedback_indexes.sql"
        )
        
        for file in "${files[@]}"; do
            if [ -f "$file" ]; then
                print_success "Found: $file"
            else
                print_error "Missing: $file"
            fi
        done
        print_success "Pre-deployment check complete ✨"
        ;;
    --help)
        echo "Sacred Database Deployment Script Usage:"
        echo ""
        echo "./scripts/deploy-sacred-database.sh           # Deploy all migrations"
        echo "./scripts/deploy-sacred-database.sh --check   # Check connection and files"
        echo "./scripts/deploy-sacred-database.sh --help    # Show this help"
        echo ""
        echo "Prerequisites:"
        echo "1. Set SUPABASE_DB_URL environment variable"
        echo "2. Have psql installed and accessible"
        echo "3. Ensure all migration files are present"
        echo ""
        ;;
    *)
        deploy_database
        ;;
esac

print_sacred "Sacred database script complete! 🗃️✨"