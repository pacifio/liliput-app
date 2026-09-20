# লিলিপুটার দুনিয়া — Operations Console & Customer App

**Liliputer Dunia** — an indoor-playground operating system: ticketing and QR
wristband access, NFC membership, day-care time tracking, multi-outlet POS and
inventory, a customer CRM, a cloud console spanning **30 branches** across
greater Dhaka, and the customer website and mobile app that feed it.

A prototype built by **ReachSavvy Solution Ltd.** against the Liliputer Dunia
System Requirement Specification of 15 September 2026.

```bash
bun install
bun run dev      # http://localhost:3000 → /login (any credentials work)
```

> The interface opens in **Bangla** and in **light** mode. Switch language from
> the sidebar footer, the ⌘K palette, or `/settings/localization`.

It is built to be **demoed**, not deployed. Everything runs client-side against
deterministic generated data — no backend, no database, no API key, no network
call. The demo behaves identically every time it is opened, which means it
never fails in a room full of people.

---

## Contents

- [Two apps, one dataset](#two-apps-one-dataset)
- [A five-minute walkthrough](#a-five-minute-walkthrough)
- [The customer app](#the-customer-app)
- [The operator console](#the-operator-console)
- [SRS coverage](#srs-coverage)
- [Multi-branch](#multi-branch)
- [Offline mode](#offline-mode)
- [Language](#language)
- [Accessibility & density](#accessibility--density)
- [Keyboard](#keyboard)
- [How the data works](#how-the-data-works)
- [What this is not](#what-this-is-not)
- [Stack & layout](#stack--layout)

---

## Two apps, one dataset

**74 routes** — 61 operator screens, 8 customer screens and 5 auth flows, all
navigable, all populated with coherent data.

The two halves are wired together. A visitor buys a play ticket on the customer
app; a second later the booking is in the operator's `/bookings` list, the
payment is in `/payments`, the guardian is a new row in `/customers`, the money
is in the dashboard's revenue mix, and the action is in the audit log. Type the
booking reference into the gate console and it recognises the online purchase
and offers to issue a wristband against it.

You do not seed the console by hand. **You prototype it by using the shop.**

## A five-minute walkthrough

The path that shows the whole system, in order:

1. `/login` → any credentials → pick **Diabari** (or any branch).
2. **`/shop`** — switch the strip at the top to **Mobile app**. Buy play time
   for today and a monthly membership; add a toy from the shop; check out with
   bKash.
3. **`/shop/orders`** — note the QR's booking reference and the NFC card UID.
4. **`/gate/scan`** — type that booking reference. The console recognises the
   online booking and issues a wristband against it, guardian carried over.
   Scan the new band again to close it and see the bill computed.
5. **`/memberships/cards`** — enter the card UID. It verifies, with plan,
   validity and entitlements. Then tap one of the expired or suspended cards
   from the list to see the refusal path.
6. **`/dashboard`** — your purchase is in the revenue mix and the upcoming list.
7. **`/branches`** — all 30 branches at once. Click a row; the whole app
   re-seeds to that branch.
8. Toggle **offline mode** in the top bar, make a POS sale at `/pos`, watch it
   queue, then toggle back and watch it drain.

## The customer app

`/shop` is the mother website and mobile app the SRS asks for. The strip above
it switches between **Website** and **Mobile app** — the same build rendered
full width or inside a phone frame. The shop lays out against its *container*
rather than the viewport, so one set of markup serves both, and a narrow
browser window gets the app layout for free.

### Screens

| Screen | What it does |
| --- | --- |
| `/shop` | Storefront: branch-tinted hero, four category tiles priced from the live catalogue, trust points, popular products |
| `/shop/tickets` | Pick a date from the next 10 days, a session length, and how many children |
| `/shop/membership` | Compare the three plans side by side, with perks and the monthly plan featured |
| `/shop/parties` | Pick a date at least a week out and a start time, then choose a package |
| `/shop/store` | The same catalogue as the in-branch outlets, searchable and filterable by outlet |
| `/shop/cart` | One cart across all four line types, with quantity steppers, VAT and party deposits |
| `/shop/checkout` | Contact details, gateway choice, and a summary that matches the charge |
| `/shop/orders` | Every order from this device, with the QR ticket and NFC card that carry into the console |

### What you can buy

| Play sessions | Included | Price | Overtime |
| --- | --- | --- | --- |
| 1 Hour | 60 min | ৳350 | ৳100 / 15 min |
| 90 Minutes | 90 min | ৳480 | ৳90 / 15 min |
| 2 Hours | 120 min | ৳600 | ৳80 / 15 min |
| Day Pass | 480 min | ৳1,100 | ৳120 / 30 min |

| Membership | Validity | Visits | Price | Outlet discount |
| --- | --- | --- | --- | --- |
| Weekly | 7 days | 5 | ৳1,800 | 5% |
| Monthly | 30 days | 20 | ৳5,600 | 10% |
| Six Month | 180 days | 140 | ৳26,000 | 15% |

| Party package | Guests | Hours | Price |
| --- | --- | --- | --- |
| Mini Party | 10 | 2 | ৳12,000 |
| Classic Party | 20 | 3 | ৳26,000 |
| Grand Party | 40 | 4 | ৳52,000 |

Parties take a **30% deposit**; everything else is paid in full. VAT is charged
on retail goods only, not on play time or membership — and the cart shows it,
so the quoted total is exactly what gets charged.

Payment is by **bKash, Nagad, Rocket, card or SSLCommerz**.

### What carries into the console

- A **play ticket** prints a QR and a booking reference. Type that reference
  into `/gate/scan` and the console resolves the online booking and offers to
  issue a wristband against it, with the guardian carried over. The QR itself
  is decorative — nothing here reads a camera — but the code printed beneath it
  is the real reference the gate accepts.
- A **membership purchase** issues an NFC card UID in the format printed on a
  real card (`04 A2 7F 3B`). Tap it at `/memberships/cards` and it verifies.
- **Outlet purchases** become sales against the right outlet, so they land in
  `/pos` day totals, `/outlets` and `/finance/revenue`.

"Reset demo data" on `/shop/orders` clears everything the shop has added and
returns the console to its generated state.

## The operator console

### Overview

| Screen | What it does |
| --- | --- |
| `/dashboard` | Footfall, revenue, avg dwell, spend per head and member visits; a 90-day forecast band; live zone capacity; the longest-dwelling bands; revenue mix; day-care ratio; alerts; today's upcoming bookings |
| `/activity` | One chronological stream stitched from gate events, outlet sales and privileged actions, filterable by area |

### Entry & tickets

| Screen | What it does |
| --- | --- |
| `/gate` | The live floor: who is in, in which zone, for how long, and what is overdue |
| `/gate/scan` ★ | Issue a band on entry, close it on exit. Scanning a live band freezes the dwell timer and computes the bill — free window, per-block overtime, member discount — then previews a receipt. Also resolves online booking references |
| `/gate/tickets` | The desk: sell entry slabs, attach a membership card for its discount, take payment, print |
| `/gate/wristbands` | Every band issued today, filterable by state, with live dwell timers in the table |
| `/gate/sessions` | Closed and billed sessions, with overtime and discounts broken out |
| `/gate/capacity` | Headcount against the licensed limit per zone, plus the day's hourly arrival profile |

Seven zones — Ball Pit, Trampoline Park, Soft Play, Rope Course, Arcade,
Toddler Zone and Birthday Hall — each with its own age band, capacity and
supervision requirement.

### Membership

| Screen | What it does |
| --- | --- |
| `/memberships` | Every member, their plan, tier, visits used and validity |
| `/memberships/cards` ★ | Tap-to-verify. The card resolves to plan, validity bar, visits remaining and tier entitlements, then accept or decline. The picker deliberately includes **expired, over-limit and suspended** cards so the refusal paths are demonstrable, not just the happy one |
| `/memberships/plans` | The three plans with take-up, revenue and renewal rate |
| `/memberships/vouchers` | Seasonal and member-only codes with issue and redemption counts |

### Day-care

| Screen | What it does |
| --- | --- |
| `/daycare` | Who is in care, with whom, for how long, and the caregiver ratio. Allergies are flagged on the row |
| `/daycare/checkin` | Look a guardian up by phone, set a time limit, assign a caregiver, check each child in |
| `/daycare/billing` | Time-limit calculation and service charges per stay |

### Bookings

| Screen | What it does |
| --- | --- |
| `/bookings` | Every booking from website, app, phone and counter, filterable by state |
| `/bookings/new` | A six-step wizard: customer → children → package → schedule → payment → review |
| `/bookings/calendar` | A month grid with per-day load, and the day's bookings beside it |
| `/bookings/parties` | The party packages, what each includes, and what has been booked |

### Outlets & POS

| Screen | What it does |
| --- | --- |
| `/pos` ★ | Four outlets, category filters, a cart with member discount auto-applied from a card UID, split payment across five tenders, a receipt preview, and live printer, drawer and scanner chips. Honours offline mode by queueing the sale |
| `/outlets` | Per-outlet revenue, orders, items and stock health |
| `/outlets/menu` | The full catalogue with cost, price, margin, VAT and stock |

Four outlets: **Toy Shop, Food Court, Books & Gifts, Kids Care** — each with
its own price band, so a food court item is not priced like a toy.

### Inventory

`/inventory/stock` (with low-stock and out-of-stock filters),
`/inventory/purchase-orders`, `/inventory/suppliers` and
`/inventory/transfers` for inbound and outbound movement between branches.

### Customers

`/customers` (guardian profiles, segment, source, lifetime spend, points),
`/customers/children` (child profiles linked to guardians, with age-eligible
zones and allergy flags), `/customers/segments`, `/customers/campaigns` and
`/customers/loyalty`.

### Network

| Screen | What it does |
| --- | --- |
| `/branches` ★ | All 30 branches at once: chain KPIs, a Dhaka map with bubbles sized by today's footfall, top and bottom performer rails, and a sortable table with live capacity meters. Click a row and the whole app re-seeds to that branch |
| `/branches/compare` | Rank the network by footfall, revenue, dwell or member share, and roll it up by area |
| `/branches/live` | Real-time headcount at every branch, with the ones at capacity called out |
| `/branches/targets` | Monthly targets derived from licensed capacity, with attainment per branch |

### Marketing

`/messaging/sms` (compose against a template and segment, with a live audience
count and cost estimate), `/messaging/email`, and `/messaging/templates` —
six bilingual templates with variables, covering entry confirmation, exit and
bill, membership expiry, birthday offers, party receipts and pickup reminders.

### Payments & finance

`/payments` (every transaction with gateway, fee and net), `/payments/gateways`
(volume, fee and success rate per gateway with connection state),
`/payments/refunds`, `/payments/settlements` (T+N cycles and what is still
owed), `/finance/revenue`, `/finance/expenses` (branch and corporate, with
approval), `/finance/invoices` and `/finance/daybook`.

### Staff

`/staff/directory`, `/staff/roster` (a week of shift coverage by department),
`/staff/attendance` (14 days of clock-ins) and `/staff/payroll` — where
deductions are derived from the same attendance records the attendance screen
shows, so the two can never disagree.

### Reports & administration

`/reports` lists **16 standing reports** across finance, access, inventory,
network, day-care, staff, marketing and platform, each with a frequency.

| Screen | What it does |
| --- | --- |
| `/admin/users` | Operators with console access, their role, branch scope and 2FA state |
| `/admin/roles` | The **tiered permission matrix** across 7 roles and 13 modules. Clicking a cell cycles the grant, so the matrix responds rather than sitting there |
| `/admin/devices` | POS machines, printers, cash drawers, QR scanners, NFC readers, turnstiles and floor tablets, with state, firmware and battery |
| `/admin/integrations` | The 10 payment, messaging, accounting and analytics connections |
| `/admin/audit-log` | Every privileged action with actor, target and IP |
| `/admin/health` | Uptime against the contracted 99.5%, median response, backup history, the offline queue, SSL validity and **10 UAT scenarios** with pass state |

Seven roles: Master Admin, Operations Manager, Branch Manager, Front Desk,
Outlet Staff, Accounts & Billing, and Payroll.

### Settings

`/settings/general` (branch identity, trading hours, slabs, zones, outlets),
`/settings/localization` (with a live formatting preview),
`/settings/appearance` (theme and interface scale) and
`/settings/notifications` (a channel matrix across in-app, email and SMS).

★ = the screens that carry the demo.

## SRS coverage

| SRS section | Where it lives |
| --- | --- |
| **1.** Mother website, mobile app, customer profiling, service selling, customer dashboard | `/shop` (website and phone-frame app), `/shop/orders`, `/customers`, `/customers/children` |
| **2.** Ticketing software; QR wristband entry/exit with automatic time calculation; NFC membership with weekly/monthly/six-month packages, front-desk verification, discounts and vouchers | `/gate/*`, `/memberships/*` |
| **3.** 30-branch expansion; cloud master admin across all branches; branch-wise admin; tiered role-based access | `/branches/*`, branch switcher, `/admin/roles`, `/admin/users` |
| **4.** Multi-outlet backend (toys, books/cosmetics, food court); inventory and POS; day-care tracking and billing; SSLCommerz/RedDot, bKash, Nagad, Rocket; bulk SMS and email | `/pos`, `/outlets/*`, `/inventory/*`, `/daycare/*`, `/payments/*`, `/messaging/*` |
| **5.** Integrated platform covering all-branch sales, ticketing, POS, corporate income/expense accounting and online bookings | The console as a whole; `/finance/*` covers corporate accounting, `/bookings` the online channel |
| **6.** Sample submission | This repository *is* the sample — a running demo rather than a slide deck |
| **7.** Delivery & logistics | Not a software feature; a commercial term of the tender |
| **8.** 99.5% uptime, UAT, SSL and backups, multi-user and offline mode, hardware integration, receipts, training and data export | `/admin/health`, `/admin/devices`, the offline toggle, receipt previews in `/gate/scan` and `/pos`, export actions on report and table screens |

## Multi-branch

Thirty branches across greater Dhaka — Diabari, Uttara (×3), Mirpur (×4),
Pallabi, Bashundhara, Gulshan (×2), Banani, Baridhara DOHS, Dhanmondi (×2),
Mohammadpur, Shyamoli, Badda, Rampura, Khilgaon, Bailey Road, Motijheel, Wari,
Jatrabari, Mugda, Savar, Ashulia, Tongi and Narayanganj — switchable from the
sidebar header, the shop header or ⌘K.

**27 are live, 2 in soft launch and 1 in fit-out**, so the network roll-up has
something real to say rather than 30 identical rows.

Switching re-seeds every dataset: zones, wristbands, customers, children,
memberships, day-care, outlets, products, sales, inventory, bookings, payments,
staff, devices and charts. Branch size drives volume, so a flagship is visibly
busier than a compact site.

## Offline mode

SRS §8 requires the system to keep working without a connection. The top bar
carries a connectivity toggle: switch it off and a queue counter appears, the
gate and POS screens keep completing transactions into a local queue, and
switching back drains it. `/admin/health` shows the queue alongside the uptime
record, backup history and UAT sign-off.

## Language

Full **bn-BD / en-US** localization across **804 keys in each language**, with
Bangla as the default. `bn.ts` is typed against the shape of `en.ts`, so a
missing translation is a compile error rather than a raw dot-path rendered in
front of a client.

Bangla is not a veneer over an English app: figures render in Bengali numerals
(১২৩) with lakh/crore grouping, dates and currency localize (৳), Noto Sans
Bengali loads for the script, and the mock data itself is native — guardian and
child names, zone names, staff roles, product names, expense heads and SMS
templates are written in Bangla rather than transliterated. Children have their
own name pool; reusing adult names for them reads wrong.

Machine identifiers stay in Latin digits on purpose: an NFC card UID is
hexadecimal, and localizing it would turn `F0 4B` into `F০ ৪B`, which is no
longer the value on the card.

## Accessibility & density

Front-desk software is read all day on ageing monitors, so the whole interface
scales rather than just the type. The control sits beside the profile avatar in
the top bar (and on `/settings/appearance`) and steps from 90% to 140%. Every
size in the app is expressed in `rem`, so raising it grows text, spacing, row
heights, controls and icons together.

The customer app runs at consumer scale — larger type, rounder corners, bigger
tap targets — from the same tokens as the console.

## Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘K` | Command palette — navigate, switch branch, switch language |
| `⌘B` | Collapse the sidebar |
| `⌘⌥+` / `⌘⌥−` | Grow / shrink the interface |
| `⌘⌥0` | Reset interface size |
| `D` | Toggle dark mode |

The palette indexes every screen in **both languages**, so searching "branch"
or "শাখা" finds the same routes.

The app opens in **light** mode. The OS preference is deliberately not
consulted — a dark laptop should not change what a client sees.

## How the data works

The generated dataset is a **pure function of the branch slug**. One seeded
PRNG is threaded through every builder in call order, so the same branch always
produces the same 30-day history, the same staff, the same floor. That is what
makes the demo identical on every open.

Everything is anchored to the current UTC day, so it always reads as "today"
while staying identical between the server render and the client hydrate. The
demo moment sits **seven hours into a twelve-hour trading day**: a full morning
of sessions is closed and billed, the floor is busy, and an evening remains.

Orders placed in the shop must not corrupt that. They live separately in
`lib/live.ts` and `DataProvider` lays them over the generated data, so all 61
console screens pick them up through `useDataset()` without knowing the shop
exists — and "Reset demo data" returns everything to the generated baseline.

## What this is not

Being clear about the edges, because a prototype that oversells itself is worse
than one that does not:

- **There is no backend.** No database, no API, no authentication. Any
  credentials sign you in. Data lives in memory and `localStorage`.
- **Nothing reads hardware.** The QR and NFC consoles are simulations driven by
  typed or clicked codes; no camera or reader is involved. The QR image is
  decorative — the code printed beneath it is the real value.
- **No payment is taken.** Gateway choices are recorded on the order; no
  gateway is contacted.
- **No message is sent.** The SMS and email portals show composition, audience,
  cost and delivery history against generated data.
- **Uptime, backups and UAT are presented, not measured.**
- **All data is fictional.** No real customer, child, staff or financial
  information is present anywhere in this repository.

## Stack & layout

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui on Base UI · Motion · Recharts · TanStack Table · cmdk · Zustand ·
NumberFlow.

```
app/
  (app)/          61 operator screens, grouped by module
  (auth)/         sign in, sign up, reset, OTP, branch selection
  (shop)/         the customer website and app
components/
  motion/         the signature primitives — KPI strip, comb charts, data table,
                  scan console, dwell timer, capacity meter, panels
  charts/         footfall forecast, split bar, Dhaka branch map
  shell/          sidebar, top bar, command palette, branch switcher
  shop/           shop shell, phone frame, consumer-scale UI, QR block
  ui/             shadcn/ui components (Base UI)
lib/
  mock/           deterministic, seeded data generators
  i18n/           en/bn dictionaries, provider, Intl formatters
  branches.ts     the 30-branch registry
  derive.ts       shared selectors over the dataset
  live.ts         orders placed in the shop
  shop.ts         turns a shop cart into console records
```

```bash
bun run dev         # development server
bun run build       # production build
bun run typecheck   # tsc --noEmit
bun run format      # prettier
```

## Notes

- **`bun run lint` fails on the scaffold.** ESLint 10 is incompatible with the
  `eslint-plugin-react` that `eslint-config-next@16.3.4` depends on. This is a
  dependency conflict, not application code — `typecheck` and `build` both pass.
- Bangla relative times ("২১ ঘণ্টা আগে") are formatted in-app rather than by
  `Intl.RelativeTimeFormat`: Node and Chrome ship different spellings for some
  units, which produced a hydration mismatch on every server-rendered timestamp.
- Every timestamp in the app runs on the demo clock, not the wall clock. Mixing
  the two makes a band bought at 10:00 look seven hours overdue.

---

© ReachSavvy Solution Ltd. · Confidential
