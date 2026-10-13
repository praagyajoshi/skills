# Sign in

Email + password sign-in for seeded users. Sets a session cookie and swaps the header "Sign in" button for the account menu.

## Sub-features

- Email/password sign-in
- Wrong-password error
- Redirect back to the page that required auth (`?next=`)

## How to get to it (user POV)

1. Click **Sign in** in the header on any page, or open `/login` directly.
2. Visiting `/account` while signed out redirects to `/login?next=/account`.

## Driving it with Playwright

```sh
scripts/drive.mjs sign-in --user demo@shopfront.test --password demo123 --out "$RUN_DIR"
```

Steps inside the script, using stable handles:

- `page.getByRole('link', { name: 'Sign in' }).click()`
- `page.getByLabel('Email').fill(...)`, `page.getByLabel('Password').fill(...)`
- `page.getByRole('button', { name: 'Sign in' }).click()`

Proof:

- `$RUN_DIR/sign-in-before.png` and `sign-in-after.png`
- header contains `getByRole('button', { name: 'Demo User' })`
- `context.cookies()` includes `sid`, written to `$RUN_DIR/cookies.json`
- server log line `session created user=1` in `$RUN_DIR/server.log`

## Gotchas

- Seed creates `demo@shopfront.test` only after `npm run db:seed`. A fresh data dir without it fails the journey. That's a launch bug, not a reason to skip sign-in.
- The login form throttles after 5 failures per IP. Wrong-password runs must stay under that.
