$projectRef = "lurcmwqvgjfsfzsmvkne"
$token = "sbp_977200b8183996687048ac0ec26ff97249ff7834"
$payloadPath = "payload_minimal.json"

if (Test-Path $payloadPath) {
    $payload = Get-Content -Raw $payloadPath
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type"  = "application/json"
    }
    $uri = "https://api.supabase.com/v1/projects/$projectRef/functions/analyze-food"
    
    try {
        Write-Host "Deploying to $uri ..."
        $response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $payload
        Write-Host "Deployment Successful!"
        $response | ConvertTo-Json
    } catch {
        Write-Host "Deployment Failed!"
        Write-Host $_.Exception.Message
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails
        }
    }
} else {
    Write-Host "Error: payload_minimal.json not found."
}
