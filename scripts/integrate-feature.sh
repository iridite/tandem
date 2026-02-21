#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
UPSTREAM_NAME="upstream"
MAIN_BRANCH="main"
MEDICAL_DEV_BRANCH="medical-dev"

echo -e "${BLUE}=== Feature Integration Script ===${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    echo "Please commit or stash your changes before integrating."
    git status --short
    exit 1
fi

# Get feature branch name from argument or prompt
if [ -z "$1" ]; then
    echo "Usage: $0 <feature-branch-name>"
    echo ""
    echo "Example: $0 feature/citation-manager"
    echo ""
    echo "Available feature branches:"
    git branch | grep "feature/" || echo "  (none)"
    exit 1
fi

FEATURE_BRANCH="$1"

# Check if feature branch exists
if ! git show-ref --verify --quiet refs/heads/${FEATURE_BRANCH}; then
    echo -e "${RED}Error: Branch '${FEATURE_BRANCH}' does not exist${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${GREEN}${CURRENT_BRANCH}${NC}\n"

# Step 1: Sync main with upstream
echo -e "${BLUE}=== Step 1: Syncing main with upstream ===${NC}"
git checkout ${MAIN_BRANCH}
git fetch ${UPSTREAM_NAME}

BEHIND=$(git rev-list --count HEAD..${UPSTREAM_NAME}/${MAIN_BRANCH})
if [ "$BEHIND" -gt 0 ]; then
    echo -e "${YELLOW}Merging ${BEHIND} commits from upstream...${NC}"
    git merge ${UPSTREAM_NAME}/${MAIN_BRANCH} --no-edit
    git push origin ${MAIN_BRANCH}
    echo -e "${GREEN}✓ Main branch updated${NC}"
else
    echo -e "${GREEN}✓ Main branch already up to date${NC}"
fi

# Step 2: Check if feature is in main (merged upstream)
echo -e "\n${BLUE}=== Step 2: Checking if feature is merged upstream ===${NC}"

# Get the first commit of the feature branch
FEATURE_BASE=$(git merge-base ${MAIN_BRANCH} ${FEATURE_BRANCH})
FEATURE_COMMITS=$(git log --oneline ${FEATURE_BASE}..${FEATURE_BRANCH} | wc -l)

echo "Feature branch has ${FEATURE_COMMITS} commits"

# Check if feature commits are in main
MERGED_COMMITS=0
for commit in $(git log --format=%H ${FEATURE_BASE}..${FEATURE_BRANCH}); do
    if git branch ${MAIN_BRANCH} --contains ${commit} > /dev/null 2>&1; then
        ((MERGED_COMMITS++))
    fi
done

if [ "$MERGED_COMMITS" -eq "$FEATURE_COMMITS" ]; then
    echo -e "${GREEN}✓ All feature commits are in main (PR merged)${NC}"
    FEATURE_MERGED=true
else
    echo -e "${YELLOW}⚠ Feature not fully merged (${MERGED_COMMITS}/${FEATURE_COMMITS} commits in main)${NC}"
    FEATURE_MERGED=false
fi

# Step 3: Integrate into medical-dev
echo -e "\n${BLUE}=== Step 3: Integrating into ${MEDICAL_DEV_BRANCH} ===${NC}"

if ! git show-ref --verify --quiet refs/heads/${MEDICAL_DEV_BRANCH}; then
    echo -e "${RED}Error: Branch ${MEDICAL_DEV_BRANCH} does not exist${NC}"
    exit 1
fi

git checkout ${MEDICAL_DEV_BRANCH}

if [ "$FEATURE_MERGED" = true ]; then
    # Feature is in main, just merge main
    echo "Merging from main (contains feature)..."
    if git merge ${MAIN_BRANCH} --no-commit --no-ff; then
        git merge --continue --no-edit
        echo -e "${GREEN}✓ Merged successfully${NC}"
    else
        echo -e "${RED}Merge conflicts detected!${NC}"
        echo "Resolve conflicts and run: git merge --continue"
        exit 1
    fi
else
    # Feature not in main yet, merge feature branch directly
    echo "Merging feature branch directly (not in main yet)..."
    if git merge ${FEATURE_BRANCH} --no-commit --no-ff; then
        git merge --continue --no-edit
        echo -e "${GREEN}✓ Merged successfully${NC}"
    else
        echo -e "${RED}Merge conflicts detected!${NC}"
        echo "Resolve conflicts and run: git merge --continue"
        exit 1
    fi
fi

# Step 4: Push to origin
echo -e "\n${BLUE}=== Step 4: Pushing to origin ===${NC}"
git push origin ${MEDICAL_DEV_BRANCH}
echo -e "${GREEN}✓ Pushed to origin${NC}"

# Step 5: Cleanup (optional)
echo -e "\n${BLUE}=== Step 5: Cleanup ===${NC}"
if [ "$FEATURE_MERGED" = true ]; then
    echo -e "${YELLOW}Feature branch '${FEATURE_BRANCH}' can be deleted${NC}"
    read -p "Delete feature branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -d ${FEATURE_BRANCH}
        echo -e "${GREEN}✓ Deleted local branch${NC}"

        # Check if remote branch exists
        if git ls-remote --heads origin ${FEATURE_BRANCH} | grep -q ${FEATURE_BRANCH}; then
            read -p "Delete remote branch? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push origin --delete ${FEATURE_BRANCH}
                echo -e "${GREEN}✓ Deleted remote branch${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}Feature not merged upstream yet - keeping branch${NC}"
fi

# Return to original branch
if [ "$CURRENT_BRANCH" != "$(git branch --show-current)" ]; then
    echo -e "\n${BLUE}Returning to ${CURRENT_BRANCH}${NC}"
    git checkout ${CURRENT_BRANCH}
fi

echo -e "\n${GREEN}=== Integration complete ===${NC}"
echo "Summary:"
echo "  Feature: ${FEATURE_BRANCH}"
echo "  Merged into: ${MEDICAL_DEV_BRANCH}"
echo "  Status: $([ "$FEATURE_MERGED" = true ] && echo "Upstream merged" || echo "Direct merge")"
