#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
UPSTREAM_REPO="git@github.com:frumu-ai/tandem.git"
UPSTREAM_NAME="upstream"
MAIN_BRANCH="main"
MEDICAL_DEV_BRANCH="medical-dev"

echo -e "${BLUE}=== Tandem Upstream Sync Script ===${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    echo "Please commit or stash your changes before syncing."
    git status --short
    exit 1
fi

# Add upstream remote if it doesn't exist
if ! git remote | grep -q "^${UPSTREAM_NAME}$"; then
    echo -e "${YELLOW}Adding upstream remote: ${UPSTREAM_REPO}${NC}"
    git remote add ${UPSTREAM_NAME} ${UPSTREAM_REPO}
fi

# Fetch from upstream
echo -e "${BLUE}Fetching from upstream...${NC}"
git fetch ${UPSTREAM_NAME}

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${GREEN}${CURRENT_BRANCH}${NC}\n"

# Sync main branch
echo -e "${BLUE}=== Syncing ${MAIN_BRANCH} branch ===${NC}"
git checkout ${MAIN_BRANCH}

# Check if we're behind upstream
BEHIND=$(git rev-list --count HEAD..${UPSTREAM_NAME}/${MAIN_BRANCH})
AHEAD=$(git rev-list --count ${UPSTREAM_NAME}/${MAIN_BRANCH}..HEAD)

echo "Status: ${AHEAD} commits ahead, ${BEHIND} commits behind upstream"

if [ "$BEHIND" -eq 0 ]; then
    echo -e "${GREEN}Already up to date with upstream${NC}"
else
    echo -e "${YELLOW}Merging ${BEHIND} commits from upstream...${NC}"
    git merge ${UPSTREAM_NAME}/${MAIN_BRANCH} --no-edit
    echo -e "${GREEN}✓ Merged successfully${NC}"

    # Push to origin
    echo -e "${BLUE}Pushing to origin...${NC}"
    git push origin ${MAIN_BRANCH}
    echo -e "${GREEN}✓ Pushed to origin${NC}"
fi

# Ask if user wants to merge into medical-dev
echo ""
read -p "Merge into ${MEDICAL_DEV_BRANCH}? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}=== Merging into ${MEDICAL_DEV_BRANCH} ===${NC}"

    # Check if medical-dev branch exists
    if git show-ref --verify --quiet refs/heads/${MEDICAL_DEV_BRANCH}; then
        git checkout ${MEDICAL_DEV_BRANCH}

        # Check for conflicts before merging
        if git merge ${MAIN_BRANCH} --no-commit --no-ff; then
            git merge --continue --no-edit
            echo -e "${GREEN}✓ Merged successfully${NC}"

            # Push to origin
            echo -e "${BLUE}Pushing to origin...${NC}"
            git push origin ${MEDICAL_DEV_BRANCH}
            echo -e "${GREEN}✓ Pushed to origin${NC}"
        else
            echo -e "${RED}Merge conflicts detected!${NC}"
            echo "Please resolve conflicts manually:"
            git status
            exit 1
        fi
    else
        echo -e "${YELLOW}Branch ${MEDICAL_DEV_BRANCH} does not exist${NC}"
        echo "Create it with: git checkout -b ${MEDICAL_DEV_BRANCH}"
    fi
fi

# Return to original branch
if [ "$CURRENT_BRANCH" != "$(git branch --show-current)" ]; then
    echo -e "\n${BLUE}Returning to ${CURRENT_BRANCH}${NC}"
    git checkout ${CURRENT_BRANCH}
fi

echo -e "\n${GREEN}=== Sync complete ===${NC}"
echo "Summary:"
git log --oneline ${UPSTREAM_NAME}/${MAIN_BRANCH} -5
