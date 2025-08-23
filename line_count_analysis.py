#!/usr/bin/env python3

import os
import glob

def count_non_empty_lines(file_path):
    """Count non-empty lines in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            lines = file.readlines()
            non_empty_lines = [line for line in lines if line.strip()]
            return len(non_empty_lines)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0

def find_typescript_files(root_dir):
    """Find all TypeScript files in the project."""
    ts_files = []
    
    # Use glob to find all .ts and .tsx files
    for pattern in ['**/*.ts', '**/*.tsx']:
        files = glob.glob(os.path.join(root_dir, pattern), recursive=True)
        ts_files.extend(files)
    
    # Filter out node_modules and other unwanted directories
    filtered_files = []
    for file in ts_files:
        if not any(exclude in file for exclude in ['node_modules', '.npm-cache', 'dist', 'build', '.git']):
            filtered_files.append(file)
    
    return filtered_files

def analyze_files():
    """Analyze all TypeScript files and generate report."""
    root_dir = '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem'
    
    print("🔍 Analyzing TypeScript files in SpiralogicOracleSystem...")
    print()
    
    ts_files = find_typescript_files(root_dir)
    
    # Count lines for each file
    file_stats = []
    for file_path in ts_files:
        line_count = count_non_empty_lines(file_path)
        relative_path = os.path.relpath(file_path, root_dir)
        file_stats.append((relative_path, line_count))
    
    # Sort by line count (descending)
    file_stats.sort(key=lambda x: x[1], reverse=True)
    
    print(f"📊 Found {len(file_stats)} TypeScript files")
    print()
    
    # Files exceeding 600 lines
    large_files = [f for f in file_stats if f[1] > 600]
    
    if large_files:
        print("🚨 FILES EXCEEDING 600 LINES:")
        print("=" * 80)
        for file_path, line_count in large_files:
            print(f"{file_path}: {line_count} lines")
            
            # Suggest breakdown for each large file
            if 'route.ts' in file_path and 'oracle/turn' in file_path:
                print("   💡 Suggestion: Split into separate provider modules (sesame, claude, psi, ain)")
            elif 'Agent.ts' in file_path or 'agent.ts' in file_path:
                print("   💡 Suggestion: Extract service layer and break into smaller agent classes")
            elif 'Orchestrator.ts' in file_path:
                print("   💡 Suggestion: Split orchestration logic into separate coordination modules")
            elif 'database.types.ts' in file_path:
                print("   💡 Suggestion: Split database types by feature domain (auth, oracle, etc.)")
            else:
                print("   💡 Suggestion: Identify cohesive modules and extract them into separate files")
            print()
    else:
        print("✅ No files found exceeding 600 lines")
        print()
    
    # Top 20 largest files
    print("📋 TOP 20 LARGEST FILES:")
    print("=" * 80)
    for i, (file_path, line_count) in enumerate(file_stats[:20], 1):
        print(f"{i:2d}. {file_path}: {line_count} lines")
    
    print()
    
    # Summary statistics
    total_files = len(file_stats)
    files_over_600 = len([f for f in file_stats if f[1] > 600])
    files_over_400 = len([f for f in file_stats if f[1] > 400])
    files_over_200 = len([f for f in file_stats if f[1] > 200])
    
    print("📈 SUMMARY STATISTICS:")
    print("=" * 80)
    print(f"Total TypeScript files: {total_files}")
    print(f"Files > 600 lines: {files_over_600}")
    print(f"Files > 400 lines: {files_over_400}")
    print(f"Files > 200 lines: {files_over_200}")
    
    if files_over_600 > 0:
        print()
        print("⚠️  RECOMMENDATIONS:")
        print("=" * 80)
        print("• Focus on breaking down files > 600 lines first")
        print("• Look for single responsibility violations")
        print("• Extract utility functions into separate modules")
        print("• Consider using composition over inheritance")
        print("• Split large interfaces/types into logical groups")

if __name__ == "__main__":
    analyze_files()