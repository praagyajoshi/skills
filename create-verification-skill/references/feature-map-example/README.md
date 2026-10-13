# Feature map: verify-shopfront

Example shape only, for a fictional web store. Real maps use the repo's own routes, selectors, and seed data.

Each file covers one user-facing feature: what it is, how a user reaches it, how to drive it, and what end state proves it works. Driver for all journeys: Playwright via `scripts/drive.mjs` (see `../SKILL.md` → Drive).

| Feature | File | Entry points | Proven by |
| --- | --- | --- | --- |
| Sign in | [sign-in.md](sign-in.md) | `/login`, header "Sign in" button | session cookie set, header shows account name |
| Checkout | [checkout.md](checkout.md) | cart drawer "Checkout", `/cart` page | order row in `orders` table, confirmation page |

## Keeping this map honest

- A change that adds, renames, or removes a route, command, or menu updates the matching feature file in the same change.
- A journey that fails because the app changed (not broke) gets fixed, and the reason goes in that feature's Gotchas.
- New user-facing feature: add a file and a row here before calling it verified.
