# ============================================================
#  Calor X - Deploy to Supabase Project lurcmwqvgjfsfzsmvkne
#  Run: powershell -ExecutionPolicy Bypass -File deploy-to-supabase.ps1
# ============================================================

$PROJECT_REF = "lurcmwqvgjfsfzsmvkne"
$PROJECT_DIR = "c:\Users\The Godfather\Downloads\calor-x\calor-x"
$CLI = "C:\Users\The Godfather\Downloads\supabase-cli\supabase.exe"
$GEMINI_KEY = "AIzaSyDTrSMYpI_-ojzkDlYO7mElX2bgubmgAMI"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Calor X - Full Supabase Deployment      " -ForegroundColor Cyan
Write-Host "   Project: lurcmwqvgjfsfzsmvkne           " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Ask for Personal Access Token ──────────────────────────────────────
Write-Host "[1/5] Supabase Personal Access Token" -ForegroundColor Yellow
Write-Host "      Get it from: https://supabase.com/dashboard/account/tokens" -ForegroundColor Gray
Write-Host "      (click 'Generate new token', name it anything, copy it)" -ForegroundColor Gray
Write-Host ""
$PAT = Read-Host "Paste your Supabase Personal Access Token (sbp_...)"
if ([string]::IsNullOrWhiteSpace($PAT)) {
    Write-Host "ERROR: Token is required. Exiting." -ForegroundColor Red
    exit 1
}

# ── Step 2: Login ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/5] Logging into Supabase CLI..." -ForegroundColor Yellow
& $CLI login --token $PAT
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Login failed." -ForegroundColor Red
    exit 1
}
Write-Host "      Logged in OK." -ForegroundColor Green

# ── Step 3: Link project & Run Migrations ─────────────────────────────────────
Write-Host ""
Write-Host "[3/5] Linking project and running database migrations..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR

& $CLI link --project-ref $PROJECT_REF
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Link failed." -ForegroundColor Red
    exit 1
}

# Ask for DB password (needed for db push)
$DB_PASS = Read-Host "Paste your Supabase DB password (shown in Project Settings > Database)"
& $CLI db push --password $DB_PASS
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: db push had errors. Check output above." -ForegroundColor Yellow
}
else {
    Write-Host "      Migrations applied OK." -ForegroundColor Green
}

# ── Step 4: Set Secrets ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/5] Setting Edge Function secrets..." -ForegroundColor Yellow

& $CLI secrets set "GEMINI_API_KEY=$GEMINI_KEY" --project-ref $PROJECT_REF
Write-Host "      GEMINI_API_KEY set." -ForegroundColor Green

# Optional: OpenAI key
$OPENAI_KEY = Read-Host "Optional: Paste OpenAI API key (sk-...) or press Enter to skip"
if ($OPENAI_KEY -match "^sk-") {
    & $CLI secrets set "OPENAI_API_KEY=$OPENAI_KEY" --project-ref $PROJECT_REF
    Write-Host "      OPENAI_API_KEY set." -ForegroundColor Green
}
else {
    Write-Host "      OpenAI key skipped." -ForegroundColor Gray
}

# ── Step 5: Deploy Edge Functions ─────────────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Deploying Edge Functions..." -ForegroundColor Yellow

& $CLI functions deploy analyze-food --project-ref $PROJECT_REF --no-verify-jwt
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: analyze-food deploy had issues." -ForegroundColor Yellow
}
else {
    Write-Host "      analyze-food deployed OK." -ForegroundColor Green
}

& $CLI functions deploy coach --project-ref $PROJECT_REF --no-verify-jwt
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: coach deploy had issues." -ForegroundColor Yellow
}
else {
    Write-Host "      coach deployed OK." -ForegroundColor Green
}

# ── Done ───────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   ALL DONE!                               " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "View Edge Functions : https://supabase.com/dashboard/project/$PROJECT_REF/functions" -ForegroundColor Cyan
Write-Host "View Tables         : https://supabase.com/dashboard/project/$PROJECT_REF/editor" -ForegroundColor Cyan
Write-Host ""
