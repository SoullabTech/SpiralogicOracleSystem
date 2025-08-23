#!/usr/bin/env python3
import subprocess
import os
import sys

def run_command(cmd, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=300
        )
        return result
    except subprocess.TimeoutExpired:
        return None
    except Exception as e:
        print(f"Error running command: {e}")
        return None

def main():
    project_dir = "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"
    
    # Change to project directory
    if not os.path.exists(project_dir):
        print(f"Project directory not found: {project_dir}")
        sys.exit(1)
    
    print(f"Checking TypeScript build in: {project_dir}")
    print("=" * 50)
    
    # First, try TypeScript typecheck
    print("Running: npx tsc --noEmit")
    result = run_command(["npx", "tsc", "--noEmit"], cwd=project_dir)
    
    if result is None:
        print("TypeScript check timed out")
    elif result.returncode == 0:
        print("✅ TypeScript typecheck passed!")
        print("STDOUT:", result.stdout if result.stdout else "(no output)")
    else:
        print(f"❌ TypeScript typecheck failed (exit code: {result.returncode})")
        print("STDOUT:", result.stdout if result.stdout else "(no output)")
        print("STDERR:", result.stderr if result.stderr else "(no output)")
    
    print("\n" + "=" * 50)
    
    # Now try the full build
    print("Running: npm run build")
    result = run_command(["npm", "run", "build"], cwd=project_dir)
    
    if result is None:
        print("Build timed out")
    elif result.returncode == 0:
        print("✅ Build passed!")
        print("STDOUT:", result.stdout if result.stdout else "(no output)")
    else:
        print(f"❌ Build failed (exit code: {result.returncode})")
        print("STDOUT:", result.stdout if result.stdout else "(no output)")
        print("STDERR:", result.stderr if result.stderr else "(no output)")

if __name__ == "__main__":
    main()