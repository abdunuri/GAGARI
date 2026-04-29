# Changelog

All notable changes to GaGari are documented here.

## [1.1.3] - 2026-04-29

### Fixed
- Fixed bulk batches on the orders page so grouped totals include every order in the batch, not only the first paginated slice.

## [1.1.1] - 2026-04-29

### Added
- Added owner-managed Telegram notification settings per bakery.

### Changed
- Restricted system admins to the system admin area instead of bakery dashboard pages.
- Changed order Telegram notifications to use bakery settings instead of environment variables.

## [1.1.0] - 2026-04-28

### Added
- Added app-wide route loading UI so page structure appears immediately while data loads.
- Added Next.js client route cache timing to keep dynamic page navigations warm.
- Added server-side data caching for bakery, customer, product, order, dashboard, and admin reads.
- Added cache invalidation after customer, product, order, and bakery mutations.

### Improved
- Reduced repeated session lookups during server renders.
- Improved dashboard navigation by using Next.js client-side links for internal actions.
- Normalized cached order/dashboard data for safer reuse across requests.

### Verified
- TypeScript production build passes.
- ESLint passes.
- Existing Vitest suite passes.

## [1.0.0] - 2026-04-27

### Added
- First production-ready order collection release.
- Bakery-scoped customer, product, and order management.
- Single-order and bulk-order collection workflows.
- Order status tracking for pending, paid, and cancelled orders.
- Role-based access for system admin, admin, owner, staff, and viewer users.
- System admin bakery and owner setup flow.
- English and Amharic interface copy.
- Telegram order notification support when configured.

### Verified
- TypeScript compilation passes.
- ESLint passes.
- Existing Vitest suite passes.

### Known Scope
- Sales recording is planned for version 2.
- Production records are planned for version 2.5.
- Inventory records are planned for version 3.
- Owner dashboard reporting and analysis are planned for the final completion phase.
