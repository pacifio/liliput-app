# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
bun install                 # Install dependencies
bun run dev                 # Start dev server at http://localhost:3000
bun run build               # Production build
bun run typecheck           # Type checking (tsc --noEmit)
bun run format              # Format code with prettier
bun run lint                # Lint (note: fails due to eslint v10 ↔ react plugin conflict; typecheck & build pass)
```

**Demo entry points:**
- **Customer shop:** `/shop` (switch between Website and Mobile App view)
- **Console (any credentials):** `/login` → select a branch
- **Key walkthroughs:** See README.md sections on "Two apps, one dataset" and "A five-minute walkthrough"

## Architecture Overview

### Two Apps, One Codebase

This is a **demo for a facilities management platform** comprising:

1. **Operations console** (61 screens under `/app/(app)/*`) — ticketing, memberships, POS, inventory, staff, payments, multi-branch reporting
2. **Customer shop** (`/app/(shop)/*`) — web storefront and mobile app, single code serving both via container-driven responsive layout
3. **Auth flow** (`/app/(auth)/*`) — login, signup, OTP, branch selection

Both apps read from the same deterministic dataset, and shop purchases feed back into console records (bookings, sales, payments, customers, audit logs) **without backend.**

### Data Generation: Deterministic & Cached

The dataset is a **pure function of the branch slug**. Every time the same branch is visited, it produces identical data:

- `lib/data.tsx:datasetFor()` caches datasets by branch slug forever
- `lib/mock/generate.ts:generateDataset()` threads a seeded PRNG through all builders in call order
- All timestamps anchor to the demo clock (a fixed UTC day at a fixed time) rather than wall time, so data always reads as "today"
- Switching branches in the sidebar re-seeds every collection (zones, wristbands, customers, inventory, sales, bookings, staff, charts, etc.)

### Live Orders Overlay

Shop purchases live separately in `lib/live.ts` and are overlaid on the generated dataset in `lib/data.tsx:withLiveOrders()`. This keeps the shop logic isolated while making orders instantly visible across all 61 console screens:

- Order payload includes: bookings, sales, memberships, payments, customer profile, audit trail
- Orders prepend to collections so they read as the most recent activity
- "Reset demo data" clears the shop's orders and returns to the generated baseline
- The overlay is withheld until after client hydration, so server render and first client render both see the bare dataset and agree

### Branch Scope

Everything is **branch-scoped**. A branch is:
- The UI state (global via Zustand in `lib/store.ts`)
- The data root (driving every generator call)
- The filter at the console, shop, and top bar

30 branches across Dhaka — 27 live, 2 in soft launch, 1 in fit-out — with distinct profiles (flagship, standard, compact), staff, zones, sales, footfall, capacity metrics. Branch size drives data volume.

### State Management

**Zustand stores** in `lib/store.ts`:
- `useUi` — branch ID, sidebar collapse, command palette, UI scale (90%–140%), report range, shop view (web vs. phone), offline mode, sync queue
- `useLive` (in `lib/live.ts`) — shop orders, persisted to localStorage

UI scale is sent as `--ui-scale` CSS custom property on the root, so every dimension (text, spacing, row heights, icons) scales together. Consumer vs. operator scale is baked into token definitions, not runtime switches.

## Code Organization

```
app/
  (app)/        61 operator console screens, grouped by module
  (auth)/       sign in, signup, reset, OTP, branch selection
  (shop)/       customer website and app
  page.tsx      landing page

components/
  motion/       The signature motion primitives:
                - KPI strip (gauges, cards, notifications)
                - comb charts (footfall forecast, revenue profile)
                - data table (with TanStack Table, sortable/filterable)
                - scan console (QR/NFC entry, dwell timer, bill preview)
                - capacity meter (per-zone headcount)
                - resizable panels
  charts/       Recharts wrappers:
                - footfall forecast band
                - split-bar revenue mix
                - Dhaka branch map with bubbles sized by footfall
  shop/         Consumer-scale shell:
                - phone frame (responsive container)
                - product grid, cart, checkout flows
                - QR display block
                - Same tokens as console, larger scale values
  shell/        Operator-scale shell:
                - sidebar with module navigation
                - top bar (branch/language/scale/offline/date-range controls)
                - command palette (⌘K, indexes all routes in both languages)
                - branch switcher
  ui/           shadcn/ui on Base UI (buttons, inputs, popovers, etc.)

lib/
  mock/
    generate.ts    Deterministic builders for all domain entities
    pools.ts       Name pools (Bangla and English), product names, templates
    rng.ts         Seeded PRNG with call-order threading
  i18n/
    en.ts          English dictionary (804 keys)
    bn.ts          Bengali dictionary, typed against en.ts shape
    provider.tsx   Locale context and Intl formatter bindings
  branches.ts      30-branch registry with metadata (name, manager, map pos, capacity, hue)
  types.ts         Domain model: Branch, Zone, Wristband, Membership, Payment, etc.
  data.tsx         DataProvider, useDataset, dataset caching, live overlay
  live.ts          Shop order state (Zustand), order-to-records converters
  store.ts         UI state: branch, scale, sidebar, report range, offline mode
  derive.ts        Shared selectors (e.g., filter by branch, sort by revenue)
  nav.ts           Sidebar navigation structure
  labels.ts        Domain name lookups (e.g., zone name from ID)
  hue.ts           Tag hue color tokens (blue, teal, green, etc.)
  utils.ts         Tailwind merge, clsx
  report-range.ts  Date range picker logic
  demo-time.ts     The demo clock (fixed UTC day at hour 7 of 12-hour trading day)
```

## Key Patterns

### Bilingual Data

Every user-visible string is a `Bilingual = { en: string; bn: string }` object. Render as `value[locale]`, where locale is from the i18n context.

Machine identifiers (NFC UIDs, booking references, staff IDs) stay in Latin digits on purpose — localizing them breaks their real-world meaning.

### Tag Hues as Data

Categorical fields carry a `TagHue` (blue, teal, green, purple, magenta, amber, rose, slate). Color is data, not CSS — a zone's hue is set on generation, not styled in a component. This lets the demo stay coherent when the branch changes.

### The Demo Clock

All timestamps run on a fixed demo clock, not the wall clock:
- The demo moment is **seven hours into a 12-hour trading day** (morning sessions closed and billed, floor busy, evening ahead)
- Anchored to the current UTC day, so it always reads as "today"
- A wristband bought at 10:00 demo time never looks "overdue" just because the test ran slow

See `lib/demo-time.ts`.

### Console Screens Are Route Groups

Each module (`/gate/*`, `/memberships/*`, `/pos`, etc.) is a Next.js App Router directory. Shared layouts live in `layout.tsx` files. Screen-specific state lives in Zustand stores or component state, not in the URL.

### TanStack Table for Data Tables

Console data tables use TanStack Table v8 for sorting, filtering, pagination. The table component wraps it in a motion-driven reveal and re-render suppressors to prevent animation thrashing.

### Recharts for Charts

Footfall forecast, revenue split, zone capacity and branch network KPIs all use Recharts. Custom SVG fills the Dhaka map with branch bubbles.

## Localization

**Full `en-US` and `bn-BD` support** across 804 keys in each language:

- **Default:** Bangla (light mode)
- **Switch:** Sidebar footer, ⌘K palette, `/settings/localization`
- **Numbers:** Bengali numerals with lakh/crore grouping (১২,३४,५६७)
- **Dates & currency:** Localized (নভেম্বর ১৫, ২০২৬ · ৳12,345)
- **Font:** Noto Sans Bengali loads for the script
- **Mock data:** Native — names, zones, products, templates are written in Bangla, not transliterated

`bn.ts` is typed against `en.ts`'s shape, so a missing translation is a compile error.

## Offline Mode

The top bar has a **connectivity toggle**. When off:
- Gate and POS screens keep working against local state
- Completed transactions queue in `syncQueue` (visible as a counter)
- Toggling back drains the queue
- See `/admin/health` for queue status

## Interface Scale

The **interface scales from 90% to 140%** via a slider in the top bar or `/settings/appearance`. Every size is expressed in `rem`, so raising the scale grows text, spacing, row heights, controls and icons together. The scale is persisted in Zustand and sent as `--ui-scale` CSS custom property.

## High-Level Flows to Know

### Shop → Console (Booking)

1. Customer buys play time on `/shop`
2. `lib/live.ts` records the order
3. `lib/data.tsx` overlays it into the dataset
4. `/gate/scan` instantly shows the booking reference in search
5. Scanning issues a wristband; closing it bills the customer
6. Booking, payment, customer, and audit entries flow to their respective console screens

### POS Sales

1. `/pos` accepts a cart of items (some may have auto-applied member discount)
2. If offline, the sale queues in `syncQueue`
3. If online, it's committed to the dataset and appears in outlet revenue, inventory and finance screens

### Multi-Branch Switching

1. Click a row in `/branches` or use the branch switcher in the sidebar
2. `useUi().setBranchId()` updates global state
3. `datasetFor()` returns the cached dataset for that branch (or generates it if first time)
4. All useDataset() calls re-render with the new branch's data

## Testing & Debugging Tips

- **⌘K:** Command palette — search routes in both languages, switch branch, switch language
- **⌘B:** Collapse sidebar
- **⌘⌥+/⌘⌥−:** Grow/shrink interface; ⌘⌥0 to reset
- **D key:** Toggle dark mode (not OS preference — the app opens in light by default)
- **Offline toggle:** Top bar; watch `/pos` and `/gate/scan` queue transactions
- **Reset demo data:** `/shop/orders` button clears shop orders and returns to generated baseline
- **Check React devtools:** `useDataset()` context, Zustand stores (branch, UI scale, locale), component tree

## ESLint vs. Next.js v16

`bun run lint` fails due to a dependency conflict: ESLint 10 is incompatible with `eslint-plugin-react` that `eslint-config-next@16.3.4` depends on. This is a tooling issue, not application code — `typecheck` and `build` both pass. Monitor the eslint-config-next release notes for a fix.

## Dependencies

**Key runtime packages:**
- **Next.js 16** (App Router, Turbopack) with React 19
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** (on Base UI) for components
- **Motion** for animations
- **Zustand** for state (UI config, live orders)
- **TanStack Table** for sortable/filterable tables
- **Recharts** for charts
- **dnd-kit** for drag-drop (inventory transfers, role matrix)
- **@number-flow/react** for animated number transitions
- **cmdk** for command palette (⌘K)
- **date-fns** for date math
- **react-day-picker** for date pickers
- **react-resizable-panels** for collapsible panel layout
- **next-themes** for light/dark mode
- **sonner** for toast notifications
- **usehooks-ts** for common hooks

**Dev:**
- **Prettier** with tailwindcss plugin
- **TypeScript** (strict mode)
- **ESLint** (see note above)

## FAQ

**Q: How do I add a new screen?**  
A: Create a route under `app/(app)/module-name/` with a `page.tsx`. Add the route to `lib/nav.ts` so it appears in the sidebar. Use `useDataset()` to read, `useUi()` to access state. Wrap mutations in a Zustand setter.

**Q: How do I add a new product or staff member to the mock data?**  
A: Edit `lib/mock/pools.ts` (name/product pools) or `lib/mock/generate.ts` (builders). Changes propagate to all branches on the next generate call. The PRNG threading guarantees the same branch always produces the same data.

**Q: The demo data looks wrong for branch X.**  
A: Check if the branch's `BranchKind` (flagship/standard/compact) drives the volume you expect. Flagship branches get busier datasets. Also verify the demo clock is the issue, not the generation logic — see `lib/demo-time.ts`.

**Q: I want to style a component differently for the shop vs. console.**  
A: The shop sends `shopView: "web" | "phone"` via Zustand; console screens don't check it. For layout, use container-driven responsive design (the shop frame sets the container width). For token scale, consumer tokens are larger than operator tokens — both come from the same Tailwind config, so scaling `rem` affects both correctly.

**Q: How do I test a new checkout flow?**  
A: Use the dev server and the shop. Buy something with different payment methods. Check `/shop/orders`, then type the booking reference into `/gate/scan` to verify the console sees it.
