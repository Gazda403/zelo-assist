$token = "A21AALDPzyGvodHoxjSpzomPomvRo97VzieWssE4KuU6xa_dH19eILKgK2KPY7E_nTsJCUUd5-74zPmMXBYuckKGmQQHfcQbg"
$baseUrl = "https://api-m.sandbox.paypal.com"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
    "Accept"        = "application/json"
}

Write-Host "=== Step 1: Creating Product ===" -ForegroundColor Cyan

$productBody = @{
    name        = "Gmail Assistant Subscription"
    description = "AI-powered Gmail assistant with automation and smart inbox management."
    type        = "SERVICE"
    category    = "SOFTWARE"
} | ConvertTo-Json

$product = Invoke-RestMethod -Uri "$baseUrl/v1/catalogs/products" -Method POST -Headers $headers -Body $productBody
$productId = $product.id
Write-Host "Product created: $productId" -ForegroundColor Green

Write-Host ""
Write-Host "=== Step 2: Creating 4 Subscription Plans ===" -ForegroundColor Cyan

# Helper to create a plan
function Create-Plan($name, $description, $amount, $currency, $intervalUnit, $intervalCount) {
    $planBody = @{
        product_id          = $productId
        name                = $name
        description         = $description
        status              = "ACTIVE"
        billing_cycles      = @(
            @{
                frequency      = @{ interval_unit = $intervalUnit; interval_count = $intervalCount }
                tenure_type    = "REGULAR"
                sequence       = 1
                total_cycles   = 0
                pricing_scheme = @{
                    fixed_price = @{ value = $amount; currency_code = $currency }
                }
            }
        )
        payment_preferences = @{
            auto_bill_outstanding     = $true
            setup_fee                 = @{ value = "0"; currency_code = $currency }
            setup_fee_failure_action  = "CONTINUE"
            payment_failure_threshold = 3
        }
    } | ConvertTo-Json -Depth 10

    $plan = Invoke-RestMethod -Uri "$baseUrl/v1/billing/plans" -Method POST -Headers $headers -Body $planBody
    return $plan.id
}

$starterMonthlyId = Create-Plan "Starter Monthly" "Starter plan billed monthly" "4.99" "USD" "MONTH" 1
Write-Host "Starter Monthly: $starterMonthlyId" -ForegroundColor Green

$starterAnnualId = Create-Plan "Starter Annual" "Starter plan billed annually" "49.99" "USD" "YEAR" 1
Write-Host "Starter Annual:  $starterAnnualId" -ForegroundColor Green

$proMonthlyId = Create-Plan "Pro Monthly" "Pro plan billed monthly" "14.99" "USD" "MONTH" 1
Write-Host "Pro Monthly:     $proMonthlyId" -ForegroundColor Green

$proAnnualId = Create-Plan "Pro Annual" "Pro plan billed annually" "149.99" "USD" "YEAR" 1
Write-Host "Pro Annual:      $proAnnualId" -ForegroundColor Green

Write-Host ""
Write-Host "=== Summary: Update these in your codebase ===" -ForegroundColor Yellow
Write-Host "STARTER_MONTHLY_PLAN_ID=$starterMonthlyId"
Write-Host "STARTER_ANNUAL_PLAN_ID=$starterAnnualId"
Write-Host "PRO_MONTHLY_PLAN_ID=$proMonthlyId"
Write-Host "PRO_ANNUAL_PLAN_ID=$proAnnualId"
