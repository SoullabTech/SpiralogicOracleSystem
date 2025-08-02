#!/bin/bash
# Secret Scanning for Spiralogic Oracle System
# Level 5 DevSecOps - Comprehensive secret detection

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORT_DIR="$PROJECT_ROOT/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Tools configuration
GITLEAKS_VERSION="8.18.0"
TRUFFLEHOG_VERSION="3.63.7"
DETECT_SECRETS_VERSION="1.4.0"

# Report files
GITLEAKS_REPORT="$REPORT_DIR/gitleaks-report-$TIMESTAMP.json"
TRUFFLEHOG_REPORT="$REPORT_DIR/trufflehog-report-$TIMESTAMP.json"
DETECT_SECRETS_REPORT="$REPORT_DIR/detect-secrets-report-$TIMESTAMP.json"
COMBINED_REPORT="$REPORT_DIR/secret-scan-combined-$TIMESTAMP.json"
SUMMARY_REPORT="$REPORT_DIR/secret-scan-summary-$TIMESTAMP.txt"

# Exit codes
EXIT_SECRETS_FOUND=1
EXIT_TOOL_ERROR=2
EXIT_SUCCESS=0

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

# Check if running in CI/CD
is_ci() {
    [[ "${CI:-false}" == "true" ]] || [[ -n "${GITHUB_ACTIONS:-}" ]] || [[ -n "${GITLAB_CI:-}" ]]
}

# Install tools if not present
install_tools() {
    log "Installing secret scanning tools..."

    # Create bin directory if it doesn't exist
    mkdir -p "$PROJECT_ROOT/bin"

    # Install gitleaks
    if ! command -v gitleaks &> /dev/null; then
        log "Installing gitleaks v$GITLEAKS_VERSION..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            GITLEAKS_URL="https://github.com/gitleaks/gitleaks/releases/download/v$GITLEAKS_VERSION/gitleaks_${GITLEAKS_VERSION}_darwin_x64.tar.gz"
        else
            GITLEAKS_URL="https://github.com/gitleaks/gitleaks/releases/download/v$GITLEAKS_VERSION/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
        fi

        curl -sSL "$GITLEAKS_URL" | tar -xz -C "$PROJECT_ROOT/bin" gitleaks
        chmod +x "$PROJECT_ROOT/bin/gitleaks"
        export PATH="$PROJECT_ROOT/bin:$PATH"
    fi

    # Install trufflehog
    if ! command -v trufflehog &> /dev/null; then
        log "Installing trufflehog v$TRUFFLEHOG_VERSION..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            TRUFFLEHOG_URL="https://github.com/trufflesecurity/trufflehog/releases/download/v$TRUFFLEHOG_VERSION/trufflehog_${TRUFFLEHOG_VERSION}_darwin_amd64.tar.gz"
        else
            TRUFFLEHOG_URL="https://github.com/trufflesecurity/trufflehog/releases/download/v$TRUFFLEHOG_VERSION/trufflehog_${TRUFFLEHOG_VERSION}_linux_amd64.tar.gz"
        fi

        curl -sSL "$TRUFFLEHOG_URL" | tar -xz -C "$PROJECT_ROOT/bin" trufflehog
        chmod +x "$PROJECT_ROOT/bin/trufflehog"
        export PATH="$PROJECT_ROOT/bin:$PATH"
    fi

    # Install detect-secrets
    if ! command -v detect-secrets &> /dev/null; then
        log "Installing detect-secrets v$DETECT_SECRETS_VERSION..."
        pip3 install detect-secrets==$DETECT_SECRETS_VERSION || {
            warn "Failed to install detect-secrets via pip. Skipping this scanner."
        }
    fi
}

# Create gitleaks configuration
create_gitleaks_config() {
    cat > "$PROJECT_ROOT/.gitleaks.toml" << 'EOF'
title = "Spiralogic Oracle System - Secret Detection Configuration"

[extend]
useDefault = true

[[rules]]
description = "Spiralogic API Keys"
id = "spiralogic-api-key"
regex = '''spira[_-]?(?:api[_-]?)?key[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9]{32,})'''
tags = ["api-key", "spiralogic"]

[[rules]]
description = "Consciousness Model Keys"
id = "consciousness-key"
regex = '''consciousness[_-]?(?:model[_-]?)?key[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9]{32,})'''
tags = ["consciousness", "model"]

[[rules]]
description = "Elemental Agent Secrets"
id = "elemental-secret"
regex = '''(?:fire|water|earth|air|aether)[_-]?(?:agent[_-]?)?(?:key|secret|token)[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9]{20,})'''
tags = ["elemental", "agent"]

[[rules]]
description = "Sacred Mirror Access Keys"
id = "sacred-mirror-key"
regex = '''sacred[_-]?mirror[_-]?(?:key|secret|token)[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9]{32,})'''
tags = ["sacred-mirror", "biometric"]

[[rules]]
description = "Voice Synthesis Keys"
id = "voice-key"
regex = '''(?:eleven[_-]?labs|voice)[_-]?(?:api[_-]?)?key[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9]{32,})'''
tags = ["voice", "synthesis"]

[[rules]]
description = "Vault Tokens"
id = "vault-token"
regex = '''(?:vault[_-]?)?token[_-:]?\s*[=:]\s*['\"]?(hvs\.[a-zA-Z0-9]{20,})'''
tags = ["vault", "token"]

[[rules]]
description = "Database Passwords"
id = "database-password"
regex = '''(?:db|database|postgres|mongo|redis)[_-]?(?:pass|password)[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9!@#$%^&*()_+=-]{8,})'''
tags = ["database", "password"]

[[rules]]
description = "JWT Secrets"
id = "jwt-secret"
regex = '''jwt[_-]?secret[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9!@#$%^&*()_+=-]{32,})'''
tags = ["jwt", "auth"]

[[rules]]
description = "Encryption Keys"
id = "encryption-key"
regex = '''(?:encryption|encrypt)[_-]?key[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9+/]{32,}={0,2})'''
tags = ["encryption", "key"]

[[rules]]
description = "Private Keys"
id = "private-key"
regex = '''-----BEGIN (?:RSA )?PRIVATE KEY-----'''
tags = ["private-key", "crypto"]

[[rules]]
description = "Akash Network Keys"
id = "akash-key"
regex = '''akash[_-]?(?:key|secret|mnemonic)[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9\s]{20,})'''
tags = ["akash", "blockchain"]

[[rules]]
description = "SingularityNET Keys"
id = "snet-key"
regex = '''snet[_-]?(?:key|private[_-]?key|wallet)[_-:]?\s*[=:]\s*['\"]?([a-zA-Z0-9]{40,})'''
tags = ["snet", "blockchain"]

[allowlist]
description = "Allowlist for false positives"
paths = [
    '''^\.git/''',
    '''^node_modules/''',
    '''^dist/''',
    '''^build/''',
    '''^\.next/''',
    '''\.lock$''',
    '''package-lock\.json$''',
    '''\.md$''',
    '''\.example$''',
    '''\.template$'''
]

regexes = [
    '''example[_-]?(?:key|secret|token)''',
    '''test[_-]?(?:key|secret|token)''',
    '''fake[_-]?(?:key|secret|token)''',
    '''dummy[_-]?(?:key|secret|token)''',
    '''placeholder[_-]?(?:key|secret|token)''',
    '''your[_-]?(?:key|secret|token)''',
    '''insert[_-]?(?:key|secret|token)''',
    '''replace[_-]?(?:key|secret|token)''',
    '''secretsecret''',
    '''keykey''',
    '''123456789''',
    '''abcdefgh'''
]
EOF
}

# Run gitleaks scan
run_gitleaks() {
    log "Running gitleaks secret detection..."

    create_gitleaks_config

    if gitleaks detect \
        --source="$PROJECT_ROOT" \
        --report-format=json \
        --report-path="$GITLEAKS_REPORT" \
        --config="$PROJECT_ROOT/.gitleaks.toml" \
        --verbose; then
        success "Gitleaks scan completed - no secrets found"
        return 0
    else
        local exit_code=$?
        if [[ $exit_code -eq 1 ]]; then
            error "Gitleaks found potential secrets!"
            return 1
        else
            error "Gitleaks scan failed with exit code $exit_code"
            return $exit_code
        fi
    fi
}

# Run trufflehog scan
run_trufflehog() {
    log "Running trufflehog secret detection..."

    if trufflehog filesystem \
        --directory="$PROJECT_ROOT" \
        --json \
        --output="$TRUFFLEHOG_REPORT" \
        --exclude-paths="$PROJECT_ROOT/.trufflehogignore" \
        --concurrency=4; then
        success "Trufflehog scan completed"
        return 0
    else
        local exit_code=$?
        if [[ $exit_code -eq 183 ]]; then
            error "Trufflehog found verified secrets!"
            return 1
        else
            error "Trufflehog scan failed with exit code $exit_code"
            return $exit_code
        fi
    fi
}

# Create trufflehog ignore file
create_trufflehog_ignore() {
    cat > "$PROJECT_ROOT/.trufflehogignore" << 'EOF'
# Build artifacts
dist/
build/
.next/
node_modules/
target/

# Version control
.git/

# Dependencies
package-lock.json
yarn.lock
Pipfile.lock

# Documentation
*.md
*.txt
*.rst

# Templates and examples
*.template
*.example
*.sample

# Logs
*.log

# Test files
test/
tests/
__tests__/
spec/
*.test.js
*.spec.js

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Security reports (to avoid recursive scanning)
security-reports/
EOF
}

# Run detect-secrets scan
run_detect_secrets() {
    if ! command -v detect-secrets &> /dev/null; then
        warn "detect-secrets not available, skipping..."
        return 0
    fi

    log "Running detect-secrets scan..."

    cd "$PROJECT_ROOT"

    # Initialize baseline if it doesn't exist
    if [[ ! -f .secrets.baseline ]]; then
        detect-secrets scan --baseline .secrets.baseline \
            --exclude-files '\.lock$' \
            --exclude-files 'node_modules/.*' \
            --exclude-files 'dist/.*' \
            --exclude-files '\.git/.*' \
            --exclude-files 'security-reports/.*'
    fi

    # Audit for new secrets
    if detect-secrets scan --baseline .secrets.baseline \
        --exclude-files '\.lock$' \
        --exclude-files 'node_modules/.*' \
        --exclude-files 'dist/.*' \
        --exclude-files '\.git/.*' \
        --exclude-files 'security-reports/.*' | \
        jq '.' > "$DETECT_SECRETS_REPORT"; then
        success "Detect-secrets scan completed"
        return 0
    else
        error "Detect-secrets found new secrets!"
        return 1
    fi
}

# Combine and analyze results
analyze_results() {
    log "Analyzing secret scanning results..."

    local total_secrets=0
    local critical_secrets=0
    local findings=()

    # Analyze gitleaks results
    if [[ -f "$GITLEAKS_REPORT" ]] && [[ -s "$GITLEAKS_REPORT" ]]; then
        local gitleaks_count=$(jq length "$GITLEAKS_REPORT" 2>/dev/null || echo "0")
        total_secrets=$((total_secrets + gitleaks_count))
        if [[ $gitleaks_count -gt 0 ]]; then
            findings+=("Gitleaks: $gitleaks_count potential secrets")
            # Check for critical secrets (API keys, private keys)
            local critical_count=$(jq '[.[] | select(.RuleID | test("api-key|private-key|vault-token"))] | length' "$GITLEAKS_REPORT" 2>/dev/null || echo "0")
            critical_secrets=$((critical_secrets + critical_count))
        fi
    fi

    # Analyze trufflehog results
    if [[ -f "$TRUFFLEHOG_REPORT" ]] && [[ -s "$TRUFFLEHOG_REPORT" ]]; then
        local trufflehog_count=$(wc -l < "$TRUFFLEHOG_REPORT" 2>/dev/null || echo "0")
        total_secrets=$((total_secrets + trufflehog_count))
        if [[ $trufflehog_count -gt 0 ]]; then
            findings+=("Trufflehog: $trufflehog_count verified secrets")
            critical_secrets=$((critical_secrets + trufflehog_count))  # All trufflehog findings are verified
        fi
    fi

    # Analyze detect-secrets results
    if [[ -f "$DETECT_SECRETS_REPORT" ]] && [[ -s "$DETECT_SECRETS_REPORT" ]]; then
        local detect_secrets_count=$(jq '.results | length' "$DETECT_SECRETS_REPORT" 2>/dev/null || echo "0")
        total_secrets=$((total_secrets + detect_secrets_count))
        if [[ $detect_secrets_count -gt 0 ]]; then
            findings+=("Detect-secrets: $detect_secrets_count potential secrets")
        fi
    fi

    # Create combined report
    {
        echo "# Spiralogic Oracle System - Secret Scanning Report"
        echo "Generated: $(date)"
        echo "Project: $PROJECT_ROOT"
        echo ""
        echo "## Summary"
        echo "Total findings: $total_secrets"
        echo "Critical findings: $critical_secrets"
        echo ""

        if [[ ${#findings[@]} -gt 0 ]]; then
            echo "## Tool Results"
            for finding in "${findings[@]}"; do
                echo "- $finding"
            done
            echo ""
        fi

        if [[ $critical_secrets -gt 0 ]]; then
            echo "## ⚠️  CRITICAL ALERT"
            echo "Found $critical_secrets critical secrets that require immediate attention!"
            echo ""
        fi

        echo "## Recommendations"
        if [[ $total_secrets -eq 0 ]]; then
            echo "✅ No secrets detected. Repository appears clean."
        else
            echo "🔴 Secrets detected. Take the following actions:"
            echo "1. Review all findings in the detailed reports"
            echo "2. Remove or encrypt any real secrets"
            echo "3. Use environment variables or vault integration"
            echo "4. Update .gitignore to prevent future commits"
            echo "5. Consider rotating any exposed credentials"

            if is_ci; then
                echo "6. Block this deployment until secrets are resolved"
            fi
        fi

        echo ""
        echo "## Detailed Reports"
        echo "- Gitleaks: $GITLEAKS_REPORT"
        echo "- Trufflehog: $TRUFFLEHOG_REPORT"
        echo "- Detect-secrets: $DETECT_SECRETS_REPORT"
    } > "$SUMMARY_REPORT"

    # Create combined JSON report
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -Iseconds)\","
        echo "  \"project\": \"$PROJECT_ROOT\","
        echo "  \"summary\": {"
        echo "    \"total_findings\": $total_secrets,"
        echo "    \"critical_findings\": $critical_secrets,"
        echo "    \"tools_used\": ["
        echo "      \"gitleaks\","
        echo "      \"trufflehog\","
        echo "      \"detect-secrets\""
        echo "    ]"
        echo "  },"
        echo "  \"reports\": {"
        echo "    \"gitleaks\": \"$GITLEAKS_REPORT\","
        echo "    \"trufflehog\": \"$TRUFFLEHOG_REPORT\","
        echo "    \"detect_secrets\": \"$DETECT_SECRETS_REPORT\""
        echo "  }"
        echo "}"
    } > "$COMBINED_REPORT"

    return $critical_secrets
}

# Send notifications (if configured)
send_notifications() {
    local severity=$1
    local message=$2

    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        [[ $severity == "critical" ]] && color="danger"
        [[ $severity == "warning" ]] && color="warning"

        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔐 Secret Scan Alert\",\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            "$SLACK_WEBHOOK_URL" || warn "Failed to send Slack notification"
    fi

    if [[ -n "${TEAMS_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔐 Secret Scan Alert: $message\"}" \
            "$TEAMS_WEBHOOK_URL" || warn "Failed to send Teams notification"
    fi
}

# Main execution
main() {
    log "Starting Spiralogic Oracle System secret scanning..."

    # Create report directory
    mkdir -p "$REPORT_DIR"

    # Install tools
    install_tools

    # Create ignore files
    create_trufflehog_ignore

    # Initialize variables
    local gitleaks_exit=0
    local trufflehog_exit=0
    local detect_secrets_exit=0

    # Run scans
    run_gitleaks || gitleaks_exit=$?
    run_trufflehog || trufflehog_exit=$?
    run_detect_secrets || detect_secrets_exit=$?

    # Analyze results
    analyze_results
    local critical_count=$?

    # Display summary
    cat "$SUMMARY_REPORT"

    # Send notifications if needed
    if [[ $critical_count -gt 0 ]]; then
        send_notifications "critical" "Found $critical_count critical secrets in Spiralogic Oracle System"
    elif [[ $gitleaks_exit -ne 0 ]] || [[ $trufflehog_exit -ne 0 ]] || [[ $detect_secrets_exit -ne 0 ]]; then
        send_notifications "warning" "Secret scanning completed with warnings"
    else
        send_notifications "good" "Secret scanning completed successfully - no secrets found"
    fi

    # Cleanup
    rm -f "$PROJECT_ROOT/.gitleaks.toml"
    rm -f "$PROJECT_ROOT/.trufflehogignore"

    # Exit with appropriate code
    if [[ $critical_count -gt 0 ]] || [[ $gitleaks_exit -eq 1 ]] || [[ $trufflehog_exit -eq 183 ]]; then
        error "Secret scanning failed - secrets detected!"
        exit $EXIT_SECRETS_FOUND
    elif [[ $gitleaks_exit -gt 1 ]] || [[ $trufflehog_exit -gt 0 && $trufflehog_exit -ne 183 ]] || [[ $detect_secrets_exit -gt 0 ]]; then
        error "Secret scanning encountered errors"
        exit $EXIT_TOOL_ERROR
    else
        success "Secret scanning completed successfully"
        exit $EXIT_SUCCESS
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi