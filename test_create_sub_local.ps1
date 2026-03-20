try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/checkout/paypal/create-subscription" `
        -Method POST `
        -Headers @{
        "Content-Type" = "application/json"
    } `
        -Body '{"plan_id": "P-5T3678661N225224LNGY4T4I"}'

    Write-Host "Success Response:"
    $response | ConvertTo-Json
}
catch {
    Write-Host "Error Response:"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}
