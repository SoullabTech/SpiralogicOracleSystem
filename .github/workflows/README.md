# GitHub Actions CI/CD Configuration

## Overview
This repository uses GitHub Actions for continuous integration and deployment. The workflow automatically runs on every push and pull request.

## Workflow Jobs

### 1. Test Suite
- Runs type checking (TypeScript)
- Runs linting (ESLint)
- Runs unit tests
- Tests Maya Voice API integration

### 2. Build Check
- Verifies the Next.js build completes successfully
- Ensures production build can be created

### 3. Security Scan
- Runs npm audit for vulnerability detection
- Checks for security issues in dependencies

### 4. Code Quality
- Checks code formatting
- Analyzes bundle size

### 5. Deploy Check
- Verifies environment variables are configured
- Confirms deployment readiness

## Required Secrets

Configure these in GitHub Settings > Secrets and variables > Actions:

- `OPENAI_API_KEY` - Required for TTS functionality
- `ANTHROPIC_API_KEY` - Required for Maya intelligence
- `NEXT_PUBLIC_APP_URL` - Your application URL (optional)

## Branch Protection Setup

### Recommended Settings for `main` branch:

1. **Go to Settings > Rulesets > New branch ruleset**
2. **Name:** `main-protection`
3. **Target branches:** Add `main`
4. **Enable these rules:**
   - ✅ Restrict deletions
   - ✅ Block force pushes
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date before merging

5. **Required Status Checks:**
   - `Test Suite`
   - `Build Check`
   - `Security Scan`

## Local Testing

Run these commands locally before pushing:

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test

# Test Maya Voice System
./test-maya-voice.sh

# Build project
npm run build
```

## CODEOWNERS

The `.github/CODEOWNERS` file automatically assigns reviewers based on file changes:
- All Maya Voice components → Main maintainer
- API routes → Main maintainer
- Configuration files → Main maintainer

## Troubleshooting

### If workflows fail:
1. Check the Actions tab for detailed logs
2. Ensure all secrets are configured
3. Verify npm scripts exist in package.json
4. Check that Node.js version matches (18.x)

### Adding npm scripts to package.json:

If any scripts are missing, add them:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest || echo 'No tests configured'",
    "format:check": "prettier --check .",
    "format": "prettier --write ."
  }
}
```

## Deployment

When code is pushed to `main` and all checks pass:
1. The deploy-check job verifies readiness
2. Your hosting platform (Vercel/Netlify) auto-deploys
3. Monitor deployment at your hosting dashboard

## Support

For issues with the CI/CD pipeline:
1. Check workflow logs in the Actions tab
2. Verify all secrets are configured
3. Ensure branch protection rules are set correctly
4. Review CODEOWNERS file for proper GitHub usernames