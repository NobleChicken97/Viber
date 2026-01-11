# Viber Pre-Deployment Validation Script
# Run this before deploying to production

Write-Host ""
Write-Host "Viber Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$checks = @()
$warnings = @()

# Check 1: TypeScript Compilation
Write-Host "Checking TypeScript..." -NoNewline
$tscOutput = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " OK" -ForegroundColor Green
    $checks += "TypeScript"
} else {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host $tscOutput -ForegroundColor Red
}

# Check 2: Environment Variables
Write-Host "Checking environment variables..." -NoNewline
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_YOUTUBE_API_KEY=.+") {
        Write-Host " OK" -ForegroundColor Green
        $checks += "Environment"
    } else {
        Write-Host " WARNING: Missing API key" -ForegroundColor Yellow
        $warnings += "YouTube API key not configured (app will work with limited features)"
    }
} else {
    Write-Host " WARNING: No .env.local file" -ForegroundColor Yellow
    $warnings += "Create .env.local from .env.example"
}

# Check 3: ONNX Model
Write-Host "Checking ML model..." -NoNewline
if (Test-Path "public/mood_detector.onnx") {
    $modelSize = (Get-Item "public/mood_detector.onnx").Length / 1MB
    Write-Host " OK ($([math]::Round($modelSize, 2)) MB)" -ForegroundColor Green
    $checks += "ML Model"
} else {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "   Run: cd ml && python export_web.py" -ForegroundColor Yellow
}

# Check 4: Icons
Write-Host "Checking app icons..." -NoNewline
$requiredIcons = @("icon-192.png", "icon-512.png", "apple-icon.png", "og-image.png", "favicon.ico")
$missingIcons = @()
foreach ($icon in $requiredIcons) {
    if (-not (Test-Path "public/$icon")) {
        $missingIcons += $icon
    }
}
if ($missingIcons.Count -eq 0) {
    Write-Host " OK" -ForegroundColor Green
    $checks += "Icons"
} else {
    Write-Host " WARNING: Missing: $($missingIcons -join ', ')" -ForegroundColor Yellow
    $warnings += "Create app icons (see public/ICONS_README.md)"
}

# Check 5: Package.json scripts
Write-Host "Checking package.json..." -NoNewline
$package = Get-Content "package.json" | ConvertFrom-Json
if ($package.scripts.build -and $package.scripts.start) {
    Write-Host " OK" -ForegroundColor Green
    $checks += "Scripts"
} else {
    Write-Host " FAILED" -ForegroundColor Red
}

# Check 6: Dependencies
Write-Host "Checking node_modules..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " OK" -ForegroundColor Green
    $checks += "Dependencies"
} else {
    Write-Host " FAILED - Run: npm install" -ForegroundColor Red
}

# Check 7: Git status
Write-Host "Checking git status..." -NoNewline
$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -eq 0) {
    if ($gitStatus) {
        Write-Host " WARNING: Uncommitted changes" -ForegroundColor Yellow
        $warnings += "Commit or stash changes before deploying"
    } else {
        Write-Host " OK" -ForegroundColor Green
        $checks += "Git Clean"
    }
} else {
    Write-Host " WARNING: Not a git repository" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Passed: $($checks.Count) checks" -ForegroundColor Green
if ($warnings.Count -gt 0) {
    Write-Host "Warnings: $($warnings.Count)" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   - $warning" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Overall Status: " -NoNewline
if ($checks.Count -ge 5 -and $warnings.Count -le 2) {
    Write-Host "READY FOR DEPLOYMENT" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   1. git push origin main" -ForegroundColor White
    Write-Host "   2. vercel --prod" -ForegroundColor White
    Write-Host "   3. Test on production URL" -ForegroundColor White
    Write-Host ""
} elseif ($checks.Count -ge 3) {
    Write-Host "MOSTLY READY" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fix warnings above before deploying" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "NOT READY" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fix errors above before deploying" -ForegroundColor Red
    Write-Host ""
}
