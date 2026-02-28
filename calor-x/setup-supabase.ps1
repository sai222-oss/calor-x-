# ============================================================
#  Calor X - One-Click Supabase Setup
#  Run: powershell -ExecutionPolicy Bypass -File setup-supabase.ps1
# ============================================================

$PROJECT_REF = "blmcbnmqxjallutzxwdl"
$PROJECT_DIR = "c:\Users\The Godfather\Downloads\calor-x\calor-x"
$cliPath = "$PROJECT_DIR\supabase.exe"

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "  Calor X Supabase Setup    " -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Ask for OpenAI key
$OPENAI_KEY = Read-Host "Paste your OpenAI API key (sk-...)"
if ($OPENAI_KEY -notmatch "^sk-") {
    Write-Host "ERROR: Doesn't look like a valid OpenAI key. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/5] Downloading Supabase CLI..." -ForegroundColor Yellow
if (Test-Path $cliPath) {
    Write-Host "      Already downloaded. Skipping." -ForegroundColor Green
} else {
    $url = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
    Invoke-WebRequest -Uri $url -OutFile $cliPath -UseBasicParsing
    Write-Host "      Downloaded!" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Logging in to Supabase..." -ForegroundColor Yellow
Write-Host "      A browser window will open - log in and return here." -ForegroundColor Gray
& $cliPath login
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Login failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/5] Linking project..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR
& $cliPath link --project-ref $PROJECT_REF
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Link failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/5] Running database migrations..." -ForegroundColor Yellow
& $cliPath db push
Write-Host "      Migrations applied!" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Setting secret and deploying Edge Functions..." -ForegroundColor Yellow
& $cliPath secrets set "OPENAI_API_KEY=$OPENAI_KEY"
Write-Host "      Secret set." -ForegroundColor Green

& $cliPath functions deploy analyze-food --no-verify-jwt
Write-Host "      analyze-food deployed." -ForegroundColor Green

& $cliPath functions deploy coach --no-verify-jwt
Write-Host "      coach deployed." -ForegroundColor Green

Write-Host ""
Write-Host "=============================" -ForegroundColor Green
Write-Host "  ALL DONE! App is ready.   " -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "View functions: https://supabase.com/dashboard/project/$PROJECT_REF/functions" -ForegroundColor Cyan
Write-Host ""
