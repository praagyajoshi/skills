# Checkout

Turns a cart into an order using the test payment provider. Ends on the confirmation page with an order number.

## Sub-features

- Checkout from the cart drawer
- Checkout from the `/cart` page
- Card declined path

## How to get to it (user POV)

1. Sign in (see [sign-in.md](sign-in.md)), add any product with **Add to cart**.
2. Open the cart drawer from the header cart icon, click **Checkout**, or go to `/cart` and click **Checkout**.
3. Fill shipping, pay with the test card, click **Place order**.

## Driving it with Playwright

```sh
scripts/drive.mjs checkout --entry drawer --out "$RUN_DIR"
scripts/drive.mjs checkout --entry cart-page --out "$RUN_DIR"
```

Both entry points are part of the proof. Driving only one leaves the other unverified.

Proof:

- screenshots of cart, payment step, and confirmation (`$RUN_DIR/checkout-*.png`)
- confirmation text matches `Order #\d+`, number saved to `$RUN_DIR/order-id.txt`
- side effect: `scripts/db.sh "select status from orders where id=$(cat $RUN_DIR/order-id.txt)"` prints `paid`

## Gotchas

- Payments go to the provider's sandbox via `PAYMENTS_MODE=test`. That's a real production boundary, so no mock is needed. The sandbox still makes network calls, so offline runs fail at the payment step.
- Declined path needs card `4000 0000 0000 0002`. Any other test card succeeds.
