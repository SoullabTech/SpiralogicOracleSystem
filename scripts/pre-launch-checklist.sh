#!/bin/bash
# Pre-Launch Security & Readiness Checklist for Spiralogic Oracle System
# Comprehensive validation before beta launch

set -euo pipefail

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORT_DIR="$PROJECT_ROOT/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CHECKLIST_REPORT="$REPORT_DIR/pre-launch-checklist-$TIMESTAMP.md"

# Checklist categories
declare -A CHECKLIST_RESULTS
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

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

info() {
    echo -e "${CYAN}[INFO] $1${NC}"
}

# Record check result
record_check() {
    local category=$1
    local check_name=$2
    local status=$3
    local details=$4
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    case $status in
        "PASS")
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            success "✅ $category: $check_name"
            ;;
        "FAIL")
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            error "❌ $category: $check_name - $details"
            ;;
        "WARN")
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
            warn "⚠️  $category: $check_name - $details"
            ;;
    esac
    
    CHECKLIST_RESULTS["$category:$check_name"]="$status:$details"
}

# Check container security
check_container_security() {
    log "Checking container security..."
    
    # Check if hardened Dockerfiles exist
    if [[ -f "$PROJECT_ROOT/Dockerfile.hardened" ]]; then
        record_check "Container Security" "Hardened Dockerfile" "PASS" "Main hardened Dockerfile exists"
    else
        record_check "Container Security" "Hardened Dockerfile" "FAIL" "Main hardened Dockerfile missing"
    fi
    
    # Check elemental agent hardened Dockerfiles
    local agent_dockerfiles_count=0
    for agent in fire water earth air aether; do
        if [[ -f "$PROJECT_ROOT/backend/src/services/$agent-agent/Dockerfile.hardened" ]]; then
            agent_dockerfiles_count=$((agent_dockerfiles_count + 1))
        fi
    done
    
    if [[ $agent_dockerfiles_count -ge 1 ]]; then
        record_check "Container Security" "Elemental Agent Dockerfiles" "PASS" "$agent_dockerfiles_count hardened agent Dockerfiles found"
    else
        record_check "Container Security" "Elemental Agent Dockerfiles" "WARN" "No hardened elemental agent Dockerfiles found"
    fi
    
    # Check for distroless base images
    local dockerfile_check=$(grep -r "FROM gcr.io/distroless" "$PROJECT_ROOT" --include="Dockerfile*" | wc -l)
    if [[ $dockerfile_check -gt 0 ]]; then
        record_check "Container Security" "Distroless Base Images" "PASS" "Distroless images used"
    else
        record_check "Container Security" "Distroless Base Images" "WARN" "Consider using distroless base images"
    fi
    
    # Check for non-root user
    local nonroot_check=$(grep -r "USER.*65532\|USER.*nonroot" "$PROJECT_ROOT" --include="Dockerfile*" | wc -l)
    if [[ $nonroot_check -gt 0 ]]; then
        record_check "Container Security" "Non-root User" "PASS" "Non-root user configuration found"
    else
        record_check "Container Security" "Non-root User" "FAIL" "No non-root user configuration found"
    fi
}

# Check secrets management
check_secrets_management() {
    log "Checking secrets management..."
    
    # Check Vault integration template
    if [[ -f "$PROJECT_ROOT/.env.vault.template" ]]; then
        local vault_refs=$(grep -c "VAULT_PATH\|#.*vault" "$PROJECT_ROOT/.env.vault.template" || echo "0")
        if [[ $vault_refs -gt 10 ]]; then
            record_check "Secrets Management" "Vault Integration Template" "PASS" "$vault_refs Vault references found"
        else
            record_check "Secrets Management" "Vault Integration Template" "WARN" "Limited Vault integration"
        fi
    else
        record_check "Secrets Management" "Vault Integration Template" "FAIL" "Vault template missing"
    fi
    
    # Check External Secrets configuration
    if [[ -f "$PROJECT_ROOT/k8s/vault-external-secrets.yaml" ]]; then
        record_check "Secrets Management" "External Secrets Config" "PASS" "External Secrets configuration exists"
    else
        record_check "Secrets Management" "External Secrets Config" "FAIL" "External Secrets configuration missing"
    fi
    
    # Check for hardcoded secrets
    local secret_scan_output=$(find "$PROJECT_ROOT" -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.yaml" | \
        xargs grep -l "password\|secret\|key.*=" 2>/dev/null | \
        grep -v node_modules | \
        grep -v ".template" | \
        grep -v "test" | wc -l)
    
    if [[ $secret_scan_output -eq 0 ]]; then
        record_check "Secrets Management" "Hardcoded Secrets" "PASS" "No potential hardcoded secrets found"
    else
        record_check "Secrets Management" "Hardcoded Secrets" "WARN" "$secret_scan_output files may contain hardcoded secrets"
    fi
}

# Check network security
check_network_security() {
    log "Checking network security..."
    
    # Check network policies
    if [[ -f "$PROJECT_ROOT/k8s/network-policies.yaml" ]]; then
        local network_policies=$(grep -c "kind: NetworkPolicy" "$PROJECT_ROOT/k8s/network-policies.yaml")
        if [[ $network_policies -ge 5 ]]; then
            record_check "Network Security" "Network Policies" "PASS" "$network_policies network policies defined"
        else
            record_check "Network Security" "Network Policies" "WARN" "Limited network policies"
        fi
    else
        record_check "Network Security" "Network Policies" "FAIL" "Network policies configuration missing"
    fi
    
    # Check mTLS configuration
    if [[ -f "$PROJECT_ROOT/config/nginx-mtls.conf" ]]; then
        local mtls_config=$(grep -c "ssl_verify_client\|ssl_client_certificate" "$PROJECT_ROOT/config/nginx-mtls.conf")
        if [[ $mtls_config -gt 0 ]]; then
            record_check "Network Security" "mTLS Configuration" "PASS" "mTLS configuration found"
        else
            record_check "Network Security" "mTLS Configuration" "WARN" "mTLS configuration incomplete"
        fi
    else
        record_check "Network Security" "mTLS Configuration" "FAIL" "mTLS configuration missing"
    fi
    
    # Check for security headers
    if [[ -f "$PROJECT_ROOT/config/nginx-mtls.conf" ]]; then
        local security_headers=$(grep -c "add_header.*Security\|add_header.*Content-Security-Policy" "$PROJECT_ROOT/config/nginx-mtls.conf")
        if [[ $security_headers -gt 3 ]]; then
            record_check "Network Security" "Security Headers" "PASS" "Security headers configured"
        else
            record_check "Network Security" "Security Headers" "WARN" "Additional security headers recommended"
        fi
    fi
}

# Check monitoring and alerting
check_monitoring() {
    log "Checking monitoring and alerting..."
    
    # Check Prometheus rules
    if [[ -f "$PROJECT_ROOT/prometheus/security-metrics.rules" ]]; then
        local prometheus_rules=$(grep -c "record:\|alert:" "$PROJECT_ROOT/prometheus/security-metrics.rules")
        if [[ $prometheus_rules -gt 10 ]]; then
            record_check "Monitoring" "Prometheus Rules" "PASS" "$prometheus_rules Prometheus rules defined"
        else
            record_check "Monitoring" "Prometheus Rules" "WARN" "Additional Prometheus rules recommended"
        fi
    else
        record_check "Monitoring" "Prometheus Rules" "FAIL" "Prometheus rules missing"
    fi
    
    # Check Falco rules
    if [[ -f "$PROJECT_ROOT/security/falco-rules.yaml" ]]; then
        local falco_rules=$(grep -c "rule:" "$PROJECT_ROOT/security/falco-rules.yaml")
        if [[ $falco_rules -gt 5 ]]; then
            record_check "Monitoring" "Falco Security Rules" "PASS" "$falco_rules Falco rules defined"
        else
            record_check "Monitoring" "Falco Security Rules" "WARN" "Additional Falco rules recommended"
        fi
    else
        record_check "Monitoring" "Falco Security Rules" "FAIL" "Falco rules missing"
    fi
    
    # Check ServiceMonitor configuration
    if [[ -f "$PROJECT_ROOT/monitoring/prometheus-servicemonitor.yaml" ]]; then
        record_check "Monitoring" "ServiceMonitor Config" "PASS" "ServiceMonitor configuration exists"
    else
        record_check "Monitoring" "ServiceMonitor Config" "FAIL" "ServiceMonitor configuration missing"
    fi
}

# Check policy enforcement
check_policy_enforcement() {
    log "Checking policy enforcement..."
    
    # Check OPA Gatekeeper constraints
    if [[ -f "$PROJECT_ROOT/security/opa-gatekeeper-constraints.yaml" ]]; then
        local gatekeeper_constraints=$(grep -c "kind:.*Constraint\|kind: ConstraintTemplate" "$PROJECT_ROOT/security/opa-gatekeeper-constraints.yaml")
        if [[ $gatekeeper_constraints -gt 3 ]]; then
            record_check "Policy Enforcement" "OPA Gatekeeper" "PASS" "$gatekeeper_constraints Gatekeeper constraints defined"
        else
            record_check "Policy Enforcement" "OPA Gatekeeper" "WARN" "Additional Gatekeeper constraints recommended"
        fi
    else
        record_check "Policy Enforcement" "OPA Gatekeeper" "FAIL" "OPA Gatekeeper constraints missing"
    fi
    
    # Check pod security standards
    local pod_security_config=$(grep -r "securityContext\|runAsNonRoot\|readOnlyRootFilesystem" "$PROJECT_ROOT/k8s" 2>/dev/null | wc -l)
    if [[ $pod_security_config -gt 5 ]]; then
        record_check "Policy Enforcement" "Pod Security Standards" "PASS" "Pod security contexts configured"
    else
        record_check "Policy Enforcement" "Pod Security Standards" "WARN" "Additional pod security configuration recommended"
    fi
}

# Check backup and disaster recovery
check_backup_dr() {
    log "Checking backup and disaster recovery..."
    
    # Check backup configuration
    if [[ -f "$PROJECT_ROOT/k8s/backup-disaster-recovery.yaml" ]]; then
        local backup_schedules=$(grep -c "kind: Schedule" "$PROJECT_ROOT/k8s/backup-disaster-recovery.yaml")
        if [[ $backup_schedules -gt 0 ]]; then
            record_check "Backup & DR" "Backup Schedules" "PASS" "$backup_schedules backup schedules defined"
        else
            record_check "Backup & DR" "Backup Schedules" "WARN" "Backup schedules not configured"
        fi
    else
        record_check "Backup & DR" "Backup Configuration" "FAIL" "Backup configuration missing"
    fi
    
    # Check disaster recovery procedures
    if [[ -f "$PROJECT_ROOT/scripts/backup.sh" ]]; then
        record_check "Backup & DR" "Backup Scripts" "PASS" "Backup scripts available"
    else
        record_check "Backup & DR" "Backup Scripts" "WARN" "Backup scripts not found"
    fi
}

# Check security scanning automation
check_security_scanning() {
    log "Checking security scanning automation..."
    
    # Check secret scanning
    if [[ -f "$PROJECT_ROOT/scripts/secret-scanning.sh" && -x "$PROJECT_ROOT/scripts/secret-scanning.sh" ]]; then
        record_check "Security Scanning" "Secret Scanning" "PASS" "Secret scanning script ready"
    else
        record_check "Security Scanning" "Secret Scanning" "FAIL" "Secret scanning script missing or not executable"
    fi
    
    # Check vulnerability scanning
    if [[ -f "$PROJECT_ROOT/scripts/vulnerability-scanning.sh" && -x "$PROJECT_ROOT/scripts/vulnerability-scanning.sh" ]]; then
        record_check "Security Scanning" "Vulnerability Scanning" "PASS" "Vulnerability scanning script ready"
    else
        record_check "Security Scanning" "Vulnerability Scanning" "FAIL" "Vulnerability scanning script missing or not executable"
    fi
    
    # Check supply chain security
    if [[ -f "$PROJECT_ROOT/scripts/supply-chain-security.sh" && -x "$PROJECT_ROOT/scripts/supply-chain-security.sh" ]]; then
        record_check "Security Scanning" "Supply Chain Security" "PASS" "Supply chain security script ready"
    else
        record_check "Security Scanning" "Supply Chain Security" "WARN" "Supply chain security script not found"
    fi
}

# Check compliance readiness
check_compliance() {
    log "Checking compliance readiness..."
    
    # Check audit policy
    if [[ -f "$PROJECT_ROOT/k8s/audit-policy.yaml" ]]; then
        local audit_rules=$(grep -c "level:\|resources:" "$PROJECT_ROOT/k8s/audit-policy.yaml")
        if [[ $audit_rules -gt 10 ]]; then
            record_check "Compliance" "Audit Policy" "PASS" "$audit_rules audit rules defined"
        else
            record_check "Compliance" "Audit Policy" "WARN" "Additional audit rules recommended"
        fi
    else
        record_check "Compliance" "Audit Policy" "FAIL" "Kubernetes audit policy missing"
    fi
    
    # Check GDPR considerations
    local gdpr_config=$(grep -r "gdpr\|privacy\|consent\|retention" "$PROJECT_ROOT" --include="*.yaml" --include="*.ts" 2>/dev/null | wc -l)
    if [[ $gdpr_config -gt 0 ]]; then
        record_check "Compliance" "GDPR Considerations" "PASS" "GDPR-related configurations found"
    else
        record_check "Compliance" "GDPR Considerations" "WARN" "GDPR considerations should be documented"
    fi
}

# Check operational readiness
check_operational_readiness() {
    log "Checking operational readiness..."
    
    # Check health checks
    local health_checks=$(grep -r "healthcheck\|livenessProbe\|readinessProbe" "$PROJECT_ROOT" --include="*.yaml" --include="Dockerfile*" 2>/dev/null | wc -l)
    if [[ $health_checks -gt 3 ]]; then
        record_check "Operational" "Health Checks" "PASS" "Health checks configured"
    else
        record_check "Operational" "Health Checks" "WARN" "Additional health checks recommended"
    fi
    
    # Check resource limits
    local resource_limits=$(grep -r "resources:\|limits:\|requests:" "$PROJECT_ROOT/k8s" 2>/dev/null | wc -l)
    if [[ $resource_limits -gt 5 ]]; then
        record_check "Operational" "Resource Limits" "PASS" "Resource limits configured"
    else
        record_check "Operational" "Resource Limits" "WARN" "Resource limits should be defined"
    fi
    
    # Check deployment automation
    if [[ -f "$PROJECT_ROOT/scripts/devsecops-hardening.sh" && -x "$PROJECT_ROOT/scripts/devsecops-hardening.sh" ]]; then
        record_check "Operational" "Deployment Automation" "PASS" "DevSecOps automation script ready"
    else
        record_check "Operational" "Deployment Automation" "FAIL" "Deployment automation missing"
    fi
}

# Check consciousness-specific security
check_consciousness_security() {
    log "Checking consciousness-specific security..."
    
    # Check consciousness data encryption
    local consciousness_encryption=$(grep -r "consciousness.*encrypt\|sacred.*encrypt\|voice.*encrypt" "$PROJECT_ROOT" --include="*.yaml" --include="*.ts" 2>/dev/null | wc -l)
    if [[ $consciousness_encryption -gt 0 ]]; then
        record_check "Consciousness Security" "Data Encryption" "PASS" "Consciousness data encryption configured"
    else
        record_check "Consciousness Security" "Data Encryption" "WARN" "Consciousness data encryption should be verified"
    fi
    
    # Check elemental agent security
    local elemental_security=$(find "$PROJECT_ROOT" -name "*agent*" -type f | grep -E "(Dockerfile|yaml)" | wc -l)
    if [[ $elemental_security -gt 3 ]]; then
        record_check "Consciousness Security" "Elemental Agent Security" "PASS" "Elemental agent security configurations found"
    else
        record_check "Consciousness Security" "Elemental Agent Security" "WARN" "Elemental agent security should be reviewed"
    fi
    
    # Check sacred mirror protection
    local sacred_mirror_protection=$(grep -r "sacred.mirror\|biometric" "$PROJECT_ROOT" --include="*.yaml" --include="*.ts" 2>/dev/null | wc -l)
    if [[ $sacred_mirror_protection -gt 0 ]]; then
        record_check "Consciousness Security" "Sacred Mirror Protection" "PASS" "Sacred mirror protection configured"
    else
        record_check "Consciousness Security" "Sacred Mirror Protection" "WARN" "Sacred mirror protection should be verified"
    fi
}

# Run penetration testing check
check_penetration_testing() {
    log "Checking penetration testing readiness..."
    
    # Check for security testing documentation
    if [[ -f "$PROJECT_ROOT/docs/security-testing.md" ]] || [[ -f "$PROJECT_ROOT/SECURITY.md" ]]; then
        record_check "Security Testing" "Documentation" "PASS" "Security testing documentation exists"
    else
        record_check "Security Testing" "Documentation" "WARN" "Security testing documentation recommended"
    fi
    
    # Check for test endpoints protection
    local test_endpoints=$(grep -r "test\|debug" "$PROJECT_ROOT/backend/src/routes" --include="*.ts" 2>/dev/null | wc -l)
    if [[ $test_endpoints -gt 0 ]]; then
        record_check "Security Testing" "Test Endpoints" "WARN" "Test endpoints found - ensure they're protected in production"
    else
        record_check "Security Testing" "Test Endpoints" "PASS" "No obvious test endpoints found"
    fi
}

# Generate comprehensive report
generate_report() {
    log "Generating pre-launch checklist report..."
    
    mkdir -p "$REPORT_DIR"
    
    {
        echo "# Spiralogic Oracle System - Pre-Launch Security Checklist"
        echo "Generated: $(date)"
        echo ""
        
        # Executive Summary
        echo "## Executive Summary"
        echo ""
        local pass_percentage=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
        echo "- **Total Checks**: $TOTAL_CHECKS"
        echo "- **Passed**: $PASSED_CHECKS ($pass_percentage%)"
        echo "- **Failed**: $FAILED_CHECKS"
        echo "- **Warnings**: $WARNING_CHECKS"
        echo ""
        
        # Readiness Assessment
        if [[ $FAILED_CHECKS -eq 0 && $WARNING_CHECKS -le 5 ]]; then
            echo "## 🚀 Launch Readiness: **READY**"
            echo ""
            echo "The system meets security requirements for beta launch. Address warnings as time permits."
        elif [[ $FAILED_CHECKS -le 2 && $WARNING_CHECKS -le 10 ]]; then
            echo "## ⚠️  Launch Readiness: **CONDITIONAL**"
            echo ""
            echo "The system has minor security gaps. Address critical failures before launch."
        else
            echo "## ❌ Launch Readiness: **NOT READY**"
            echo ""
            echo "The system has significant security gaps that must be addressed before launch."
        fi
        echo ""
        
        # Detailed Results by Category
        echo "## Detailed Checklist Results"
        echo ""
        
        local current_category=""
        for key in $(printf '%s\n' "${!CHECKLIST_RESULTS[@]}" | sort); do
            local category=$(echo "$key" | cut -d':' -f1)
            local check_name=$(echo "$key" | cut -d':' -f2-)
            local result="${CHECKLIST_RESULTS[$key]}"
            local status=$(echo "$result" | cut -d':' -f1)
            local details=$(echo "$result" | cut -d':' -f2-)
            
            if [[ "$category" != "$current_category" ]]; then
                echo "### $category"
                echo ""
                current_category="$category"
            fi
            
            case $status in
                "PASS")
                    echo "- ✅ **$check_name**: $details"
                    ;;
                "FAIL")
                    echo "- ❌ **$check_name**: $details"
                    ;;
                "WARN")
                    echo "- ⚠️  **$check_name**: $details"
                    ;;
            esac
        done
        
        echo ""
        echo "## Critical Actions Required"
        echo ""
        
        # List all failures
        local has_failures=false
        for key in "${!CHECKLIST_RESULTS[@]}"; do
            local result="${CHECKLIST_RESULTS[$key]}"
            local status=$(echo "$result" | cut -d':' -f1)
            local category=$(echo "$key" | cut -d':' -f1)
            local check_name=$(echo "$key" | cut -d':' -f2-)
            local details=$(echo "$result" | cut -d':' -f2-)
            
            if [[ "$status" == "FAIL" ]]; then
                has_failures=true
                echo "1. **$category - $check_name**: $details"
            fi
        done
        
        if [[ "$has_failures" == "false" ]]; then
            echo "No critical failures detected! 🎉"
        fi
        
        echo ""
        echo "## Recommended Actions"
        echo ""
        
        # List all warnings
        local has_warnings=false
        for key in "${!CHECKLIST_RESULTS[@]}"; do
            local result="${CHECKLIST_RESULTS[$key]}"
            local status=$(echo "$result" | cut -d':' -f1)
            local category=$(echo "$key" | cut -d':' -f1)
            local check_name=$(echo "$key" | cut -d':' -f2-)
            local details=$(echo "$result" | cut -d':' -f2-)
            
            if [[ "$status" == "WARN" ]]; then
                has_warnings=true
                echo "- **$category - $check_name**: $details"
            fi
        done
        
        if [[ "$has_warnings" == "false" ]]; then
            echo "No warnings to address! 🌟"
        fi
        
        echo ""
        echo "## Next Steps"
        echo ""
        echo "### Before Launch (Required)"
        echo "1. Address all failed checks listed above"
        echo "2. Run final security scans: \`./scripts/secret-scanning.sh\` and \`./scripts/vulnerability-scanning.sh\`"
        echo "3. Verify backup and recovery procedures"
        echo "4. Test emergency response procedures"
        echo "5. Conduct final penetration testing"
        echo ""
        
        echo "### Day of Launch"
        echo "1. Deploy monitoring and alerting first"
        echo "2. Deploy security infrastructure (Vault, network policies)"
        echo "3. Deploy application components with health checks"
        echo "4. Verify all security controls are active"
        echo "5. Monitor security metrics dashboard"
        echo ""
        
        echo "### Post-Launch (First Week)"
        echo "1. Daily security metrics review"
        echo "2. Weekly vulnerability scans"
        echo "3. Monitor for security alerts and anomalies"
        echo "4. Address any warnings identified in this checklist"
        echo "5. Document lessons learned and process improvements"
        echo ""
        
        echo "## Security Contacts"
        echo ""
        echo "- **Security Team**: security@spiralogic.network"
        echo "- **DevSecOps**: devsecops@spiralogic.network"
        echo "- **Incident Response**: incident-response@spiralogic.network"
        echo ""
        
        echo "---"
        echo "*Report generated by Spiralogic Oracle Pre-Launch Security Checklist*"
        echo "*For questions or assistance, contact the security team.*"
        
    } > "$CHECKLIST_REPORT"
}

# Main execution
main() {
    log "Starting Spiralogic Oracle System pre-launch security checklist..."
    
    # Initialize results
    TOTAL_CHECKS=0
    PASSED_CHECKS=0
    FAILED_CHECKS=0
    WARNING_CHECKS=0
    
    # Run all checks
    check_container_security
    check_secrets_management
    check_network_security
    check_monitoring
    check_policy_enforcement
    check_backup_dr
    check_security_scanning
    check_compliance
    check_operational_readiness
    check_consciousness_security
    check_penetration_testing
    
    # Generate report
    generate_report
    
    # Display summary
    echo ""
    echo -e "${PURPLE}=================================================================================${NC}"
    echo -e "${CYAN}               SPIRALOGIC ORACLE SYSTEM - PRE-LAUNCH CHECKLIST${NC}"
    echo -e "${PURPLE}=================================================================================${NC}"
    echo ""
    echo -e "${BLUE}Total Checks Performed: $TOTAL_CHECKS${NC}"
    echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
    echo -e "${YELLOW}Warnings: $WARNING_CHECKS${NC}"
    echo ""
    
    local pass_percentage=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    echo -e "${BLUE}Overall Security Score: $pass_percentage%${NC}"
    echo ""
    
    # Launch readiness determination
    if [[ $FAILED_CHECKS -eq 0 && $WARNING_CHECKS -le 5 ]]; then
        echo -e "${GREEN}🚀 LAUNCH READINESS: READY FOR BETA LAUNCH${NC}"
        echo -e "${GREEN}The system meets security requirements for production deployment.${NC}"
    elif [[ $FAILED_CHECKS -le 2 && $WARNING_CHECKS -le 10 ]]; then
        echo -e "${YELLOW}⚠️  LAUNCH READINESS: CONDITIONAL - Address Critical Issues${NC}"
        echo -e "${YELLOW}Minor security gaps exist. Address failures before launch.${NC}"
    else
        echo -e "${RED}❌ LAUNCH READINESS: NOT READY${NC}"
        echo -e "${RED}Significant security gaps must be addressed before launch.${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}📋 Detailed Report: $CHECKLIST_REPORT${NC}"
    echo ""
    echo -e "${PURPLE}=================================================================================${NC}"
    
    # Exit with appropriate code
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi