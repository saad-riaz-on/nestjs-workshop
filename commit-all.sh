#!/bin/bash

# Script to add and commit all changes in main repo and subrepos

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get commit message
if [ -z "$1" ]; then
    echo "Usage: ./commit-all.sh \"commit message\""
    exit 1
fi

COMMIT_MSG="$1"

# Function to add and commit in a directory
commit_in_dir() {
    local dir=$1
    echo -e "${BLUE}Processing: $dir${NC}"
    cd "$dir" || return
    
    # Add all files
    git add -A
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        echo "No changes to commit in $dir"
    else
        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}✓ Committed changes in $dir${NC}"
    fi
}

# Save current directory
MAIN_DIR=$(pwd)

# Commit in subrepos first
for subrepo in instructor-service instructor-ui participant-service; do
    if [ -d "$subrepo/.git" ]; then
        commit_in_dir "$MAIN_DIR/$subrepo"
    fi
done

# Commit in main repo
cd "$MAIN_DIR"
commit_in_dir "$MAIN_DIR"

echo -e "${GREEN}All repositories processed!${NC}"
