# Git Strategy: Managing Content Separately

This document explores strategies for separating the `content/` directory into its own Git repository while keeping the Quartz codebase in the main repository.

## Table of Contents

- [Motivation](#motivation)
- [Options Overview](#options-overview)
- [Option 1: Git Submodules (Standard Usage)](#option-1-git-submodules-standard-usage)
- [Option 2: Git Submodules (Ignoring Gitlink)](#option-2-git-submodules-ignoring-gitlink)
- [Option 3: Separate Repos Without Submodules](#option-3-separate-repos-without-submodules)
- [Vercel Deployment](#vercel-deployment)
- [Obsidian Git Plugin Compatibility](#obsidian-git-plugin-compatibility)
- [Local Development: Quartz Content Directory Options](#local-development-quartz-content-directory-options)
- [Recommendation](#recommendation)

---

## Motivation

Reasons to separate content from code:

- **Separation of concerns** — Content and code have independent version histories
- **Access control** — Different collaborators for content vs. code
- **Independent workflows** — Writers can push content without touching the codebase
- **Reusability** — Same content could power multiple sites or themes
- **Cleaner history** — Content commits don't clutter the code repo's log

Reasons to keep everything in one repo:

- **Simplicity** — Single repo, single push, single deploy
- **Atomic commits** — Code and content changes can be committed together
- **No additional tooling** — Works with any Git workflow out of the box

---

## Options Overview

| Option | Description | Complexity | Vercel Setup |
|--------|-------------|------------|--------------|
| **1. Submodules (Standard)** | Content repo as submodule, keep gitlink in sync | High | Enable submodules |
| **2. Submodules (Ignore Gitlink)** | Submodule exists but always pull latest | Medium | Custom build command |
| **3. Separate Repos (No Submodule)** | Content cloned at build time, gitignored locally | Low | Custom build command |

---

## Option 1: Git Submodules (Standard Usage)

### How It Works

A Git submodule links one repository inside another. The parent repo stores:

1. **`.gitmodules`** — URL and path of the submodule
2. **Gitlink** — A pointer to the exact commit the submodule should be at

```ini
# .gitmodules
[submodule "content"]
    path = content
    url = https://github.com/USER/reasonance-content.git
```

The gitlink is stored in Git's tree (not a file). View it with:

```bash
git ls-tree HEAD content
# 160000 commit a1b2c3d4e5f6...    content
```

### Setup

```bash
# 1. Create new repo for content (on GitHub)

# 2. Extract content with history (optional)
git clone https://github.com/USER/reasonance reasonance-content-extract
cd reasonance-content-extract
pip install git-filter-repo
git filter-repo --subdirectory-filter content/
git remote add origin https://github.com/USER/reasonance-content.git
git push -u origin main

# 3. Remove content from main repo
cd /path/to/reasonance
git rm -r content/
git commit -m "Remove content/ in preparation for submodule"

# 4. Add as submodule
git submodule add https://github.com/USER/reasonance-content.git content
git commit -m "Add content as submodule"
git push
```

### Workflow: Changing Content

```bash
# 1. Enter submodule and checkout branch
cd content/
git checkout main           # Required: avoid detached HEAD

# 2. Make changes and push to content repo
git add .
git commit -m "New essay"
git push

# 3. Update parent repo's gitlink
cd ..
git add content             # Stages new commit reference
git commit -m "Update content submodule"
git push                    # Triggers Vercel deploy
```

### The Detached HEAD Problem

When you run `git submodule update` (or `git pull` in the parent repo updates the submodule), Git checks out the exact commit recorded in the gitlink—**not a branch**. This is called "detached HEAD" state.

```bash
cd content/
git status
# HEAD detached at a1b2c3d
```

**Why this is problematic:**

1. Commits made in detached HEAD aren't on any branch
2. After another `git submodule update`, those commits become orphaned
3. Orphaned commits are eventually garbage collected and lost

**You must manually checkout a branch before making changes:**

```bash
cd content/
git checkout main    # Now safe to commit
```

This must be done every time the parent repo updates the submodule reference.

### Pros

- Reproducibility: checkout any parent commit and get exact content state
- Standard Git feature with broad tooling support
- CI builds are deterministic

### Cons

- Complex workflow (two repos, two pushes per content change)
- Detached HEAD requires manual intervention after pulls
- Contributors must understand submodule mechanics
- Easy to forget steps and lose work

---

## Option 2: Git Submodules (Ignoring Gitlink)

### How It Works

Register content as a submodule but never bother keeping the gitlink in sync. Always work on a branch in the submodule and pull latest.

### Workflow

```bash
# In content submodule, always stay on main
cd content/
git checkout main
git pull

# Make changes
git add .
git commit -m "New essay"
git push

# Ignore the parent's gitlink—don't update it
```

### Problems

1. **Git status noise** — Parent repo constantly shows:
   ```
   modified:   content (new commits)
   ```

2. **Accidental gitlink commits** — If you run `git add .` in the parent, you'll commit a gitlink update, creating noise.

3. **Vercel still checks out gitlink** — With submodules enabled, Vercel checks out the recorded commit, not latest. You need a custom build command anyway.

4. **Conceptual confusion** — A submodule relationship exists that you're intentionally ignoring.

### Pros

- Avoids detached HEAD if you never run `git submodule update`
- Content deploys can be independent (with custom Vercel setup)

### Cons

- All the machinery of submodules with few of the benefits
- Constant git status noise
- Still need custom Vercel configuration
- Fighting against how submodules are designed to work

---

## Option 3: Separate Repos Without Submodules

### How It Works

Two completely independent repositories. The content repo is cloned into `content/` at build time. Locally, `content/` is gitignored in the main repo.

### Setup

```bash
# 1. Create content repo and push existing content
mkdir reasonance-content && cd reasonance-content
git init
cp -r /path/to/reasonance/content/* .
git add . && git commit -m "Initial content"
git remote add origin https://github.com/USER/reasonance-content.git
git push -u origin main

# 2. In main repo, remove content and gitignore it
cd /path/to/reasonance
rm -rf content/
echo "content/" >> .gitignore
git add .
git commit -m "Remove content, will be cloned at build time"
git push

# 3. Locally, clone content for development
git clone https://github.com/USER/reasonance-content.git content
```

### Workflow: Changing Content

```bash
cd content/
# Make changes...
git add .
git commit -m "New essay"
git push                    # Triggers deploy via webhook (see Vercel section)
```

Single repo, single push. No detached HEAD. No gitlink management.

### Workflow: Changing Code

```bash
# In main repo (not in content/)
git add .
git commit -m "Update layout"
git push                    # Vercel deploys automatically
```

### Pros

- Cleanest mental model: two independent repos
- No submodule mechanics to fight against
- No detached HEAD issues
- No git status noise
- Simple local workflow

### Cons

- Requires Vercel build command customization
- Requires deploy hook for content-triggered deploys
- `content/` must be cloned manually after cloning main repo
- No built-in way to pin content to a specific version

---

## Vercel Deployment

### With Submodules (Options 1 & 2)

Enable submodules in `vercel.json`:

```json
{
  "git": {
    "submodules": true
  }
}
```

Or in Project Settings → Git → "Include submodules in Git clone".

**For Option 2 (ignoring gitlink)**, you also need a custom build command to checkout latest:

```json
{
  "git": {
    "submodules": true
  },
  "buildCommand": "cd content && git checkout main && git pull && cd .. && pnpm quartz build"
}
```

### Without Submodules (Option 3)

Clone content repo in the build command:

```json
{
  "buildCommand": "git clone https://github.com/USER/reasonance-content.git content && pnpm quartz build"
}
```

For private repos, use a GitHub personal access token:

```json
{
  "buildCommand": "git clone https://${GITHUB_TOKEN}@github.com/USER/reasonance-content.git content && pnpm quartz build"
}
```

Add `GITHUB_TOKEN` as an environment variable in Vercel project settings.

### Triggering Deploys on Content Changes

By default, Vercel only watches the main repo. Content pushes won't trigger deploys.

**Solution: Deploy Hooks**

1. Create a deploy hook in Vercel:
   - Project Settings → Git → Deploy Hooks
   - Create hook for `main` branch
   - Copy the webhook URL

2. Add a GitHub Action to the content repo:

```yaml
# .github/workflows/trigger-deploy.yml
name: Trigger Vercel Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deploy Hook
        run: curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

3. Add the webhook URL as a secret in the content repo:
   - Settings → Secrets and variables → Actions
   - New secret: `VERCEL_DEPLOY_HOOK` = your webhook URL

---

## Obsidian Git Plugin Compatibility

The Obsidian Git plugin (v1.10.0+) supports submodules with limitations.

### What Works

- Commit-and-sync includes submodule changes
- Pull updates submodules recursively
- Push works if submodule is properly configured

### Requirements

For submodule support to function:

1. **Branch must be checked out** — Not detached HEAD
2. **Tracking branch must be set** — Local branch must track remote
3. **Feature must be enabled** — Settings → "Update submodules"

### Setup for Submodule

```bash
cd content/
git checkout main
git branch --set-upstream-to=origin/main main
```

### The Catch

When Obsidian Git pulls and updates submodules, the submodule returns to detached HEAD. The plugin does **not** automatically checkout a branch afterward.

You must manually run `git checkout main` in the submodule after pulls that update the submodule reference.

### With Option 3 (No Submodule)

Obsidian Git works normally in the content repo. Open your Obsidian vault from the `content/` directory, and the plugin manages it as a standalone repo.

The main Quartz repo is separate and doesn't need Obsidian Git integration.

---

## Local Development: Quartz Content Directory Options

Quartz provides built-in flexibility for where content is located. This is especially useful with Option 3, where you may want to keep content in a completely separate directory.

### Built-in Symlink Support

Quartz officially supports symlinks for the content directory. During project setup, the CLI offers three strategies:

```bash
pnpm quartz create
# Choose how to initialize the content:
# 1. Empty Quartz
# 2. Copy an existing folder
# 3. Symlink an existing folder
```

Or use command-line flags directly:

```bash
# Create a symlink to existing content
pnpm quartz create --strategy symlink --source /path/to/your/content
```

You can also create the symlink manually:

```bash
# Remove existing content folder first
rm -rf content/

# Create symlink
ln -s /home/user/obsidian-vault/my-notes content
```

### The `--directory` Flag

Quartz accepts a `-d` / `--directory` flag to specify the content location at build time:

```bash
# Build using content from another location
pnpm quartz build -d /path/to/content

# Serve locally with content from another location
pnpm quartz build --serve -d /path/to/content
```

This means you don't need `content/` inside the project at all—just pass the path when building.

### Recommended Local Setup for Option 3

With separate repos and no submodule, you have flexibility in how to organize locally:

**Approach A: Symlink (recommended)**

```
/home/user/
├── obsidian-vault/
│   └── reasonance-content/     # Content repo, opened as Obsidian vault
└── dev/
    └── reasonance/             # Quartz code repo
        └── content -> /home/user/obsidian-vault/reasonance-content (symlink)
```

Setup:
```bash
cd /path/to/reasonance
rm -rf content/
ln -s /home/user/obsidian-vault/reasonance-content content
echo "content" >> .gitignore   # Gitignore the symlink itself
```

Benefits:
- Default commands work (`pnpm quartz build --serve`)
- Content lives wherever you want
- Obsidian manages content as a normal vault

**Approach B: No local content, use `--directory` flag**

```
/home/user/
├── obsidian-vault/
│   └── reasonance-content/     # Content repo
└── dev/
    └── reasonance/             # Quartz code repo (no content/ at all)
```

Build command:
```bash
pnpm quartz build --serve -d /home/user/obsidian-vault/reasonance-content
```

Benefits:
- Complete separation—no symlink to manage
- Explicit about where content comes from

Drawback:
- Must remember the `-d` flag every time

**Approach C: Clone content into project (simplest)**

```bash
cd /path/to/reasonance
git clone https://github.com/USER/reasonance-content.git content
echo "content/" >> .gitignore
```

Content is inside the project but gitignored. Simple, but content isn't at your preferred Obsidian vault location.

### Vercel Compatibility

None of these local approaches affect Vercel deployment. Vercel always clones fresh and uses the build command you configure (see [Vercel Deployment](#vercel-deployment)). Your local symlink or directory structure is not pushed to the repo.

---

## Recommendation

### For Solo Developers / Personal Sites

**Option 3 (Separate Repos, No Submodule)** is recommended.

Reasons:
- Simplest mental model
- No detached HEAD management
- Clean local workflow
- Obsidian Git works without caveats
- Same Vercel setup complexity as other options

The main trade-off—no version pinning between code and content—is rarely needed for personal sites.

### For Teams / Complex Projects

**Option 1 (Standard Submodules)** may be worth the complexity if:

- Multiple contributors need consistent code+content state
- You need to bisect bugs across both repos
- Reproducible builds are critical
- You have CI/CD expertise to manage the workflow

### Summary Table

| Factor | Option 1 (Submodule) | Option 2 (Ignore Gitlink) | Option 3 (No Submodule) |
|--------|----------------------|---------------------------|-------------------------|
| Local workflow | Complex | Messy | Simple |
| Detached HEAD issues | Yes | Sometimes | No |
| Git status noise | No | Yes | No |
| Vercel config | Simple | Custom | Custom |
| Deploy hook needed | If ignoring gitlink | Yes | Yes |
| Obsidian Git | Requires manual checkout | Requires manual checkout | Works normally |
| Version pinning | Yes | No | No |
| **Best for** | Teams | Not recommended | Solo / personal |
