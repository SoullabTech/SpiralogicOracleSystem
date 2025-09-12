#!/bin/bash

# Soullab Maya: Database Migration Runner
# Purpose: Safely deploy database schema to Supabase

set -e # Exit on error

echo "🌟 Soullab Maya - Database Setup"
echo "================================"

# Check for required environment variables
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: SUPABASE_DB_URL environment variable is not set"
    echo "Please set it in your .env.local file"
    exit 1
fi

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run a migration file
run_migration() {
    local file=$1
    local name=$(basename "$file")
    
    echo -e "${YELLOW}Running migration: $name${NC}"
    
    # Run the migration
    psql "$SUPABASE_DB_URL" -f "$file" -v ON_ERROR_STOP=1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $name completed successfully${NC}"
    else
        echo -e "${RED}✗ $name failed${NC}"
        exit 1
    fi
    
    echo ""
}

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql is not installed. Please install PostgreSQL client tools.${NC}"
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Confirm before proceeding
echo "This will run the following migrations:"
echo "  1. Initial schema (tables and indexes)"
echo "  2. Functions and views"
echo "  3. Security policies (RLS)"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Starting migrations..."
echo "====================="

# Run migrations in order
MIGRATION_DIR="$(dirname "$0")/../migrations"

# Run each migration file
run_migration "$MIGRATION_DIR/001_initial_schema.sql"
run_migration "$MIGRATION_DIR/002_functions_and_views.sql"
run_migration "$MIGRATION_DIR/003_security_policies.sql"

echo -e "${GREEN}✨ All migrations completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify tables in Supabase dashboard"
echo "2. Test RLS policies with a test user"
echo "3. Configure storage buckets for audio files (if using TTS)"
echo "4. Set up Edge Functions for real-time processing"
echo ""
echo "🌟 Maya is ready to witness sacred journeys"