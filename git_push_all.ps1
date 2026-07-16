# Script to automatically commit and push flyora-backend and flyora-frontend
# Using the provided GitHub Personal Access Token.
# This script commits changes, pushes them to GitHub, and restores the original remotes
# so that your token is not stored in plain text in your git config.

$Token = "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"

# ----------------- 1. Pushing flyora-backend -----------------
Write-Host ">>> Processing flyora-backend..." -ForegroundColor Cyan
if (Test-Path "e:\flyorago\flyora-backend") {
    Push-Location "e:\flyorago\flyora-backend"
    try {
        # Check current status
        $status = git status --porcelain
        if ([string]::IsNullOrEmpty($status)) {
            Write-Host "No changes detected in flyora-backend." -ForegroundColor Yellow
        } else {
            Write-Host "Changes detected in backend, committing and pushing..." -ForegroundColor Green
            $origUrl = (git remote get-url origin).Trim()
            $authedUrl = "https://$($Token)@github.com/akashpateldz/flyora-backend.git"
            
            git remote set-url origin $authedUrl
            git add -A
            git commit -m "Auto-commit backend changes"
            git push origin main
            
            # Restore original URL
            git remote set-url origin $origUrl
            Write-Host "Successfully pushed flyora-backend and restored original remote URL." -ForegroundColor Green
        }
    } catch {
        Write-Error "Failed to process flyora-backend: $_"
    }
    Pop-Location
} else {
    Write-Warning "Directory e:\flyorago\flyora-backend not found."
}

# ----------------- 2. Pushing flyora-frontend -----------------
Write-Host "`n>>> Processing flyora-frontend..." -ForegroundColor Cyan
if (Test-Path "e:\flyorago\flyora-frontend") {
    Push-Location "e:\flyorago\flyora-frontend"
    try {
        # Check current status
        $status = git status --porcelain
        if ([string]::IsNullOrEmpty($status)) {
            Write-Host "No changes detected in flyora-frontend." -ForegroundColor Yellow
        } else {
            Write-Host "Changes detected in frontend, committing and pushing..." -ForegroundColor Green
            $origUrl = (git remote get-url origin).Trim()
            $authedUrl = "https://$($Token)@github.com/akashpateldz/flyora-frontend.git"
            
            git remote set-url origin $authedUrl
            git add -A
            git commit -m "Auto-commit frontend changes"
            git push origin main
            
            # Restore original URL
            git remote set-url origin $origUrl
            Write-Host "Successfully pushed flyora-frontend and restored original remote URL." -ForegroundColor Green
        }
    } catch {
        Write-Error "Failed to process flyora-frontend: $_"
    }
    Pop-Location
} else {
    Write-Warning "Directory e:\flyorago\flyora-frontend not found."
}

Write-Host "`nDone!" -ForegroundColor Green
