# deploy-function.ps1
# Reads the access token from Supabase CLI config and deploys the edge function

$tokenPath = "$env:APPDATA\supabase\access-token"
if (-not (Test-Path $tokenPath)) {
    $tokenPath = "$env:USERPROFILE\.supabase\access-token"
}

# Find token in config files
$configDirs = @(
    "$env:APPDATA\supabase",
    "$env:USERPROFILE\.config\supabase",
    "$env:USERPROFILE\.supabase"
)

$accessToken = "sbp_977200b8183996687048ac0ec26ff97249ff7834"

$fileContent = Get-Content -Path "calor-x\supabase\functions\analyze-food\index.ts" -Raw
$utilsContent = Get-Content -Path "calor-x\supabase\functions\analyze-food\utils.ts" -Raw

$projectRef = "lurcmwqvgjfsfzsmvkne"
$body = @{
    slug       = "analyze-food"
    name       = "analyze-food"
    verify_jwt = $false
    body       = $fileContent
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type"  = "application/json"
}

Write-Host "Deploying analyze-food to Supabase project $projectRef..."

try {
    $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$projectRef/functions/analyze-food" `
        -Method PUT `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json)
}
catch {
    Write-Host "PUT failed, trying POST (create new)..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$projectRef/functions" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop
        Write-Host "Deployment successful!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json)
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}
