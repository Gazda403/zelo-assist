const clientId = "AVqflJ5IlzHn2S1Dk248NWirNg6DXobjwFjIze6h-BlgyjowPqdzCln1AEvM-NYtQRU21sCuQtcjf_aJ";
const secret = "EFoeYnyUe4jw0eAmPS8IjJoGQNVSyZtrCoKLXUIG9syT3ETs3JXdyml8m-HhYp7ef5W_SompBDWA9R24";
const baseUrl = "https://api-m.paypal.com";

async function run() {
  // 1. Get Token
  const auth = Buffer.from(clientId + ":" + secret).toString("base64");
  const tokenRes = await fetch(baseUrl + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  if (!tokenRes.ok) {
    console.error("Token error", await tokenRes.text());
    return;
  }
  const token = (await tokenRes.json()).access_token;
  console.log("Token generated.");

  // 2. Create Product
  const productRes = await fetch(baseUrl + "/v1/catalogs/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      Accept: "application/json"
    },
    body: JSON.stringify({
      name: "XeloFlow Automation",
      description: "XeloFlow Email Automation Subscriptions",
      type: "SERVICE",
      category: "SOFTWARE"
    })
  });
  let product = await productRes.json();
  if (product.name !== "XeloFlow Automation") {
      console.log("Product creation response:", product);
  }
  let productId = product.id;

  if (product.name === "AUTHENTICATION_FAILURE" || product.error) {
     console.error("Failed to create product", product);
     return;
  }

  // If it already exists, maybe we can just query the products
  if (!productId) {
     const existingRes = await fetch(baseUrl + "/v1/catalogs/products", {
         headers: {
             Authorization: "Bearer " + token,
         }
     });
     const existing = await existingRes.json();
     if (existing.products && existing.products.length > 0) {
         productId = existing.products[0].id;
     } else {
         console.log("Could not get product ID");
         return;
     }
  }

  console.log("Product ID:", productId);

  // 3. Create Plans
  const plans = [
    { name: "Starter Monthly", price: "13.99", interval: "MONTH" },
    { name: "Starter Annual", price: "134.28", interval: "YEAR" },
    { name: "Pro Monthly", price: "39.00", interval: "MONTH" },
    { name: "Pro Annual", price: "374.40", interval: "YEAR" }
  ];

  for (const p of plans) {
    const planRes = await fetch(baseUrl + "/v1/billing/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        Accept: "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        product_id: productId,
        name: p.name,
        description: p.name + " Plan",
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: { interval_unit: p.interval, interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: { value: p.price, currency_code: "USD" }
            }
          }
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: "0", currency_code: "USD" },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3
        }
      })
    });
    const planData = await planRes.json();
    console.log(p.name + " Plan ID:", planData.id);
  }
}
run();
