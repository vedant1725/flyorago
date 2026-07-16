# PowerShell script to push ONLY the flyora-frontend project to GitHub
# Using the provided Personal Access Token (PAT)

$Token = "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"
$Username = "vedant1725"
$RepoName = "flyora-frontend" # Change this if your frontend repo name is different

# Ensure we are in the correct directory for frontend only
$ProjectDir = "e:\flyorago\flyora-frontend"
Set-Location $ProjectDir

Write-Host ">>> Starting Git upload process for FRONTEND ONLY: $ProjectDir..." -ForegroundColor Cyan

# 1. Clean up the previous root Git repository to start fresh
$rootGit = Join-Path $ProjectDir ".git"
if (Test-Path $rootGit) {
    Write-Host "Removing old .git directory to start fresh..." -ForegroundColor Yellow
    Get-Item $rootGit -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# 2. Initialize Git in the frontend directory
Write-Host "Initializing new Git repository in frontend root..." -ForegroundColor Green
git init

# 3. Add all files
Write-Host "Staging all frontend files..." -ForegroundColor Green
git add .

# 4. Commit changes
Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "Initial commit of flyora frontend redesign"

# 5. Set branch name to main
Write-Host "Setting branch to main..." -ForegroundColor Green
git branch -M main

# 6. Configure remote with token
$RemoteUrlWithToken = "https://$($Token)@github.com/$Username/$RepoName.git"
$SafeRemoteUrl = "https://github.com/$Username/$RepoName.git"

# Check if origin already exists
$remoteExists = git remote | Select-String "^origin$"
if ($remoteExists) {
    Write-Host "Updating existing remote origin..." -ForegroundColor Yellow
    git remote set-url origin $RemoteUrlWithToken
} else {
    Write-Host "Adding new remote origin..." -ForegroundColor Green
    git remote add origin $RemoteUrlWithToken
}

# 7. Push to GitHub
Write-Host "Pushing frontend files to GitHub repository '$RepoName'..." -ForegroundColor Cyan
git push -u origin main -f

# 8. Clean up remote URL to remove token from config
Write-Host "Securing remote URL..." -ForegroundColor Yellow
git remote set-url origin $SafeRemoteUrl

Write-Host "`n>>> Done! The FRONTEND project has been successfully pushed to GitHub." -ForegroundColor Green
Write-Host "Verify your repository at: $SafeRemoteUrl" -ForegroundColor Cyan
