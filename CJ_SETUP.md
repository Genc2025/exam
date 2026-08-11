# VIRELLO CJ setup

The storefront is wired for CJdropshipping without exposing CJ credentials to the browser.

## Required secret

In GitHub, open **Settings → Secrets and variables → Actions → New repository secret** and create:

- `CJ_API_KEY` — the API key created in the CJ account.

Do not place the API key in JavaScript, HTML, JSON, issues, commits, or chat messages.

## First synchronization

1. Open **Actions**.
2. Select **Sync CJ Germany Catalog**.
3. Choose **Run workflow**.
4. Inspect the workflow result.
5. If successful, `data/products.json` will contain only products that passed the Germany catalog filter and a second strict variant-level inventory verification.

The workflow also runs every six hours. If `CJ_API_KEY` is not configured, the workflow exits without publishing fake data or failing the storefront.

## Current safety behavior

- The public browser never receives the CJ API key or access token.
- Product discovery uses CJ Product List V2 with `countryCode=DE`, `verifiedWarehouse=1`, minimum stock and price/risk filters.
- Before publication, inventory is queried again by product ID. A product is accepted only when a variant inventory row has `countryCode=DE` and `verifiedWarehouse=1` with sufficient CJ warehouse stock.
- The initial catalog excludes higher-risk categories such as medicines, supplements, cosmetics, food, baby/child products, toys, weapons, nicotine/alcohol and battery/electronic products.
- Initial research focuses on pet-hair removal plus home, bathroom, car and travel organization products.
- Ranking uses CJ inventory, listing count, price band, video availability and category fit. It does not claim real German sales volume.
- Product prices use CJ supplier cost converted from USD to EUR using the ECB daily reference-rate feed unless a repository variable `USD_TO_EUR_RATE` is explicitly set.
- Products remain `sellReady: false` until shipping cost, payment gateway, business/legal details and product-specific compliance are connected and verified.
- Checkout remains disabled until the production payment and order-routing flow is implemented and tested.
