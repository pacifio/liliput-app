# লিলিপুটার দুনিয়া — Operations Console

**Liliputer Dunia** — an indoor-playground operating system: ticketing and QR
wristband access, NFC membership, day-care time tracking, multi-outlet POS and
inventory, a customer CRM, and a cloud console spanning **30 branches** across
greater Dhaka.

A prototype built by **ReachSavvy Solution Ltd.** against the Liliputer Dunia
System Requirement Specification of 15 September 2026.

```bash
bun install
bun run dev      # http://localhost:3000 → /login (any credentials work)
```

> The interface opens in **Bangla**. Switch to English from the sidebar footer,
> the ⌘K palette, or `/settings/localization`.

It is built to be **demoed**, not deployed. Everything runs client-side against
deterministic generated data — no backend, no database, no API key, no network
call. The demo behaves identically every time it is opened, which means it
never fails in a room full of people.

---

## What's in it

**74 routes** — 61 operator screens, 8 customer shop screens and 5 auth flows,
all navigable, all populated with coherent data.

| Area | Screens |
| --- | --- |
| Overview | dashboard, activity stream |
| Entry & tickets | gate floor, scan console, ticket counter, wristbands, play sessions, zone capacity |
| Membership | members, NFC card verification, plans, vouchers |
| Day-care | care board, check-in, care billing |
| Bookings | list, 6-step wizard, calendar, party packages |
| Outlets & POS | POS terminal, outlets, catalogue |
| Inventory | stock, purchase orders, suppliers, inter-branch transfers |
| Customers | profiles, child profiles, segments, campaigns, loyalty |
| Marketing | bulk SMS, email portal, templates |
| Network | 30-branch roll-up, compare, live floor, targets |
| Payments | transactions, gateways, refunds, settlements |
| Finance | revenue, expenses, invoices, day book |
| Staff | directory, roster, attendance, payroll |
| Administration | users, roles & access, devices, integrations, audit log, system health |
| Settings | general, language, appearance, notifications |
| Customer shop | home, play tickets, membership, birthdays, shop, cart, checkout, my orders |

## The customer shop

`/shop` is the other half of the demo: the mother website and mobile app the
SRS asks for, and the thing that drives the console.

A visitor books play time, buys a membership, reserves a birthday package or
shops the outlets, and pays with bKash, Nagad, Rocket, card or SSLCommerz. The
moment they check out, **the order appears in the operator console** — in
`/bookings`, `/payments`, `/customers`, `/pos` day totals, the dashboard
revenue mix and the audit log. Nothing is seeded by hand; you prototype the
console by using the shop.

Two artefacts carry across explicitly:

- a **play ticket** prints a QR and a booking reference. Type that reference
  into `/gate/scan` and the console recognises the online booking and offers to
  issue a wristband against it, with the guardian carried over.
- a **membership purchase** issues an NFC card UID. Tap it at
  `/memberships/cards` and it verifies, with its plan, validity and
  entitlements.

The strip above the shop switches between **Website** and **Mobile app** — the
same build rendered full width or inside a phone frame. The shop lays out
against its container rather than the viewport, so one set of markup serves
both. "Reset demo data" on `/shop/orders` clears everything the shop has added.

## Start here

Four screens carry the idea:

1. **Wristband scan console** — `/gate/scan`
   Scan an unknown code and it opens an issue flow; scan a live band and the
   read animation plays, the dwell timer freezes, and a billing card
   materialises — free window, per-block overtime, member discount, receipt.
   This is SRS §2's automatic time calculation, made literal.

2. **NFC membership verification** — `/memberships/cards`
   Tap a card and the membership resolves: plan, validity bar, visits
   remaining, tier entitlements, accept/decline. The picker deliberately
   includes expired, over-limit and suspended cards, so the failure paths are
   demonstrable and not just the happy one.

3. **30-branch master console** — `/branches`
   Every branch at once: chain KPIs, a Dhaka map with bubbles sized by today's
   footfall, top and bottom performer rails, and a sortable table with live
   capacity meters. Click a row and the whole app re-seeds to that branch.

4. **POS terminal** — `/pos`
   Four outlets, category filters, a cart with member discount auto-applied
   from an NFC card, split payment across cash/bKash/Nagad/card/SSLCommerz, a
   printed-receipt preview, and live printer, drawer and scanner chips.

Also worth a look: **zone capacity** (`/gate/capacity`), the **roles matrix**
(`/admin/roles`, where clicking a cell cycles the grant), and **system health**
(`/admin/health`).

## Multi-branch

Thirty branches across greater Dhaka — Diabari, Uttara, Mirpur, Bashundhara,
Gulshan, Banani, Dhanmondi, Mohammadpur, Badda, Rampura, Khilgaon, Bailey Road,
Motijheel, Wari, Jatrabari, Mugda, Savar, Ashulia, Tongi and Narayanganj —
switchable from the sidebar header or ⌘K.

Switching re-seeds every dataset: zones, wristbands, customers, children,
memberships, day-care, outlets, products, sales, inventory, bookings, payments,
staff, devices and charts. Twenty-seven are live, two in soft launch and one in
fit-out, so the roll-up has something real to say.

## Offline mode

SRS §8 requires the system to keep working without a connection. The topbar
carries a connectivity toggle: switch it off and a queue counter appears, the
gate and POS screens keep completing transactions into a local queue, and
switching back drains it. `/admin/health` shows the queue alongside the uptime
record, backup history and UAT sign-off.

## Language

Full **bn-BD / en-US** localization across ~900 keys, with Bangla as the
default and `bn.ts` typed against the `en.ts` shape — a missing translation is
a compile error, not a raw key rendered in front of a client.

Bangla is not a veneer over an English app: figures render in Bengali numerals
(১২৩) with lakh/crore grouping, dates and currency localize (৳), Noto Sans
Bengali loads for the script, and the mock data itself is native — guardian and
child names, zone names, staff roles, product names, expense heads and SMS
templates are written in Bangla rather than transliterated.

## Accessibility & density

Front-desk software is read all day on ageing monitors, so the whole interface
scales rather than just the type. The control sits beside the profile avatar in
the top bar (and on `/settings/appearance`) and steps from 90% to 140%. Every
size in the app is expressed in `rem`, so raising it grows text, spacing, row
heights, controls and icons together.

## Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘K` | Command palette — navigate, switch branch, switch language |
| `⌘B` | Collapse the sidebar |
| `⌘⌥+` / `⌘⌥−` | Grow / shrink the interface |
| `⌘⌥0` | Reset interface size |
| `D` | Toggle dark mode |

The console opens in **light** mode. The OS preference is deliberately not
consulted — a dark laptop should not change what a client sees.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui on Base UI · Motion · Recharts · TanStack Table · cmdk · Zustand ·
NumberFlow.

## Project layout

```
app/
  (app)/          61 application screens, grouped by module
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

The generated dataset stays a pure function of the branch slug — that is what
makes the demo identical on every open. Shop orders live separately in
`lib/live.ts`, and `DataProvider` lays them over the generated data, so all 61
console screens pick them up through `useDataset()` without knowing the shop
exists.

## Scripts

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
- Data is anchored to the current UTC day so the demo always reads as "today"
  while staying identical between the server render and the client hydrate. The
  demo moment sits seven hours into a twelve-hour trading day: a full morning of
  sessions is closed and billed, the floor is busy, and an evening remains.
- Bangla relative times ("২১ ঘণ্টা আগে") are formatted in-app rather than by
  `Intl.RelativeTimeFormat`: Node and Chrome ship different spellings for some
  units, which produced a hydration mismatch on every server-rendered timestamp.
- All data is fictional. No real customer, child, staff or financial
  information is present anywhere in this repository.

---

© ReachSavvy Solution Ltd. · Confidential
