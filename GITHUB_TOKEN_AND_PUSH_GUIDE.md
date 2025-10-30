# GitHub Token and Push Guide for Odins-Almanac-site

## Overview

This guide helps you set up GitHub authentication and push the fixed workflow file to your repository.

## Fixed Workflow Issues

The azure-webapp.yml workflow has been updated to:

- Use Node.js 22 (already configured)
- Fix the release.zip creation path issue
- Add verification step to ensure the zip file exists

## Steps to Push Changes

### 1. Verify Current Status

```bash
git status
```

### 2. Add the Modified Workflow File

```bash
git add .github/workflows/azure-webapp.yml
```

### 3. Commit the Changes

```bash
git commit -m "Fix release.zip creation and Node 22 upgrade"
```

### 4. Push to GitHub

```bash
git push
```

## GitHub Token Setup (if needed)

If you need to authenticate with GitHub:

### Option 1: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not already installed
winget install GitHub.cli

# Login to GitHub
gh auth login
```

### Option 2: Using Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. When prompted for password during `git push`, use the token instead

### Option 3: Configure Git with Token

```bash
# Set up credential helper
git config --global credential.helper manager-core

# Or set remote URL with token
git remote set-url origin https://YOUR_TOKEN@github.com/Viking-Restaurant-Consultants/Odins-Almanac-site.git
```

## Workflow Details

The fixed workflow now properly:

1. Checks out the code
2. Sets up Node.js 22
3. Installs dependencies in the server directory
4. Creates release.zip from the server directory contents
5. Verifies the zip file was created
6. Logs into Azure using stored secrets
7. Deploys the zip file to Azure Web App

## Troubleshooting

### If zip command is not found on Windows

```bash
# Install 7-zip and use it instead
choco install 7zip
# Or use PowerShell's Compress-Archive
```

### If deployment fails

- Check Azure secrets are properly configured in GitHub repository settings
- Verify the Azure Web App name matches "Odinsalmanac"
- Check Azure Web App is configured for Node.js runtime

## Next Steps

After pushing, monitor the GitHub Actions tab in your repository to see the deployment progress.
