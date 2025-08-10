# CLAUDE_REPO_CLEANUP_AND_STAGING.md

## Objective
Clean and organize the Spiralogic Oracle System repository, prepare a staging branch identical to production, and run regression tests before the next feature cycle — **with a safety-first unused file quarantine**.

---

## Phase 1 – Repository Hygiene

1. **Remove Ghost & OS Files**
   - Delete all `.DS_Store`, `._*` files recursively from repo.
   - Add these patterns to `.gitignore`.

2. **Consolidate Documentation**
   - Move all `.md` files into `/docs`.
   - Update any relative links in markdown and code comments.
   - Create `/docs/README.md` as the master index.

3. **Quarantine Unused Source Files**
   - Scan for `.js`/`.ts` files that are **not imported anywhere**.
   - Move them to `/deprecated/<timestamp>/` instead of deleting.
   - Log the file paths in `/deprecated/unused-files.log`.
   - Commit as:  
     ```
     chore(repo): quarantine unused files
     ```

4. **Standardize Folder Structure**
   ```
   /agents
     /personal_oracle
     /elemental
     /main_oracle
   /services
     /astrology
     /journaling
     /assessment
   /api
   /routes
   /middleware
   /sdk
   /docs
   /tests
   /deprecated
   ```
   - Move misplaced files to correct directories.
   - Commit as:  
     ```
     chore(repo): standardize folder structure
     ```

---

## Phase 2 – Staging Environment Sync

1. **Create Staging Branch**
   - From `main`, create `staging` branch.
   - Push to remote.

2. **Deploy to Staging**
   - Use same `.env` vars as production (safe keys only).
   - Deploy via CI/CD pipeline.

3. **Run Automated Regression Tests**
   - Execute all Jest + integration tests against staging.
   - Save results to `/tests/logs/staging-<date>.log`.

4. **Manual Sanity Checks**
   - Test:
     - `/api/v1/personal-oracle` core flows.
     - Astrology, Journaling, Assessment services.
     - AIN Engine API endpoints.

5. Commit staging test results:
   ```
   test(staging): regression suite results
   ```

---

## Phase 3 – Production Safety Check

1. Compare staging vs production configurations.
2. If all staging tests pass:
   - Merge `staging` → `main`.
   - Trigger production deploy.
3. If staging fails:
   - Do **not** merge.
   - Fix issues in `staging` until all tests pass.

---

## Built-In Script – Unused File Quarantine

Claude Code should create this helper script in `/scripts/quarantine-unused.js`:

```js
// scripts/quarantine-unused.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIRS = ['agents', 'services', 'api', 'routes', 'middleware', 'sdk'];
const DEPRECATED_DIR = path.join(__dirname, '..', 'deprecated', Date.now().toString());
fs.mkdirSync(DEPRECATED_DIR, { recursive: true });

let unusedFiles = [];

SRC_DIRS.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    const files = execSync(`find ${dirPath} -type f -name "*.js" -o -name "*.ts"`)
      .toString().split('\n').filter(Boolean);

    files.forEach(file => {
      const grep = execSync(`grep -R "${path.basename(file)}" . || true`).toString();
      if (!grep.includes(file)) {
        unusedFiles.push(file);
        const dest = path.join(DEPRECATED_DIR, path.basename(file));
        fs.renameSync(file, dest);
      }
    });
  }
});

if (unusedFiles.length) {
  fs.writeFileSync(path.join(DEPRECATED_DIR, 'unused-files.log'), unusedFiles.join('\n'));
  console.log(`Quarantined ${unusedFiles.length} unused files to ${DEPRECATED_DIR}`);
} else {
  console.log('No unused files found.');
}
```

Run it with:

```bash
node scripts/quarantine-unused.js
```

---

## Execution Rules for Claude Code

* Run cleanup **iteratively**, commit after each stage.
* Always run `npm run lint && npm run build` after cleanup.
* Use quarantine before deletion for all unused files.
* Maintain metaphysical/archetypal logic intact.

---

**End Goal:**
A fully cleaned, documented, and staged Spiralogic Oracle System with all unused files quarantined for review before permanent deletion.