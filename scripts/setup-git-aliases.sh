#!/bin/bash

# Setup convenient git aliases for Soullab development

echo "Setting up Soullab git aliases..."

# Safe commit alias
git config --local alias.beta-commit '!f() { ./scripts/safe-commit.sh "$1"; }; f'

# Quick status with branch info
git config --local alias.st 'status -sb'

# Pretty log
git config --local alias.lg 'log --oneline --graph --decorate --all'

# Undo last commit (keep changes)
git config --local alias.undo 'reset HEAD~1 --soft'

# Show what changed in last commit
git config --local alias.last 'log -1 --stat'

echo "✅ Git aliases configured!"
echo ""
echo "Available commands:"
echo "  git beta-commit \"message\"  - Run quality checks, build, commit & push"
echo "  git st                      - Quick status"
echo "  git lg                      - Pretty log graph"
echo "  git undo                    - Undo last commit (keep changes)"
echo "  git last                    - Show last commit details"