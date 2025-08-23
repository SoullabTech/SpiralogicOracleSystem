# NPM Lockfile Sync Fix Guide

## Problem
Your Docker builds are failing with "Missing from lock file" errors because package-lock.json is out of sync with package.json files.

## Quick Fix (Implemented)
1. ✅ **Dockerfiles updated** - Temporarily using `npm install` instead of `npm ci`
2. ✅ **Shell script created** - `fix-lockfiles.sh` ready to run
3. ✅ **Proper copy order** - Package files copied before source code

## Run the Fix

```bash
# Make script executable and run
chmod +x fix-lockfiles.sh
./fix-lockfiles.sh
```

This will:
- Remove the problematic `-rf` directory
- Regenerate lockfiles for both root and backend
- Verify builds work

## After Running the Script

1. **Commit the new lockfiles**:
```bash
git add package-lock.json backend/package-lock.json
git commit -m "chore: sync lockfiles (root + backend)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

2. **Revert Dockerfiles to use `npm ci`** (for production reliability):

**Dockerfile.dev**:
```dockerfile
# Change this line:
RUN npm install
# Back to:
RUN npm ci
```

**backend/Dockerfile.dev**:
```dockerfile  
# Change this line:
RUN npm install
# Back to:
RUN npm ci
```

3. **Rebuild containers**:
```bash
docker compose -f docker-compose.development.yml build --no-cache
docker compose -f docker-compose.development.yml up -d
```

## Prevention Tips
- Always commit package-lock.json when you add/update dependencies
- Use `npm ci` in production, `npm install` only for development
- Keep Docker copy order: package.json files first, then source code