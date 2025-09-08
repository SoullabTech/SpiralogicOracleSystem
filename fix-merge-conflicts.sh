#!/bin/bash

# Fix all merge conflicts by choosing HEAD version (without HTML entities)
echo "Fixing merge conflicts in agent files..."

# Find all files with merge conflicts
files=$(grep -r "<<<<<<< HEAD" apps/api/backend/src/agents/ -l)

for file in $files; do
    echo "Fixing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Process the file line by line
    in_conflict=false
    choose_head=true
    
    while IFS= read -r line; do
        if [[ "$line" == "<<<<<<< HEAD" ]]; then
            in_conflict=true
            choose_head=true
            continue
        elif [[ "$line" == "======="* ]]; then
            choose_head=false
            continue
        elif [[ "$line" == ">>>>>>>"* ]]; then
            in_conflict=false
            continue
        elif [[ $in_conflict == false ]]; then
            echo "$line" >> "$temp_file"
        elif [[ $choose_head == true ]]; then
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file with fixed version
    mv "$temp_file" "$file"
done

echo "All merge conflicts fixed!"