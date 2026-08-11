# VIRELLO CJ setup

The storefront is wired for CJdropshipping without exposing CJ credentials to the browser.

## Required secret

In GitHub, open **Settings → Secrets and variables → Actions → New repository secret** and create:

- `CJ_API_KEY` — the API key created in the CJ account.

Do not place the API key in JavaScript, HTML, JSON, issues, commits, or chat messages.

## First synchronization

1. Open **Actions**.
2. Select **Sync CJ EU Catalog**.
3. Choose **Run workflow**.
4. Inspect the workflow result.
5. If successful, `data/products.json` will contain only products that passed the configured CJ catalog filters and a second inventory verification step.

The workflow also runs every six hours.

## Current safety behavior

- The public browser never receives the CJ API key or access token.
- The sync requests verified CJ warehouse inventory and then checks inventory again by product ID.
- Default warehouse priority covers DE, PL, CZ, ES, FR, and NL.
- Initial research focuses on pet-hair removal plus home, bathroom, car, and travel organization products.
- Ranking uses CJ inventory, listing count, price band, warehouse location, and category fit. It does not claim real German sales volume.
- Products remain `sellReady: false` until freight cost, payment gateway, legal details, and product-specific compliance are connected and verified.
- Checkout remains disabled until the production payment and order-routing flow is implemented.
