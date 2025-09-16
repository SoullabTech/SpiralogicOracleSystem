# Sprint 2 + Beta Gate Enhanced Automation

## Overview

This enhanced automation system builds on Sprint 1 success to deliver complete Sprint 2 objectives plus automated beta readiness verification.

---

## 🚀 **Quick Start - Claude Code Automation**

### **Copy-Paste Automation Prompt**

```markdown
# CLAUDE_CODE_AUTOMATION: Sprint 2 + Beta Launch Gate

You are Spiralogic Oracle System's CI/CD automation agent.  
Run the following workflow **step-by-step in order**, committing after each major phase, with full logging.

---

## **Phase 1 – Security Patching**
1. For each workspace, run:
   ```bash
   npm audit --json > docs/security-audit/pre-audit.json
   npm audit fix
   npm audit fix --force || true
   ```

2. Record pre- and post-vulnerability counts in `docs/security-audit/SECURITY_REPORT.md`.
3. Commit changes:
   ```bash
   git add .
   git commit -m "fix: security patching Sprint 2 Phase 1"
   ```

---

## **Phase 2 – Test Suite Restoration**

1. Update Jest config:
   * Migrate from deprecated `globals.ts-jest` to:
     ```json
     "transform": {
       "^.+\\.tsx?$": ["ts-jest", { "tsconfig": "tsconfig.json" }]
     }
     ```
2. Fix all import path issues using TypeScript path mapping in `tsconfig.json`.
3. Run:
   ```bash
   npm run test --workspaces -- --passWithNoTests --coverage
   ```
4. Save coverage report to `docs/testing/coverage/`.
5. Commit:
   ```bash
   git add .
   git commit -m "test: restore full test suite with coverage"
   ```

---

## **Phase 3 – Dependency Cleanup**

1. For each workspace, run:
   ```bash
   npx depcheck > docs/dependency-audit/<workspace>-unused.txt
   ```
2. Move unused dependencies to `dev-archive/dependencies/<timestamp>/` **instead of deleting**.
3. Reduce total packages from ~975 → target <800.
4. Build & run tests to confirm stability.
5. Commit:
   ```bash
   git add .
   git commit -m "chore: dependency cleanup and optimization"
   ```

---

## **Phase 4 – Performance Baseline**

1. Run backend locally and execute:
   ```bash
   npm run profile:api
   npm run profile:db
   npm run profile:cache
   ```
2. Save results in `docs/performance/BASELINE.md` with:
   * API avg response time
   * DB query speed
   * Redis hit/miss ratio
3. Commit:
   ```bash
   git add .
   git commit -m "perf: baseline metrics for beta readiness"
   ```

---

## **Phase 5 – Beta Gate Verification**

1. Validate:
   * ✅ Zero high-severity vulnerabilities (`npm audit`)
   * ✅ All tests pass with >80% coverage
   * ✅ `/api/v1/health` returns 200 OK consistently
   * ✅ Core workflows pass functional tests
   * ✅ No CPU/memory spikes under simulated load
2. Generate `/docs/root/BETA_GATE_REPORT.md`:
   ```
   ## Beta Gate Decision

   Status: GO / NO-GO

   Summary:
   - Vulnerabilities: X (High: 0, Medium: Y, Low: Z)
   - Test Coverage: __%
   - Performance: API __ms avg
   - Critical Workflows: Pass/Fail
   - Remaining Risks: ...
   ```
3. Commit final report:
   ```bash
   git add .
   git commit -m "docs: beta gate report Sprint 2 complete"
   ```

---

## Safety Rules

* Always **quarantine** before removal.
* If any phase fails:
  * Attempt automated fix
  * If still failing, rollback to last commit
* Keep staging branch isolated until final "GO" decision.
```

---

## 🛠️ **Advanced: Bash Script Execution**

For developers who prefer direct script execution:

### **Full Sprint 2 Automation**
```bash
./scripts/sprint2-automation.sh
```

### **Quick Beta Gate Check**
```bash
./scripts/beta-gate-check.sh
```

---

## 📊 **Expected Outcomes**

### **Security Improvements**
- **Target**: Zero high-severity vulnerabilities
- **Method**: Automated patching with force updates
- **Documentation**: Complete audit trail in `docs/security-audit/`

### **Test Suite Restoration**  
- **Target**: >80% test coverage
- **Method**: Modern Jest configuration with path mapping
- **Documentation**: Coverage reports in `docs/testing/coverage/`

### **Dependency Optimization**
- **Target**: 960 → <800 packages (17% reduction)
- **Method**: Safe quarantine-first removal strategy
- **Documentation**: Cleanup strategy in `docs/dependency-audit/`

### **Performance Baseline**
- **Target**: <500ms API response times
- **Method**: Automated health endpoint testing
- **Documentation**: Baseline metrics in `docs/performance/`

### **Beta Gate Decision**
- **Target**: Automated GO/NO-GO determination
- **Method**: Multi-criteria evaluation system
- **Documentation**: Complete decision report in `docs/root/BETA_GATE_REPORT.md`

---

## 🚨 **Safety Features**

### **Automated Rollback**
- Every phase creates Git checkpoints
- Failed operations trigger automatic rollback
- Manual recovery procedures documented

### **Quarantine System**
- No permanent deletions during cleanup
- All removed files staged in `dev-archive/dependencies/`
- Timestamped for easy restoration

### **Verification Checkpoints**
- Build verification after each phase
- Health endpoint testing
- Dependency integrity checks

---

## 📋 **Integration with Sprint 1**

This automation builds directly on Sprint 1 achievements:

### **Sprint 1 Foundation**
✅ **Security**: 9/10 vulnerabilities patched  
✅ **Build**: TypeScript compilation stable  
✅ **Runtime**: ES module resolution fixed  
✅ **Configuration**: Jest/ts-jest modernized  

### **Sprint 2 Enhancement**  
🔄 **Security**: Complete vulnerability elimination  
🔄 **Testing**: Full coverage restoration  
🔄 **Dependencies**: Strategic cleanup execution  
🔄 **Performance**: Baseline establishment  
🆕 **Beta Gate**: Production readiness verification  

---

## 🎯 **Success Criteria**

### **Critical (Must Pass)**
- [ ] Zero high-severity security vulnerabilities
- [ ] TypeScript build compilation 100% successful
- [ ] Health endpoint responding <1s consistently
- [ ] No runtime errors during startup

### **Important (Should Pass)**  
- [ ] Test coverage >75%
- [ ] Package count <850 (improvement from 960)
- [ ] API response times <1s average
- [ ] Memory usage stable under load

### **Optimization (Nice to Have)**
- [ ] Test coverage >90%  
- [ ] Package count <800 (target achieved)
- [ ] API response times <500ms average
- [ ] Zero memory leaks detected

---

## 🔄 **Post-Sprint 2 Actions**

### **If Beta Gate = GO**
1. **Deploy to Staging**: Full environment testing
2. **Performance Monitoring**: 24-hour baseline establishment  
3. **Beta Release**: Gradual rollout with feature flags
4. **Sprint 3**: Focus on optimization and monitoring

### **If Beta Gate = NO-GO**  
1. **Critical Fix Sprint**: Address blocking issues immediately
2. **Re-run Automation**: Verify fixes with full automation
3. **Stakeholder Communication**: Updated timeline and risks
4. **Sprint 3**: Continue with critical fixes + optimization

---

## 📞 **Support & Troubleshooting**

### **Common Issues**
- **Jest Configuration**: Check `backend/jest.config.js` for proper ts-jest setup
- **Health Endpoint**: Verify server startup logs for Redis/DB connection issues  
- **Dependency Conflicts**: Review `dev-archive/dependencies/` for restoration candidates
- **Security Patches**: Check for breaking changes in updated packages

### **Recovery Procedures**
- **Git Reset**: `git reset --hard HEAD~1` to undo last phase
- **File Restoration**: Copy from `dev-archive/dependencies/<timestamp>/`
- **Configuration Rollback**: Restore `*.config.js.bak` files
- **Clean Reinstall**: `rm -rf node_modules && npm install`

---

*This enhanced automation system ensures reliable, repeatable, and safe progression from Sprint 1 through beta readiness verification.*