# Release Checklist

Use this checklist before merging or pushing to the production branch.

## Version

- Confirm `package.json` and `package-lock.json` have the intended version.
- Add a matching entry to `CHANGELOG.md`.
- Create a git tag after the production commit, for example `v1.0.0`.

## Code Health

- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Run `npm test`.
- Run `npm run build`.

## Database

- Confirm `SUPABASE_DATABASE_URL` or `DATABASE_URL` is configured.
- Run `npm run db:status:supabase` against the production database.
- Run `npm run db:migrate:supabase` only after confirming the target database and branch.
- Confirm Prisma Client generation has completed after install.

## Environment

- Set `BETTER_AUTH_URL` to the production origin.
- Set the required Better Auth secret values for production.
- Set `NODE_ENV=production`.
- Set `PRISMA_POOL_MAX` if the deployment/database pool needs more than the default.
- Configure `TELEGRAM_BOT_TOKEN` and `TG_CHAT_IDS` only if Telegram notifications should be active.

## Smoke Test

- Sign in as a system admin.
- Create or verify a bakery owner account.
- Sign in as an owner/admin/staff user.
- Create a customer.
- Create a product.
- Create a single order.
- Create a bulk order.
- Update an order status to paid.
- Confirm users cannot see or modify data from another bakery.

## Production Branch

- Review `git status --short`.
- Commit release changes.
- Merge or push to the production branch.
- Tag the release after the production commit.
