#!/bin/bash

echo "🔍 Scanning for submodules and rogue .git directories..."

# 1. Remove submodule entries from the index
git submodule deinit -f .
git rm --cached -r apps/oracle-frontend/swisseph
rm -rf .git/modules/apps/oracle-frontend/swisseph

# 2. Remove any nested .git folders inside tracked directories
find . -type d -name ".git" -not -path "./.git" -exec rm -rf {} +

# 3. Clean up .gitmodules if it exists
if [ -f .gitmodules ]; then
  echo "🧽 Removing .gitmodules..."
  rm -f .gitmodules
fi

# 4. Ensure directory is now treated as normal
git add apps/oracle-frontend/swisseph
git commit -m "Clean: Finalize removal of swisseph submodule and nested .git folder"

# 5. Optional: Reset permissions
chmod -R u+rw .

# 6. Final check
echo -e "\n✅ Final git status:"
git status

echo -e "\n✅ Git diff index (check for ghost submodules):"
git ls-files --stage | grep swisseph || echo "✅ No submodule trace left for swisseph."

echo -e "\n🚀 Ready to push changes (run 'git push' if everything looks good)."

