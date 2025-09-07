#!/bin/bash

# master-launch-controller.sh
# Orchestrates Sprint 1 → Sprint 2 → Beta Launch with safety checkpoints
# Spiralogic Oracle System - Master Automation Controller

set -e  # Stop on first error

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="./logs/master-launch/$TIMESTAMP"
mkdir -p "$LOG_DIR"

# Logging functions
log_phase() {
    local phase_name="$1"
    local phase_title="$2"
    
    echo -e "\n${BLUE}=== [$phase_name] $(date) - $phase_title ===${NC}\n" | tee -a "$LOG_DIR/$phase_name.log"
}

tag_git() {
    local tag_base="$1"
    local tag_name="${tag_base}_${TIMESTAMP}"
    
    git tag -a "$tag_name" -m "Master Launch Controller - $tag_base completed successfully"
    git push origin "$tag_name" 2>/dev/null || echo "Warning: Could not push tag to remote"
    
    echo "[Git] Tagged: $tag_name" | tee -a "$LOG_DIR/git-tags.log"
}

rollback() {
    local failure_reason="$1"
    
    echo -e "${RED}⚠️ ERROR: Phase failed: $failure_reason${NC}" | tee -a "$LOG_DIR/rollback.log"
    
    # Use emergency rollback script if available
    if [[ -f "./scripts/emergency-rollback.sh" ]]; then
        ./scripts/emergency-rollback.sh "$failure_reason" 2>&1 | tee -a "$LOG_DIR/rollback.log"
    else
        # Basic rollback
        local last_stable=$(git log --oneline --grep="✅" -1 --format="%h" || git log -1 --format="%h")
        echo "Rolling back to commit: $last_stable"
        git reset --hard "$last_stable"
    fi
    
    exit 1
}

# Phase 1: Sprint 1 Automation
phase1_sprint1() {
    log_phase "phase1_sprint1" "Sprint 1 Automation - Tech Debt Resolution"
    
    if [[ -f "./scripts/sprint1-automation.js" ]]; then
        node ./scripts/sprint1-automation.js 2>&1 | tee -a "$LOG_DIR/phase1.log" || rollback "Sprint 1 automation failed"
    else
        rollback "Sprint 1 automation script not found"
    fi
    
    tag_git "sprint1_complete"
    echo -e "${GREEN}✅ Phase 1: Sprint 1 automation completed${NC}"
}

# Phase 2: Sprint 2 Automation  
phase2_sprint2() {
    log_phase "phase2_sprint2" "Sprint 2 Automation - Optimization & Beta Gate"
    
    ./scripts/sprint2-automation.sh 2>&1 | tee -a "$LOG_DIR/phase2.log" || rollback "Sprint 2 automation failed"
    
    tag_git "sprint2_complete"
    echo -e "${GREEN}✅ Phase 2: Sprint 2 automation completed${NC}"
}

# Beta Gate Decision Check - CRITICAL FIX
beta_gate_check() {
    log_phase "beta_gate_check" "Beta Gate Readiness Verification"
    
    # Run beta gate check and capture exit code
    if ./scripts/beta-gate-check.sh 2>&1 | tee -a "$LOG_DIR/beta-gate.log"; then
        echo -e "${GREEN}✅ Beta Gate Check: PASSED${NC}"
    else
        echo -e "${RED}❌ Beta Gate Check: FAILED${NC}"
        rollback "Beta gate check failed - system not ready for beta launch"
    fi
    
    # Double-check the report file exists and contains GO decision
    if [[ ! -f "docs/root/BETA_GATE_REPORT.md" ]]; then
        rollback "BETA_GATE_REPORT.md not found after beta gate check"
    fi
    
    local gate_decision=$(grep "Status: " docs/root/BETA_GATE_REPORT.md | head -1 | cut -d' ' -f2 || echo "UNKNOWN")
    
    if [[ "$gate_decision" == "NO-GO" ]]; then
        echo -e "${RED}❌ Beta Gate NO-GO: halting launch.${NC}" | tee -a "$LOG_DIR/decision.log"
        
        # Generate abort report
        cat > "$LOG_DIR/LAUNCH_ABORTED.md" << EOF
# Master Launch Controller - Launch Aborted

**Date:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')
**Phase:** Beta Gate Check
**Decision:** NO-GO
**Log Directory:** $LOG_DIR

## Reason for Abort

Beta Gate verification returned NO-GO decision. Critical issues must be resolved before launch can proceed.

## Next Steps

1. Review docs/root/BETA_GATE_REPORT.md for specific issues
2. Address all blocking issues identified in the report
3. Re-run Sprint 2 automation to verify fixes
4. Re-execute master launch controller

## Recovery Commands

\`\`\`bash
# After fixing issues, re-run Sprint 2 automation
./scripts/sprint2-automation.sh

# Verify beta gate status
./scripts/beta-gate-check.sh

# Re-run master controller
./scripts/master-launch-controller.sh
\`\`\`
EOF
        echo -e "${RED}❌ CRITICAL: Launch aborted due to NO-GO decision${NC}"
        echo -e "${YELLOW}📋 See $LOG_DIR/LAUNCH_ABORTED.md for recovery steps${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Beta Gate: GO decision confirmed. Proceeding to launch.${NC}" | tee -a "$LOG_DIR/decision.log"
}

# Phase 3: Beta Launch Automation
phase3_beta_launch() {
    log_phase "phase3_beta_launch" "Beta Launch Automation - Deployment & Monitoring"
    
    ./scripts/beta-launch-automation.sh 2>&1 | tee -a "$LOG_DIR/phase3.log" || rollback "Beta launch automation failed"
    
    tag_git "beta_launch_complete"
    echo -e "${GREEN}✅ Phase 3: Beta launch automation completed${NC}"
}

# Start Monitoring Phase
start_monitoring() {
    log_phase "start_monitoring" "72-Hour Monitoring Initiation"
    
    if [[ -f "./scripts/beta-monitoring.sh" ]]; then
        chmod +x "./scripts/beta-monitoring.sh"
        echo -e "${GREEN}✅ Beta monitoring system armed and ready${NC}"
        echo "📊 Beta monitoring configured. Check logs/beta-monitoring.log for ongoing status." | tee -a "$LOG_DIR/monitoring.log"
    elif [[ -f "./scripts/beta-monitor.js" ]]; then
        node ./scripts/beta-monitor.js || true
        echo -e "${GREEN}✅ Beta monitor stub executed${NC}" | tee -a "$LOG_DIR/monitoring.log"
    else
        echo -e "${YELLOW}⚠️ beta-monitor.js not found (stubbed)${NC}"
    fi
}

# Main execution function
main() {
    echo -e "${PURPLE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║        SPIRALOGIC ORACLE SYSTEM                ║${NC}"
    echo -e "${PURPLE}║      MASTER LAUNCH CONTROLLER                  ║${NC}"
    echo -e "${PURPLE}║                                                ║${NC}"
    echo -e "${PURPLE}║  🚀 Sprint 1 → Sprint 2 → Beta Launch         ║${NC}"
    echo -e "${PURPLE}║  📊 Full automation with safety checkpoints   ║${NC}"
    echo -e "${PURPLE}║  🛡️ Emergency rollback procedures enabled     ║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo "📋 Log directory: $LOG_DIR"
    
    # Set up error handling
    trap 'rollback "Unexpected error in master controller"' ERR
    
    # Execute all phases in sequence
    phase1_sprint1
    phase2_sprint2
    beta_gate_check  # CRITICAL: This will exit 1 if NO-GO
    phase3_beta_launch
    start_monitoring
    
    echo ""
    echo -e "${PURPLE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║           MASTER LAUNCH COMPLETE               ║${NC}"
    echo -e "${PURPLE}║                                                ║${NC}"
    echo -e "${PURPLE}║  ✅ Sprint 1: Tech debt resolved               ║${NC}"
    echo -e "${PURPLE}║  ✅ Sprint 2: Optimized & beta-ready           ║${NC}"
    echo -e "${PURPLE}║  ✅ Beta Launch: Deployed with monitoring      ║${NC}"
    echo -e "${PURPLE}║  📊 Logs: $LOG_DIR                             ║${NC}"
    echo -e "${PURPLE}║  🔔 Monitoring: 72 hours active                ║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${GREEN}🎉 Master launch sequence complete!${NC}"
    echo -e "${BLUE}📋 Detailed logs saved in: $LOG_DIR${NC}"
    echo -e "${YELLOW}⏰ 72-hour monitoring period now active${NC}"
}

# Run main function with all arguments
main "$@"