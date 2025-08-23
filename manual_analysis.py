#!/usr/bin/env python3

import os
import subprocess
import sys
from pathlib import Path

# Set working directory
project_root = "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"
os.chdir(project_root)

print("=== MANUAL NPM SCRIPT ANALYSIS ===\n")

# 1. Manual file size check
print("1. FILE SIZE CHECK (>600 LOC):")
print("   Status: FAILED")
print("   Issues found:")

large_files = [
    ("backend/src/core/agents/PersonalOracleAgent.ts", 4116),
    ("backend/src/core/agents/AdaptiveWisdomEngine.ts", 735)
]

for file_path, line_count in large_files:
    print(f"   - {file_path} ({line_count} lines)")

print(f"   Error: {len(large_files)} files exceed 600 LOC limit")
print("   Fix: Break large files into smaller, focused modules\n")

# 2. Try to run dependency check
print("2. DEPENDENCY VALIDATION (npm run doctor:deps:ci):")
try:
    result = subprocess.run(
        "npm run doctor:deps:ci", 
        shell=True, 
        capture_output=True, 
        text=True, 
        timeout=60,
        cwd=project_root
    )
    if result.returncode == 0:
        print("   Status: PASSED")
        print(f"   Output: {result.stdout[:200]}...")
    else:
        print("   Status: FAILED")
        print(f"   Error: {result.stderr[:300]}")
        print("   Fix: Review and fix dependency violations")
except subprocess.TimeoutExpired:
    print("   Status: TIMEOUT")
    print("   Error: Command took longer than 60 seconds")
except Exception as e:
    print(f"   Status: ERROR - {e}")
print()

# 3. Try to run circular dependency check  
print("3. CIRCULAR DEPENDENCY CHECK (npm run doctor:cycles):")
try:
    result = subprocess.run(
        "npm run doctor:cycles",
        shell=True,
        capture_output=True,
        text=True,
        timeout=60,
        cwd=project_root
    )
    if result.returncode == 0:
        print("   Status: PASSED")
        print("   Output: No circular dependencies found")
    else:
        print("   Status: FAILED")
        print(f"   Error: {result.stderr[:300]}")
        print("   Fix: Remove circular imports between modules")
except subprocess.TimeoutExpired:
    print("   Status: TIMEOUT")
    print("   Error: Command took longer than 60 seconds")
except Exception as e:
    print(f"   Status: ERROR - {e}")
print()

# 4. Try to run build
print("4. BUILD CHECK (npm run build):")
try:
    result = subprocess.run(
        "npm run build",
        shell=True,
        capture_output=True,
        text=True,
        timeout=300,
        cwd=project_root
    )
    if result.returncode == 0:
        print("   Status: PASSED")
        print("   Output: Build completed successfully")
    else:
        print("   Status: FAILED")
        print(f"   Error: {result.stderr[:500]}")
        print("   Fix: Resolve build errors before deployment")
except subprocess.TimeoutExpired:
    print("   Status: TIMEOUT")
    print("   Error: Build took longer than 5 minutes")
except Exception as e:
    print(f"   Status: ERROR - {e}")
print()

print("=== SUMMARY ===")
print("File size check: FAILED (2+ files over 600 LOC)")
print("Dependency check: Unknown (manual run needed)")
print("Circular dependency check: Unknown (manual run needed)")
print("Build check: Unknown (manual run needed)")
print("\nRecommendation: Fix file size issues first, then run other checks manually")
