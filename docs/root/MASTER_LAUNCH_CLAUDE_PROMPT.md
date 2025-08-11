# Master Launch Controller - Claude Code Automation Prompt

## 🚀 **Copy-Paste Automation for Claude Code**

```markdown
# CLAUDE_CODE_AUTOMATION: Master Launch Controller - Full Sprint Sequence

You are the Spiralogic Oracle System's **Master Launch Controller**.  
Execute the complete launch sequence **Sprint 1 → Sprint 2 → Beta Launch** with full automation, logging, and safety checkpoints.

---

## **Master Launch Sequence**

Execute the following automation **step-by-step in exact order**, with full logging after each phase:

### **🔧 Phase 0: Prerequisites Check**
1. Verify all automation scripts exist and are executable:
   ```bash
   ls -la scripts/sprint1-automation.js
   ls -la scripts/sprint2-automation.sh  
   ls -la scripts/beta-launch-automation.sh
   ls -la scripts/beta-gate-check.sh
   ```
2. Create master launch log directory:
   ```bash
   mkdir -p logs/master-launch/$(date +"%Y%m%d_%H%M%S")
   ```
3. Verify Git status and Node.js availability.

---

### **🚀 Phase 1: Sprint 1 Automation**
1. **Execute Sprint 1 automation:**
   ```bash
   node scripts/sprint1-automation.js 2>&1 | tee logs/master-launch/phase1.log
   ```
2. **Verify Sprint 1 success criteria:**
   - Security vulnerabilities reduced
   - TypeScript compilation successful
   - Jest configuration modernized
   - Server starts without import errors
3. **Create Git checkpoint:**
   ```bash
   git tag "sprint1_complete_$(date +%s)"
   git push origin --tags
   ```
4. **Commit Phase 1 completion:**
   ```bash
   git add .
   git commit -m "master-launch: Sprint 1 automation complete ✅

   🔒 Security: Vulnerabilities patched
   🏗️ Build: TypeScript compilation stable  
   🧪 Tests: Jest configuration modernized
   🚀 Phase: 1/4 complete - Sprint 1 successful"
   ```

---

### **⚡ Phase 2: Sprint 2 Automation**
1. **Execute Sprint 2 automation:**
   ```bash
   ./scripts/sprint2-automation.sh 2>&1 | tee logs/master-launch/phase2.log
   ```
2. **Verify Sprint 2 success criteria:**
   - Test suite restored with coverage
   - Dependency cleanup strategy created
   - Performance baseline established
   - BETA_GATE_REPORT.md generated
3. **Create Git checkpoint:**
   ```bash
   git tag "sprint2_complete_$(date +%s)"
   git push origin --tags
   ```
4. **Commit Phase 2 completion:**
   ```bash
   git add .
   git commit -m "master-launch: Sprint 2 automation complete ✅

   🧪 Tests: Coverage reporting enabled
   📦 Dependencies: Cleanup strategy prepared
   ⚡ Performance: Baseline metrics established  
   🚪 Beta Gate: GO/NO-GO report generated
   🚀 Phase: 2/4 complete - Sprint 2 successful"
   ```

---

### **🚪 Phase 3: Beta Gate Verification**
1. **Execute beta gate check:**
   ```bash
   ./scripts/beta-gate-check.sh 2>&1 | tee logs/master-launch/beta-gate.log
   ```
2. **Read gate decision from report:**
   ```bash
   grep "Status: " docs/root/BETA_GATE_REPORT.md
   ```
3. **Decision Logic:**
   - If **GO**: Continue to Phase 4
   - If **NO-GO**: **STOP LAUNCH** and create abort report
4. **Log decision:**
   ```bash
   echo "Beta Gate Decision: [GO/NO-GO] at $(date)" >> logs/master-launch/decision.log
   ```

---

### **🌍 Phase 4: Beta Launch Automation** *(Only if Beta Gate = GO)*
1. **Execute beta launch automation:**
   ```bash
   ./scripts/beta-launch-automation.sh 2>&1 | tee logs/master-launch/phase4.log
   ```
2. **Verify beta launch success criteria:**
   - 8-phase deployment completed
   - Health endpoints responding
   - PM2 cluster online
   - Monitoring system armed
   - Rollback procedures ready
3. **Create Git checkpoint:**
   ```bash
   git tag "beta_launch_complete_$(date +%s)"
   git push origin --tags
   ```
4. **Commit Phase 4 completion:**
   ```bash
   git add .
   git commit -m "master-launch: Beta launch automation complete ✅

   🌍 Environment: Beta configuration deployed
   🏥 Health: All endpoints responding
   ⚙️ PM2: Cluster mode operational
   📊 Monitoring: 72-hour surveillance active
   🛡️ Rollback: Emergency procedures armed
   🚀 Phase: 4/4 complete - BETA LAUNCH SUCCESSFUL"
   ```

---

### **📊 Phase 5: Final Report Generation**
1. **Generate master launch report:**
   ```bash
   # Create comprehensive master launch report
   cat > logs/master-launch/MASTER_LAUNCH_REPORT.md << 'EOF'
   # Master Launch Controller - Final Report
   
   **Launch Date:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')
   **Total Phases:** 4 of 4 completed successfully
   **Overall Status:** SUCCESS
   
   ## Phase Summary
   - ✅ Sprint 1: Tech debt resolution complete
   - ✅ Sprint 2: Optimization & beta gate passed  
   - ✅ Beta Gate: GO decision approved
   - ✅ Beta Launch: 8-phase deployment successful
   - ✅ Monitoring: 72-hour surveillance active
   
   ## Git Checkpoints Created
   - sprint1_complete_[timestamp]
   - sprint2_complete_[timestamp]  
   - beta_launch_complete_[timestamp]
   
   ## Generated Reports
   - docs/security-audit/SECURITY_REPORT.md
   - docs/root/BETA_GATE_REPORT.md
   - docs/root/BETA_LAUNCH_REPORT.md
   - logs/master-launch/MASTER_LAUNCH_REPORT.md
   
   ## Status: ✅ MASTER LAUNCH SEQUENCE COMPLETE
   EOF
   ```
2. **Final commit:**
   ```bash
   git add .
   git commit -m "master-launch: complete launch sequence finished ✅

   🎯 Master Launch: All 4 phases completed successfully
   📊 Reports: Comprehensive documentation generated
   🏷️ Tags: Git checkpoints created for all phases
   🔔 Monitoring: 72-hour beta monitoring active
   
   🎉 SPIRALOGIC ORACLE SYSTEM BETA LAUNCH COMPLETE!"
   ```

---

## **Safety Protocols**

### **Rollback Triggers**
- **Any script exits with error code ≠ 0**
- **Beta Gate decision = NO-GO**
- **Health endpoints not responding**
- **Build/test failures**

### **Rollback Procedure**
```bash
# If any phase fails:
./scripts/emergency-rollback.sh "Phase X failed: [reason]"
git reset --hard [last_stable_checkpoint]
```

### **Recovery Commands**
```bash  
# After fixing issues, restart from failed phase:
# Sprint 1 failure: Re-run master controller
./scripts/master-launch-controller.sh

# Sprint 2 failure: Start from Sprint 2
./scripts/sprint2-automation.sh && ./scripts/beta-launch-automation.sh

# Beta launch failure: Just beta launch
./scripts/beta-launch-automation.sh
```

---

## **Success Criteria Validation**

After **each phase**, verify these conditions are met:

### **Sprint 1 Success**
- [ ] `npm run build` succeeds without errors
- [ ] `npm audit` shows ≤1 high-severity vulnerabilities  
- [ ] Server starts: `cd backend && npm start` (test for 10 seconds)
- [ ] Health endpoint: `curl http://localhost:3001/health` returns 200

### **Sprint 2 Success**
- [ ] `docs/root/BETA_GATE_REPORT.md` exists
- [ ] Beta Gate status shows "GO" decision
- [ ] Test coverage report generated
- [ ] Performance baseline established

### **Beta Launch Success**  
- [ ] `docs/root/BETA_LAUNCH_REPORT.md` shows "SUCCESS" status
- [ ] PM2 processes online: `pm2 list | grep "online"`
- [ ] Monitoring script executable: `./scripts/beta-monitoring.sh`
- [ ] Rollback script ready: `./scripts/emergency-rollback.sh`

---

## **Expected Timeline**

- **Sprint 1:** 10-15 minutes (security patching, build fixes)
- **Sprint 2:** 15-20 minutes (testing, dependency analysis, gate check)
- **Beta Launch:** 20-25 minutes (8-phase deployment, monitoring setup)
- **Total Duration:** 45-60 minutes for complete sequence

---

## **Final Validation**

At the end, confirm these files exist:
- `logs/master-launch/MASTER_LAUNCH_REPORT.md`
- `docs/root/BETA_LAUNCH_REPORT.md`  
- `docs/root/BETA_GATE_REPORT.md`
- `scripts/beta-monitoring.sh` (running/scheduled)
- Git tags: `git tag | grep -E "(sprint1|sprint2|beta_launch)_complete"`

---

**Status Check:** After completion, the system should have:
- ✅ Zero high-severity vulnerabilities
- ✅ 100% TypeScript compilation success  
- ✅ Health endpoints responding <1s
- ✅ Beta launch deployed with monitoring
- ✅ 72-hour surveillance system active
- ✅ Emergency rollback procedures armed

Execute this **entire sequence** as a single automation workflow. Stop immediately if any phase fails and initiate rollback procedures.
```

---

## **Alternative: Direct Script Execution**

For developers preferring direct terminal execution:

```bash
# Make executable and run
chmod +x scripts/master-launch-controller.sh
./scripts/master-launch-controller.sh
```

This single command handles the entire Sprint 1 → Sprint 2 → Beta Launch sequence with automatic safety checkpoints and comprehensive logging.

---

## **Monitoring After Launch**

Once the master launch completes:

### **Immediate (0-6 hours)**
- Check `logs/beta-monitoring.log` every 15 minutes
- Monitor Slack/Telegram for alerts
- Verify health endpoint: `curl http://localhost:3001/health`

### **Short-term (6-72 hours)**  
- Review performance trends in monitoring logs
- Watch for memory leaks or CPU spikes
- Confirm user onboarding proceeding smoothly

### **Recovery Procedures**
- **Emergency rollback:** `./scripts/emergency-rollback.sh "reason"`
- **Restart monitoring:** `./scripts/beta-monitoring.sh`
- **Re-run full sequence:** `./scripts/master-launch-controller.sh`

---

*This master controller provides complete end-to-end automation for the Spiralogic Oracle System launch with enterprise-grade safety protocols and comprehensive documentation.*