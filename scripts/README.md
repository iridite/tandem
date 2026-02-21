# Automation Scripts

This directory contains automation scripts for managing the medical fork of Tandem.

## Overview

These scripts help maintain the parallel development workflow:
- **sync-upstream.sh**: Sync with upstream Tandem repository
- **integrate-feature.sh**: Integrate completed features into medical-dev

## Prerequisites

```bash
# Ensure upstream remote is configured
git remote add upstream git@github.com:frumu-ai/tandem.git

# Ensure you have push access to origin
git remote -v
```

## Scripts

### sync-upstream.sh

Synchronizes your fork with the upstream Tandem repository.

**What it does:**
1. Fetches latest changes from upstream
2. Merges upstream/main into local main
3. Pushes updated main to origin
4. Optionally merges main into medical-dev

**Usage:**

```bash
# Run from repository root
./scripts/sync-upstream.sh
```

**When to use:**
- Daily or weekly to stay current with upstream
- Before starting new feature work
- After your PR is merged upstream

**Example output:**
```
=== Tandem Upstream Sync Script ===

Fetching from upstream...
Current branch: medical-dev

=== Syncing main branch ===
Status: 0 commits ahead, 5 commits behind upstream
Merging 5 commits from upstream...
✓ Merged successfully
✓ Pushed to origin

Merge into medical-dev? (y/n) y
=== Merging into medical-dev ===
✓ Merged successfully
✓ Pushed to origin

=== Sync complete ===
```

### integrate-feature.sh

Integrates a completed feature branch into medical-dev.

**What it does:**
1. Syncs main with upstream
2. Checks if feature is merged upstream (PR merged)
3. Merges feature into medical-dev (from main if merged, from feature branch if not)
4. Pushes to origin
5. Optionally deletes feature branch

**Usage:**

```bash
# Integrate a feature branch
./scripts/integrate-feature.sh feature/citation-manager

# List available feature branches
./scripts/integrate-feature.sh
```

**When to use:**
- After your PR is merged upstream
- When you want to use a feature in medical-dev before PR is merged
- To consolidate multiple features

**Example scenarios:**

**Scenario 1: PR merged upstream**
```bash
# Your PR #2 (citation-manager) was merged
./scripts/integrate-feature.sh feature/citation-manager

# Output:
# ✓ All feature commits are in main (PR merged)
# Merging from main (contains feature)...
# ✓ Merged successfully
```

**Scenario 2: PR not merged yet**
```bash
# You want to use the feature before PR is merged
./scripts/integrate-feature.sh feature/debate-mode

# Output:
# ⚠ Feature not fully merged (0/12 commits in main)
# Merging feature branch directly (not in main yet)...
# ✓ Merged successfully
```

## Workflow Examples

### Daily Development

```bash
# Morning: sync with upstream
./scripts/sync-upstream.sh

# Work on feature
git checkout -b feature/my-feature
# ... make changes ...
git commit -m "feat: implement my feature"

# Create PR to upstream
gh pr create --base main --head feature/my-feature

# Use feature immediately in medical-dev
./scripts/integrate-feature.sh feature/my-feature
```

### After PR Merged

```bash
# Your PR was merged upstream
# Sync to get the merged changes
./scripts/sync-upstream.sh

# Integrate into medical-dev (will use main)
./scripts/integrate-feature.sh feature/my-feature

# Script will offer to delete the feature branch
```

### Weekly Maintenance

```bash
# Every Monday morning
./scripts/sync-upstream.sh

# Check for conflicts in medical-dev
git checkout medical-dev
cargo build --features medical
cargo test --features medical
```

## Troubleshooting

### Merge Conflicts

If you encounter merge conflicts:

```bash
# Script will stop and show conflicted files
git status

# Resolve conflicts manually
# Edit conflicted files
git add <resolved-files>
git merge --continue

# Push manually
git push origin medical-dev
```

### Uncommitted Changes

Scripts will refuse to run if you have uncommitted changes:

```bash
# Stash your changes
git stash

# Run script
./scripts/sync-upstream.sh

# Restore changes
git stash pop
```

### Remote Not Found

If upstream remote is not configured:

```bash
# Add upstream remote
git remote add upstream git@github.com:frumu-ai/tandem.git

# Verify
git remote -v
```

### Permission Denied

If scripts are not executable:

```bash
chmod +x scripts/*.sh
```

## Best Practices

1. **Sync regularly**: Run `sync-upstream.sh` at least weekly
2. **Clean branches**: Delete feature branches after integration
3. **Test after integration**: Always run tests after merging
4. **Commit before syncing**: Never sync with uncommitted changes
5. **Review conflicts carefully**: Don't blindly accept changes

## Advanced Usage

### Custom Upstream

Edit scripts to use different upstream:

```bash
# In sync-upstream.sh
UPSTREAM_REPO="git@github.com:your-org/tandem.git"
```

### Dry Run

To see what would happen without making changes:

```bash
# Add --dry-run flag (requires script modification)
# Or manually inspect:
git fetch upstream
git log --oneline HEAD..upstream/main
```

### Automated Syncing

Set up a cron job for daily syncing:

```bash
# Add to crontab
0 9 * * * cd /path/to/tandem && ./scripts/sync-upstream.sh
```

## Related Documentation

- [BRANCH_STRATEGY.md](../docs/medical-research/BRANCH_STRATEGY.md) - Branch management strategy
- [PARALLEL_ROADMAP.md](../docs/medical-research/PARALLEL_ROADMAP.md) - Development timeline
- [WORKFLOW_GUIDE.md](../docs/medical-research/WORKFLOW_GUIDE.md) - Complete workflow guide

## Support

If you encounter issues:

1. Check script output for error messages
2. Review git status: `git status`
3. Check remote configuration: `git remote -v`
4. Consult documentation in `docs/medical-research/`

---

**Last Updated**: 2025-02-15