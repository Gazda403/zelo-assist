$clientId = "AclUiHgFapcolsE0Uux4Nv4tKXUyJuH-mOSjNOyPwNt5YWLzqXd8EQtkUU6OACUNU4K6FrgKni24jwdY"
$clientSecret = "EPv1uYcsdazclRonTnP8I7MVu7QtgGhPCYe_UgFIwi2x9QRklh0uwsGO14vsqjmmpQBQ17fyQstiAYnJ"

$pair = "${clientId}:${clientSecret}"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$b64 = [Convert]::ToBase64String($bytes)

try {
    $response = Invoke-RestMethod -Uri "https://api-m.sandbox.paypal.com/v1/oauth2/token" `
        -Method POST `
        -Headers @{
        "Authorization"   = "Basic $b64"
        "Accept"          = "application/json"
        "Accept-Language" = "en_US"
    } `
        -Body "grant_type=client_credentials" `
        -ContentType "application/x-www-form-urlencoded"

    Write-Host "SUCCESS! Access Token:"
    Write-Host $response.access_token
    Write-Host "Expires in (seconds): $($response.expires_in)"
}
catch {
    Write-Host "ERROR: $_"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}
