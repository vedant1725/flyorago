# PowerShell script to push the entire flyorago project to GitHub
# Using the provided Personal Access Token (PAT)

$Token = "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"
$Username = "vedant1725"
$RepoName = "flyorago"

# Ensure we are in the correct directory
$ProjectDir = "e:\flyorago"
Set-Location $ProjectDir

Write-Host ">>> Starting Git upload process for $ProjectDir..." -ForegroundColor Cyan

# 1. Clean up the previous root Git repository to start fresh
$rootGit = Join-Path $ProjectDir ".git"
if (Test-Path $rootGit) {
    Write-Host "Removing old root .git directory to start fresh..." -ForegroundColor Yellow
    # Remove system/hidden attributes if any, then remove recursively
    Get-Item $rootGit -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# 2. Back up/rename inner .git folders to avoid submodule issues
# This allows the parent repo to track flyora-backend and flyora-frontend files directly.
$subdirs = @("flyora-backend", "flyora-frontend")
foreach ($dir in $subdirs) {
    $gitPath = Join-Path $ProjectDir "$dir\.git"
    $backupPath = Join-Path $ProjectDir "$dir\.git_backup"
    if (Test-Path $gitPath) {
        Write-Host "Backing up .git in $dir to .git_backup..." -ForegroundColor Yellow
        if (Test-Path $backupPath) {
            Get-Item $backupPath -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        }
        Rename-Item -Path $gitPath -NewName ".git_backup" -Force
    }
}

# 3. Initialize Git in the root directory
Write-Host "Initializing new Git repository in project root..." -ForegroundColor Green
git init

# 4. Add all files
Write-Host "Staging all files..." -ForegroundColor Green
git add .

# 5. Commit changes
Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "Initial commit of flyorago project (backend and frontend)"

# 6. Set branch name to main
Write-Host "Setting branch to main..." -ForegroundColor Green
git branch -M main

# 7. Configure remote with token
$RemoteUrlWithToken = "https://$($Token)@github.com/$Username/$RepoName.git"
$SafeRemoteUrl = "https://github.com/$Username/$RepoName.git"

# Check if origin already exists (shouldn't since we initialized fresh, but good to check)
$remoteExists = git remote | Select-String "^origin$"
if ($remoteExists) {
    Write-Host "Updating existing remote origin..." -ForegroundColor Yellow
    git remote set-url origin $RemoteUrlWithToken
} else {
    Write-Host "Adding new remote origin..." -ForegroundColor Green
    git remote add origin $RemoteUrlWithToken
}

# 8. Push to GitHub
Write-Host "Pushing files to GitHub repository '$RepoName' (this may take a few moments)..." -ForegroundColor Cyan
git push -u origin main -f

# 9. Clean up remote URL to remove token from config
Write-Host "Securing remote URL (removing token from local Git configuration)..." -ForegroundColor Yellow
git remote set-url origin $SafeRemoteUrl

Write-Host "`n>>> Done! The flyorago project has been successfully pushed to GitHub." -ForegroundColor Green
Write-Host "Verify your repository at: $SafeRemoteUrl" -ForegroundColor Cyan
