import { DAY_MS, addDays, demoNow, demoToday, isoDay } from "@/lib/demo-time"
import { createRng, type Rng } from "@/lib/mock/rng"
import {
  ALERT_SPEC,
  ALLERGIES,
  AUDIT_ACTIONS,
  BOOK_ITEMS,
  CHILD_NOTES,
  COSMETIC_ITEMS,
  DEVICE_LOCATIONS,
  DEVICE_MODELS,
  EXPENSE_HEADS,
  FOOD_ITEMS,
  GATES,
  LEDGER_ACCOUNTS,
  OUTLET_CATEGORIES,
  PARTY_SPEC,
  PAY_TERMS,
  SEGMENTS,
  STAFF_ROLES,
  SUPPLIER_NAMES,
  TOY_PRODUCTS,
  UNITS,
  ZONE_SPEC,
  adultName,
  childName,
} from "@/lib/mock/pools"
import type {
  AlertItem,
  AppUser,
  Attendance,
  AuditEntry,
  Bilingual,
  Booking,
  Branch,
  Campaign,
  Child,
  Customer,
  Dataset,
  Department,
  Device,
  DeviceKind,
  Expense,
  Gateway,
  Integration,
  InventoryItem,
  Invoice,
  KpiCard,
  LedgerEntry,
  MessageBatch,
  MessageTemplate,
  Membership,
  Outlet,
  OutletKind,
  PartyPackage,
  Payment,
  PlanId,
  PlaySession,
  Product,
  PurchaseOrder,
  Role,
  SaleLine,
  SaleOrder,
  SeriesPoint,
  Slab,
  Staff,
  StockTransfer,
  Supplier,
  SyncQueueItem,
  TagHue,
  Voucher,
  Wristband,
  Zone,
} from "@/lib/types"
import type { DaycareStay, Plan } from "@/lib/types"
import { BRANCHES } from "@/lib/branches"

const HUES: TagHue[] = [
  "blue",
  "teal",
  "green",
  "purple",
  "magenta",
  "amber",
  "rose",
  "slate",
]

const MIN = 60_000

/** The trading day, measured around `demoNow()`. */
export const TRADING_ELAPSED_MIN = 7 * 60
export const TRADING_REMAINING_MIN = 5 * 60

/** The trading window the gate screens chart their arrival profile against. */
export function tradingWindow(now = demoNow()) {
  return {
    open: now - TRADING_ELAPSED_MIN * 60_000,
    close: now + TRADING_REMAINING_MIN * 60_000,
    elapsedHours: TRADING_ELAPSED_MIN / 60,
    totalHours: (TRADING_ELAPSED_MIN + TRADING_REMAINING_MIN) / 60,
  }
}
const pad = (n: number, w = 3) => String(n).padStart(w, "0")
const round = (n: number, to = 1) => Math.round(n / to) * to
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))

/* ================================================================ *
 * STATIC DOMAIN TABLES
 * ================================================================ */

export const SLABS: Slab[] = [
  {
    id: "slab_60",
    name: { en: "1 Hour", bn: "১ ঘণ্টা" },
    includedMinutes: 60,
    basePrice: 350,
    overtimeBlock: 15,
    overtimePrice: 100,
    hue: "teal",
  },
  {
    id: "slab_90",
    name: { en: "90 Minutes", bn: "৯০ মিনিট" },
    includedMinutes: 90,
    basePrice: 480,
    overtimeBlock: 15,
    overtimePrice: 90,
    hue: "blue",
  },
  {
    id: "slab_120",
    name: { en: "2 Hours", bn: "২ ঘণ্টা" },
    includedMinutes: 120,
    basePrice: 600,
    overtimeBlock: 15,
    overtimePrice: 80,
    hue: "amber",
  },
  {
    id: "slab_day",
    name: { en: "Day Pass", bn: "ডে পাস" },
    includedMinutes: 480,
    basePrice: 1100,
    overtimeBlock: 30,
    overtimePrice: 120,
    hue: "magenta",
  },
]

export const PLANS: Plan[] = [
  {
    id: "weekly",
    name: { en: "Weekly", bn: "সাপ্তাহিক" },
    days: 7,
    visits: 5,
    price: 1800,
    discountPct: 5,
    hue: "teal",
    perks: [
      { en: "5 play visits", bn: "৫টি প্লে ভিজিট" },
      { en: "5% off outlets", bn: "আউটলেটে ৫% ছাড়" },
      { en: "Priority entry lane", bn: "প্রায়োরিটি এন্ট্রি লেন" },
    ],
  },
  {
    id: "monthly",
    name: { en: "Monthly", bn: "মাসিক" },
    days: 30,
    visits: 20,
    price: 5600,
    discountPct: 10,
    hue: "amber",
    perks: [
      { en: "20 play visits", bn: "২০টি প্লে ভিজিট" },
      { en: "10% off outlets", bn: "আউটলেটে ১০% ছাড়" },
      { en: "Free locker", bn: "ফ্রি লকার" },
      { en: "2 free day-care hours", bn: "২ ঘণ্টা ফ্রি ডে-কেয়ার" },
    ],
  },
  {
    id: "half-year",
    name: { en: "Six Month", bn: "ছয় মাস" },
    days: 180,
    visits: 140,
    price: 26000,
    discountPct: 15,
    hue: "magenta",
    perks: [
      { en: "140 play visits", bn: "১৪০টি প্লে ভিজিট" },
      { en: "15% off outlets", bn: "আউটলেটে ১৫% ছাড়" },
      { en: "Free birthday hour", bn: "ফ্রি বার্থডে আওয়ার" },
      { en: "Guest pass ×4", bn: "গেস্ট পাস ×৪" },
      { en: "All-branch access", bn: "সব শাখায় প্রবেশ" },
    ],
  },
]

export const PACKAGES: PartyPackage[] = PARTY_SPEC.map((p) => ({
  id: p.id,
  name: p.name,
  heads: p.heads,
  hours: p.hours,
  price: p.price,
  includes: [...p.includes],
  hue: p.hue as TagHue,
}))

const MODULE_KEYS = [
  "gate",
  "memberships",
  "daycare",
  "bookings",
  "pos",
  "inventory",
  "customers",
  "branches",
  "messaging",
  "payments",
  "finance",
  "staff",
  "admin",
] as const

type Grant = "full" | "write" | "read" | "none"

function grants(spec: Partial<Record<string, Grant>>, fallback: Grant) {
  const out: Record<string, Grant> = {}
  for (const key of MODULE_KEYS) out[key] = spec[key] ?? fallback
  return out
}

export const ROLES: Role[] = [
  {
    id: "master",
    name: { en: "Master Admin", bn: "মাস্টার অ্যাডমিন" },
    description: {
      en: "Owner-level control across all 30 branches.",
      bn: "৩০টি শাখার উপর মালিকানা পর্যায়ের নিয়ন্ত্রণ।",
    },
    users: 2,
    hue: "rose",
    grants: grants({}, "full"),
  },
  {
    id: "operations",
    name: { en: "Operations Manager", bn: "অপারেশনস ম্যানেজার" },
    description: {
      en: "Runs the network day to day; no payroll or role changes.",
      bn: "নেটওয়ার্কের দৈনন্দিন পরিচালনা; পেরোল বা ভূমিকা পরিবর্তন নয়।",
    },
    users: 4,
    hue: "purple",
    grants: grants({ admin: "read", finance: "read" }, "full"),
  },
  {
    id: "branchManager",
    name: { en: "Branch Manager", bn: "ব্রাঞ্চ ম্যানেজার" },
    description: {
      en: "Full control of one branch only.",
      bn: "শুধুমাত্র একটি শাখার পূর্ণ নিয়ন্ত্রণ।",
    },
    users: 30,
    hue: "blue",
    grants: grants(
      { branches: "read", admin: "none", messaging: "write" },
      "full"
    ),
  },
  {
    id: "frontDesk",
    name: { en: "Front Desk", bn: "ফ্রন্ট ডেস্ক" },
    description: {
      en: "Ticketing, wristbands, NFC verification, day-care desk.",
      bn: "টিকেটিং, রিস্টব্যান্ড, এনএফসি যাচাই, ডে-কেয়ার ডেস্ক।",
    },
    users: 96,
    hue: "teal",
    grants: grants(
      {
        gate: "full",
        memberships: "write",
        daycare: "full",
        bookings: "write",
        customers: "write",
      },
      "none"
    ),
  },
  {
    id: "outletStaff",
    name: { en: "Outlet Staff", bn: "আউটলেট স্টাফ" },
    description: {
      en: "POS billing and stock counts at a single outlet.",
      bn: "একটি আউটলেটে POS বিলিং ও স্টক গণনা।",
    },
    users: 142,
    hue: "green",
    grants: grants({ pos: "full", inventory: "write" }, "none"),
  },
  {
    id: "accounts",
    name: { en: "Accounts & Billing", bn: "অ্যাকাউন্টস ও বিলিং" },
    description: {
      en: "Revenue, expenses, invoices and gateway settlement.",
      bn: "রাজস্ব, ব্যয়, ইনভয়েস ও গেটওয়ে সেটেলমেন্ট।",
    },
    users: 8,
    hue: "amber",
    grants: grants(
      { finance: "full", payments: "full", branches: "read" },
      "read"
    ),
  },
  {
    id: "payroll",
    name: { en: "Payroll", bn: "পেরোল" },
    description: {
      en: "Staff records, attendance and salary disbursement only.",
      bn: "শুধুমাত্র স্টাফ রেকর্ড, উপস্থিতি ও বেতন প্রদান।",
    },
    users: 3,
    hue: "slate",
    grants: grants({ staff: "full", finance: "read" }, "none"),
  },
]

/* ================================================================ *
 * BUILDERS
 * ================================================================ */

function buildZones(branch: Branch): Zone[] {
  return ZONE_SPEC.map((z) => ({
    id: `zone_${z.key}`,
    name: z.name,
    capacity: Math.max(8, Math.round(branch.capacity * z.share)),
    ageBand: z.age,
    minAge: z.minAge,
    maxAge: z.maxAge,
    hue: z.hue as TagHue,
    supervised: z.supervised,
  }))
}

function buildCustomers(rng: Rng, branch: Branch, count: number): Customer[] {
  const out: Customer[] = []
  for (let i = 0; i < count; i++) {
    const seg = rng.weighted(
      SEGMENTS.map((s) => [s, s.weight] as [(typeof SEGMENTS)[number], number])
    )
    const visits = rng.int(1, 64)
    out.push({
      id: `cus_${pad(i, 4)}`,
      name: adultName(rng.int(0, 999), rng.int(0, 999)),
      phone: `+88017${pad(rng.int(10000000, 99999999), 8)}`,
      email: `guardian${i}@example.com`,
      area: branch.area,
      joinedAt: demoNow() - rng.int(10, 900) * DAY_MS,
      visits,
      spend: visits * rng.int(420, 1650),
      points: visits * rng.int(8, 34),
      segment: seg.label,
      segmentHue: seg.hue as TagHue,
      source: rng.weighted<Customer["source"]>([
        ["app", 34],
        ["website", 26],
        ["walk-in", 30],
        ["referral", 10],
      ]),
      consent: { sms: rng.bool(0.86), email: rng.bool(0.64) },
    })
  }
  return out
}

function buildChildren(rng: Rng, customers: Customer[]): Child[] {
  const out: Child[] = []
  let n = 0
  for (const c of customers) {
    const kids = rng.weighted([
      [1, 56],
      [2, 34],
      [3, 10],
    ])
    for (let k = 0; k < kids; k++) {
      const gender: "boy" | "girl" = rng.bool() ? "boy" : "girl"
      out.push({
        id: `chd_${pad(n, 4)}`,
        name: childName(rng.int(0, 999), rng.int(0, 999), gender),
        guardianId: c.id,
        age: rng.int(1, 13),
        gender,
        allergies: rng.bool(0.22) ? [rng.pick(ALLERGIES)] : [],
        notes: rng.bool(0.18) ? rng.pick(CHILD_NOTES) : undefined,
        avatarSeed: rng.int(1, 9999),
      })
      n++
    }
  }
  return out
}

function buildMemberships(
  rng: Rng,
  branch: Branch,
  customers: Customer[]
): Membership[] {
  const out: Membership[] = []
  const now = demoNow()
  const members = customers.filter(() => rng.bool(0.22))
  members.forEach((c, i) => {
    const plan = rng.weighted<PlanId>([
      ["weekly", 26],
      ["monthly", 52],
      ["half-year", 22],
    ])
    const spec = PLANS.find((p) => p.id === plan)!
    const startedAt = now - rng.int(0, spec.days + 30) * DAY_MS
    const expiresAt = startedAt + spec.days * DAY_MS
    const daysLeft = Math.round((expiresAt - now) / DAY_MS)
    const status =
      daysLeft < 0
        ? "expired"
        : daysLeft <= 7
          ? "expiring"
          : rng.bool(0.03)
            ? "suspended"
            : "active"
    const uid = Array.from({ length: 4 }, () =>
      rng.int(0, 255).toString(16).toUpperCase().padStart(2, "0")
    ).join(" ")
    out.push({
      id: `mem_${pad(i, 4)}`,
      cardUid: uid,
      customerId: c.id,
      planId: plan,
      tier:
        plan === "half-year"
          ? "platinum"
          : plan === "monthly"
            ? "gold"
            : "silver",
      startedAt,
      expiresAt,
      visitsUsed: rng.int(0, spec.visits + 4),
      status,
      autoRenew: rng.bool(0.42),
      branchId: branch.id,
    })
    c.membershipId = out[out.length - 1].id
  })
  return out
}

function buildVouchers(rng: Rng): Voucher[] {
  const spec: {
    code: string
    label: Bilingual
    kind: Voucher["kind"]
    value: number
  }[] = [
    {
      code: "EIDPLAY25",
      label: { en: "Eid Play 25%", bn: "ঈদ প্লে ২৫%" },
      kind: "percent",
      value: 25,
    },
    {
      code: "BIRTHDAY100",
      label: { en: "Birthday Free Hour", bn: "জন্মদিনে ফ্রি আওয়ার" },
      kind: "free-hour",
      value: 1,
    },
    {
      code: "MEMBER10",
      label: { en: "Member Extra 10%", bn: "সদস্য অতিরিক্ত ১০%" },
      kind: "percent",
      value: 10,
    },
    {
      code: "WEEKDAY150",
      label: { en: "Weekday ৳150 off", bn: "উইকডে ৳১৫০ ছাড়" },
      kind: "flat",
      value: 150,
    },
    {
      code: "REFER200",
      label: { en: "Referral ৳200", bn: "রেফারেল ৳২০০" },
      kind: "flat",
      value: 200,
    },
    {
      code: "SCHOOL20",
      label: { en: "School Group 20%", bn: "স্কুল গ্রুপ ২০%" },
      kind: "percent",
      value: 20,
    },
  ]
  return spec.map((s, i) => {
    const issued = rng.int(120, 2400)
    return {
      id: `vch_${pad(i)}`,
      code: s.code,
      label: s.label,
      kind: s.kind,
      value: s.value,
      issued,
      redeemed: Math.round(issued * rng.float(0.12, 0.68)),
      expiresAt: demoNow() + rng.int(-20, 90) * DAY_MS,
      status: rng.weighted<Voucher["status"]>([
        ["active", 70],
        ["paused", 18],
        ["expired", 12],
      ]),
      hue: HUES[i % HUES.length],
    }
  })
}

function buildStaff(rng: Rng, branch: Branch, count: number): Staff[] {
  const depts: [Department, number][] = [
    ["floor", 30],
    ["daycare", 16],
    ["frontDesk", 14],
    ["outlet", 18],
    ["kitchen", 10],
    ["maintenance", 7],
    ["admin", 5],
  ]
  const out: Staff[] = []
  for (let i = 0; i < count; i++) {
    const dept = rng.weighted(depts)
    const role = rng.pick(STAFF_ROLES[dept])
    out.push({
      id: `stf_${pad(i)}`,
      name: adultName(rng.int(0, 999), rng.int(0, 999)),
      role,
      department: dept,
      phone: `+88018${pad(rng.int(10000000, 99999999), 8)}`,
      joinedAt: demoNow() - rng.int(30, 1600) * DAY_MS,
      salary: round(rng.int(14000, 62000), 500),
      shift: rng.weighted<Staff["shift"]>([
        ["morning", 42],
        ["evening", 42],
        ["split", 16],
      ]),
      status: rng.weighted<Staff["status"]>([
        ["active", 88],
        ["leave", 7],
        ["probation", 5],
      ]),
      hue: HUES[i % HUES.length],
      certified: dept === "daycare" ? rng.bool(0.92) : rng.bool(0.4),
    })
  }
  // Every branch has exactly one manager, and it is the one on record.
  out[0] = {
    ...out[0],
    name: branch.manager,
    department: "admin",
    role: STAFF_ROLES.admin[0],
    status: "active",
    salary: 92000,
  }
  return out
}

function buildAttendance(rng: Rng, staff: Staff[]): Attendance[] {
  const out: Attendance[] = []
  const today = demoToday()
  for (let d = 0; d < 14; d++) {
    const date = addDays(today, -d)
    const day = isoDay(date)
    for (const s of staff) {
      const state = rng.weighted<Attendance["state"]>([
        ["present", 78],
        ["late", 9],
        ["absent", 4],
        ["leave", 6],
        ["holiday", 3],
      ])
      const base = date.getTime() + 10 * 3_600_000
      const worked = state === "present" || state === "late"
      out.push({
        id: `att_${day}_${s.id}`,
        staffId: s.id,
        day,
        inAt: worked
          ? base + (state === "late" ? rng.int(12, 55) * MIN : 0)
          : undefined,
        outAt: worked ? base + rng.int(8, 10) * 3_600_000 : undefined,
        state,
        hours: worked ? rng.float(7.2, 9.8) : 0,
      })
    }
  }
  return out
}

/**
 * The wristband walk — the analogue of a hotel's reservation timeline, and
 * the generator the whole gate module reads from.
 *
 * Bands are issued across the trading day following a realistic arrival
 * curve; anything issued before `now` whose slab has run out is exited (or
 * flagged as an overstay), and the rest are still on the floor with a live
 * dwell. Zone assignment respects `zone.capacity`, so the capacity board
 * never shows a zone above 100%.
 */
function buildWristbands(
  rng: Rng,
  branch: Branch,
  zones: Zone[],
  children: Child[],
  staff: Staff[],
  memberships: Membership[]
): Wristband[] {
  const now = demoNow()
  // The demo moment sits seven hours into a twelve-hour trading day, so the
  // floor is busy, a full morning of sessions is already closed and billed,
  // and there is still an evening ahead. Anchoring `open` to `demoNow` rather
  // than to a wall-clock hour keeps that true whenever the demo is opened.
  const open = now - TRADING_ELAPSED_MIN * MIN
  const tradingMinutes = TRADING_ELAPSED_MIN + TRADING_REMAINING_MIN
  const desk = staff.filter((s) => s.department === "frontDesk")
  const out: Wristband[] = []
  const live = new Map(zones.map((z) => [z.id, 0]))
  const issued = Math.round(branch.capacity * 2.4)

  for (let i = 0; i < issued; i++) {
    const child = rng.pick(children)
    // Arrival curve across the trading day: a slow open, a midday bump, then
    // a heavy late afternoon. Quarters are scaled to the day length so the
    // shape survives a change to the trading window.
    const q = tradingMinutes / 4
    const minutesIn = rng.weighted([
      [rng.int(0, q), 18],
      [rng.int(q, q * 2), 26],
      [rng.int(q * 2, q * 3), 32],
      [rng.int(q * 3, q * 4), 24],
    ])
    const entryAt = open + minutesIn * MIN
    // Nothing has happened yet after the demo moment.
    if (entryAt > now) continue

    const eligible = zones.filter(
      (z) => child.age >= z.minAge && child.age <= z.maxAge
    )
    const zone = rng.pick(eligible.length ? eligible : zones)
    const slab = rng.weighted([
      [SLABS[0], 30],
      [SLABS[1], 34],
      [SLABS[2], 26],
      [SLABS[3], 10],
    ])

    const elapsed = Math.round((now - entryAt) / MIN)
    const intended =
      slab.includedMinutes +
      rng.weighted([
        [rng.int(-25, 0), 40],
        [rng.int(0, 20), 42],
        [rng.int(20, 70), 18],
      ])

    const stillIn = elapsed < intended && live.get(zone.id)! < zone.capacity

    const membership = memberships.find(
      (m) => m.customerId === child.guardianId && m.status !== "expired"
    )

    if (stillIn) live.set(zone.id, live.get(zone.id)! + 1)

    const minutes = stillIn ? Math.max(0, elapsed) : Math.max(5, intended)
    const status: Wristband["status"] = stillIn
      ? minutes > slab.includedMinutes
        ? "overstay"
        : "active"
      : rng.bool(0.004)
        ? "lost"
        : "exited"

    out.push({
      id: `bnd_${pad(i, 4)}`,
      code: `LD-${pad(rng.int(100000, 999999), 6)}`,
      childId: child.id,
      guardianId: child.guardianId,
      zoneId: zone.id,
      slabId: slab.id,
      membershipId: membership?.id,
      entryAt,
      exitAt: stillIn ? undefined : entryAt + minutes * MIN,
      minutes,
      status,
      gate: rng.pick(GATES),
      operatorId: (desk.length ? rng.pick(desk) : staff[0]).id,
    })
  }
  return out.sort((a, b) => b.entryAt - a.entryAt)
}

function buildSessions(rng: Rng, bands: Wristband[]): PlaySession[] {
  return bands
    .filter((b) => b.exitAt && b.status === "exited")
    .map((b, i) => {
      const slab = SLABS.find((s) => s.id === b.slabId)!
      const over = Math.max(0, b.minutes - slab.includedMinutes)
      const blocks = Math.ceil(over / slab.overtimeBlock)
      const overtime = blocks * slab.overtimePrice
      const discount = b.membershipId
        ? Math.round((slab.basePrice + overtime) * 0.1)
        : rng.bool(0.08)
          ? 150
          : 0
      return {
        id: `ses_${pad(i, 4)}`,
        bandId: b.id,
        childId: b.childId,
        guardianId: b.guardianId,
        zoneId: b.zoneId,
        slabId: b.slabId,
        entryAt: b.entryAt,
        exitAt: b.exitAt!,
        minutes: b.minutes,
        basePrice: slab.basePrice,
        overtime,
        discount,
        total: slab.basePrice + overtime - discount,
      }
    })
}

function buildDaycare(
  rng: Rng,
  branch: Branch,
  children: Child[],
  staff: Staff[]
): DaycareStay[] {
  const now = demoNow()
  const carers = staff.filter((s) => s.department === "daycare")
  const count = Math.round(branch.capacity * 0.35)
  const out: DaycareStay[] = []
  for (let i = 0; i < count; i++) {
    const child = rng.pick(children.filter((c) => c.age <= 8)) ?? children[0]
    const checkInAt = now - rng.int(20, 420) * MIN
    const limitMinutes = rng.pick([120, 180, 240, 360])
    const elapsed = Math.round((now - checkInAt) / MIN)
    const released = elapsed > limitMinutes * rng.float(0.7, 1.3)
    const minutes = released
      ? Math.min(elapsed, limitMinutes + rng.int(0, 40))
      : elapsed
    const ratePerHour = 260
    out.push({
      id: `dcs_${pad(i)}`,
      childId: child.id,
      guardianId: child.guardianId,
      caregiverId: (carers.length ? rng.pick(carers) : staff[0]).id,
      checkInAt,
      checkOutAt: released ? checkInAt + minutes * MIN : undefined,
      limitMinutes,
      minutes,
      ratePerHour,
      total: Math.round((minutes / 60) * ratePerHour),
      status: released
        ? "released"
        : elapsed > limitMinutes
          ? "overdue"
          : "in-care",
      notes: rng.bool(0.25) ? rng.pick(CHILD_NOTES) : undefined,
      meals: rng.int(0, 2),
    })
  }
  return out.sort((a, b) => b.checkInAt - a.checkInAt)
}

function buildOutlets(rng: Rng, branch: Branch): Outlet[] {
  const spec: { kind: OutletKind; name: Bilingual; hue: TagHue }[] = [
    { kind: "toys", name: { en: "Toy Shop", bn: "টয় শপ" }, hue: "rose" },
    {
      kind: "food",
      name: { en: "Food Court", bn: "ফুড কোর্ট" },
      hue: "amber",
    },
    {
      kind: "books",
      name: { en: "Books & Gifts", bn: "বই ও উপহার" },
      hue: "teal",
    },
    {
      kind: "cosmetics",
      name: { en: "Kids Care", bn: "কিডস কেয়ার" },
      hue: "purple",
    },
  ]
  return spec.map((s, i) => ({
    id: `out_${s.kind}`,
    name: s.name,
    kind: s.kind,
    hue: s.hue,
    terminalId: `${branch.initials}-POS-${i + 1}`,
    staffCount: rng.int(2, 6),
  }))
}

/** Shelf price bands per outlet, in BDT — a food court is not a toy shop. */
const PRICE_BAND: Record<OutletKind, [number, number]> = {
  toys: [180, 2400],
  food: [40, 380],
  books: [90, 750],
  cosmetics: [140, 1100],
}

function buildProducts(rng: Rng, outlets: Outlet[]): Product[] {
  const pools: Record<OutletKind, Bilingual[]> = {
    toys: TOY_PRODUCTS,
    food: FOOD_ITEMS,
    books: BOOK_ITEMS,
    cosmetics: COSMETIC_ITEMS,
  }
  const out: Product[] = []
  let n = 0
  for (const outlet of outlets) {
    const pool = pools[outlet.kind]
    const cats = OUTLET_CATEGORIES[outlet.kind]
    const [low, high] = PRICE_BAND[outlet.kind]
    for (const item of pool) {
      const price = round(rng.int(low, high), 5)
      const cost = round(price / rng.float(1.4, 2.2), 5)
      const stock = rng.int(0, 120)
      out.push({
        id: `prd_${pad(n, 4)}`,
        sku: `${outlet.kind.slice(0, 2).toUpperCase()}-${pad(n, 4)}`,
        name: item,
        outletId: outlet.id,
        category: rng.pick(cats),
        price,
        cost,
        stock,
        reorderAt: rng.int(8, 25),
        vatPct: outlet.kind === "food" ? 5 : 7.5,
        hue: outlet.hue,
      })
      n++
    }
  }
  return out
}

function buildSales(
  rng: Rng,
  branch: Branch,
  outlets: Outlet[],
  products: Product[],
  customers: Customer[],
  staff: Staff[]
): SaleOrder[] {
  const now = demoNow()
  const cashiers = staff.filter((s) => s.department === "outlet")
  const out: SaleOrder[] = []
  const count = Math.round(branch.capacity * 1.6)
  for (let i = 0; i < count; i++) {
    const outlet = rng.weighted(
      outlets.map((o) => [o, o.kind === "food" ? 44 : 20] as [Outlet, number])
    )
    const pool = products.filter((p) => p.outletId === outlet.id)
    const lines: SaleLine[] = rng.pickMany(pool, rng.int(1, 4)).map((p) => {
      const qty = rng.int(1, 3)
      return { productId: p.id, qty, price: p.price, total: p.price * qty }
    })
    const subtotal = lines.reduce((s, l) => s + l.total, 0)
    const customer = rng.bool(0.55) ? rng.pick(customers) : undefined
    const membershipId = customer?.membershipId
    const discount = membershipId ? Math.round(subtotal * 0.1) : 0
    const vat = Math.round((subtotal - discount) * 0.06)
    out.push({
      id: `sal_${pad(i, 4)}`,
      ref: `${branch.initials}${pad(90000 + i, 5)}`,
      outletId: outlet.id,
      customerId: customer?.id,
      membershipId,
      lines,
      subtotal,
      discount,
      vat,
      total: subtotal - discount + vat,
      at: now - rng.int(5, 600) * MIN,
      cashierId: (cashiers.length ? rng.pick(cashiers) : staff[0]).id,
      paymentId: `pay_s_${pad(i, 4)}`,
      synced: rng.bool(0.96),
    })
  }
  return out.sort((a, b) => b.at - a.at)
}

function buildSuppliers(rng: Rng): Supplier[] {
  return SUPPLIER_NAMES.map((name, i) => ({
    id: `sup_${pad(i)}`,
    name,
    contact: adultName(rng.int(0, 999), rng.int(0, 999)),
    phone: `+88019${pad(rng.int(10000000, 99999999), 8)}`,
    category: rng.pick(Object.values(OUTLET_CATEGORIES).flat()),
    terms: rng.pick(PAY_TERMS),
    rating: Number(rng.float(3.1, 4.9).toFixed(1)),
    outstanding: round(rng.int(0, 480000), 500),
    since: demoNow() - rng.int(200, 2000) * DAY_MS,
  }))
}

function buildInventory(
  rng: Rng,
  products: Product[],
  suppliers: Supplier[]
): InventoryItem[] {
  return products.map((p, i) => ({
    id: `inv_${pad(i, 4)}`,
    sku: p.sku,
    name: p.name,
    category: p.category,
    outletId: p.outletId,
    onHand: p.stock,
    reserved: rng.int(0, 8),
    reorderAt: p.reorderAt,
    unit: rng.pick(UNITS),
    unitCost: p.cost,
    supplierId: rng.pick(suppliers).id,
    updatedAt: demoNow() - rng.int(1, 340) * 60 * MIN,
    hue: p.hue,
  }))
}

function buildPurchaseOrders(
  rng: Rng,
  branch: Branch,
  suppliers: Supplier[]
): PurchaseOrder[] {
  return Array.from({ length: 22 }, (_, i) => {
    const placedAt = demoNow() - rng.int(0, 80) * DAY_MS
    return {
      id: `pos_${pad(i)}`,
      ref: `PO-${branch.initials}-${pad(1200 + i, 4)}`,
      supplierId: rng.pick(suppliers).id,
      placedAt,
      expectedAt: placedAt + rng.int(3, 21) * DAY_MS,
      items: rng.int(3, 34),
      total: round(rng.int(18000, 640000), 100),
      status: rng.weighted<PurchaseOrder["status"]>([
        ["received", 42],
        ["sent", 22],
        ["partial", 16],
        ["draft", 14],
        ["cancelled", 6],
      ]),
    }
  }).sort((a, b) => b.placedAt - a.placedAt)
}

function buildTransfers(rng: Rng, branch: Branch): StockTransfer[] {
  const others = BRANCHES.filter((b) => b.id !== branch.id)
  return Array.from({ length: 16 }, (_, i) => {
    const outbound = rng.bool()
    const other = rng.pick(others)
    return {
      id: `trf_${pad(i)}`,
      ref: `TR-${pad(4400 + i, 4)}`,
      fromBranchId: outbound ? branch.id : other.id,
      toBranchId: outbound ? other.id : branch.id,
      items: rng.int(2, 40),
      value: round(rng.int(4000, 180000), 100),
      raisedAt: demoNow() - rng.int(0, 45) * DAY_MS,
      status: rng.weighted<StockTransfer["status"]>([
        ["received", 46],
        ["in-transit", 26],
        ["requested", 20],
        ["rejected", 8],
      ]),
    }
  }).sort((a, b) => b.raisedAt - a.raisedAt)
}

function buildBookings(
  rng: Rng,
  branch: Branch,
  customers: Customer[],
  children: Child[]
): Booking[] {
  const today = demoToday()
  const out: Booking[] = []
  const count = Math.round(branch.capacity * 0.9)
  for (let i = 0; i < count; i++) {
    const offset = rng.int(-30, 28)
    const date = addDays(today, offset)
    const kind = rng.weighted<Booking["kind"]>([
      ["ticket", 58],
      ["party", 18],
      ["daycare", 16],
      ["membership", 8],
    ])
    const customer = rng.pick(customers)
    const kids = children.filter((c) => c.guardianId === customer.id)
    const pkg = kind === "party" ? rng.pick(PACKAGES) : undefined
    const heads = pkg ? pkg.heads : rng.int(1, 4)
    const startAt = date.getTime() + rng.int(10, 19) * 3_600_000
    const amount = pkg
      ? pkg.price
      : kind === "membership"
        ? rng.pick(PLANS).price
        : heads * rng.pick(SLABS).basePrice
    const status: Booking["status"] =
      offset > 0
        ? rng.weighted([
            ["confirmed", 74],
            ["pending", 20],
            ["cancelled", 6],
          ])
        : offset === 0
          ? rng.weighted([
              ["checked-in", 46],
              ["confirmed", 34],
              ["completed", 16],
              ["cancelled", 4],
            ])
          : rng.weighted([
              ["completed", 88],
              ["cancelled", 12],
            ])
    out.push({
      id: `bkg_${pad(i, 4)}`,
      ref: `LD${pad(40000 + i, 5)}`,
      kind,
      customerId: customer.id,
      childIds: kids.slice(0, 2).map((c) => c.id),
      packageId: pkg?.id,
      date: isoDay(date),
      startAt,
      endAt: startAt + (pkg ? pkg.hours : 2) * 3_600_000,
      heads,
      amount,
      paid:
        status === "cancelled"
          ? 0
          : rng.bool(0.72)
            ? amount
            : Math.round(amount * 0.3),
      channel: rng.weighted<Booking["channel"]>([
        ["app", 38],
        ["website", 32],
        ["counter", 20],
        ["phone", 10],
      ]),
      status,
      paymentId: `pay_b_${pad(i, 4)}`,
    })
  }
  return out.sort((a, b) => b.startAt - a.startAt)
}

function buildPayments(
  rng: Rng,
  sessions: PlaySession[],
  sales: SaleOrder[],
  bookings: Booking[],
  memberships: Membership[]
): Payment[] {
  const out: Payment[] = []
  const gw = (): Gateway =>
    rng.weighted<Gateway>([
      ["bkash", 32],
      ["cash", 24],
      ["nagad", 14],
      ["card", 12],
      ["sslcommerz", 10],
      ["rocket", 5],
      ["reddot", 3],
    ])
  const push = (
    id: string,
    amount: number,
    at: number,
    against: Payment["against"],
    refId: string,
    customerId?: string
  ) => {
    const gateway = gw()
    const status = rng.weighted<Payment["status"]>([
      ["success", 92],
      ["pending", 4],
      ["failed", 3],
      ["refunded", 1],
    ])
    out.push({
      id,
      txnId: `TXN${pad(rng.int(100000000, 999999999), 9)}`,
      gateway,
      amount,
      fee: gateway === "cash" ? 0 : Math.round(amount * 0.0185),
      at,
      status,
      against,
      refId,
      customerId,
    })
  }
  sessions
    .slice(0, 220)
    .forEach((s, i) =>
      push(
        `pay_t_${pad(i, 4)}`,
        s.total,
        s.exitAt,
        "ticket",
        s.id,
        s.guardianId
      )
    )
  sales.forEach((s, i) =>
    push(`pay_s_${pad(i, 4)}`, s.total, s.at, "pos", s.id, s.customerId)
  )
  bookings
    .slice(0, 160)
    .forEach((b, i) =>
      push(
        `pay_b_${pad(i, 4)}`,
        b.paid,
        b.startAt - DAY_MS,
        "booking",
        b.id,
        b.customerId
      )
    )
  memberships.slice(0, 120).forEach((m, i) => {
    const plan = PLANS.find((p) => p.id === m.planId)!
    push(
      `pay_m_${pad(i, 4)}`,
      plan.price,
      m.startedAt,
      "membership",
      m.id,
      m.customerId
    )
  })
  return out.sort((a, b) => b.at - a.at)
}

function buildInvoices(
  rng: Rng,
  branch: Branch,
  customers: Customer[]
): Invoice[] {
  return Array.from({ length: 34 }, (_, i) => {
    const issuedAt = demoNow() - rng.int(0, 120) * DAY_MS
    const amount = round(rng.int(8000, 320000), 100)
    const status = rng.weighted<Invoice["status"]>([
      ["paid", 52],
      ["sent", 22],
      ["overdue", 14],
      ["draft", 8],
      ["void", 4],
    ])
    return {
      id: `inv_${pad(i)}`,
      ref: `INV-${branch.initials}-${pad(2200 + i, 4)}`,
      customerId: rng.pick(customers).id,
      issuedAt,
      dueAt: issuedAt + 15 * DAY_MS,
      amount,
      paid:
        status === "paid"
          ? amount
          : status === "overdue"
            ? Math.round(amount * 0.4)
            : 0,
      status,
      kind: rng.weighted<Invoice["kind"]>([
        ["party", 46],
        ["corporate", 34],
        ["membership", 20],
      ]),
    }
  }).sort((a, b) => b.issuedAt - a.issuedAt)
}

function buildExpenses(rng: Rng, branch: Branch): Expense[] {
  return Array.from({ length: 48 }, (_, i) => {
    const head = rng.pick(EXPENSE_HEADS)
    return {
      id: `exp_${pad(i)}`,
      ref: `EX-${branch.initials}-${pad(700 + i, 4)}`,
      head: head.label,
      vendor: rng.pick(SUPPLIER_NAMES),
      amount: round(rng.int(2000, 260000), 100),
      at: demoNow() - rng.int(0, 90) * DAY_MS,
      scope: (rng.bool(0.72) ? "branch" : "corporate") as Expense["scope"],
      status: rng.weighted<Expense["status"]>([
        ["paid", 52],
        ["approved", 24],
        ["pending", 18],
        ["rejected", 6],
      ]),
      hue: head.hue as TagHue,
    }
  }).sort((a, b) => b.at - a.at)
}

function buildLedger(rng: Rng): LedgerEntry[] {
  let balance = 1_450_000
  return Array.from({ length: 60 }, (_, i) => {
    const credit = rng.bool(0.58) ? round(rng.int(3000, 180000), 100) : 0
    const debit = credit ? 0 : round(rng.int(2000, 140000), 100)
    balance += credit - debit
    return {
      id: `led_${pad(i)}`,
      at: demoNow() - i * rng.int(2, 9) * 3_600_000,
      account: rng.pick(LEDGER_ACCOUNTS),
      narration: rng.pick(LEDGER_ACCOUNTS),
      debit,
      credit,
      balance,
    }
  })
}

function buildCampaigns(rng: Rng): Campaign[] {
  const names: Bilingual[] = [
    { en: "Eid Play Festival", bn: "ঈদ প্লে ফেস্টিভ্যাল" },
    { en: "Winter Weekend Push", bn: "শীতের উইকএন্ড পুশ" },
    { en: "Lapsed Member Win-back", bn: "নিষ্ক্রিয় সদস্য ফিরিয়ে আনা" },
    { en: "Birthday Reminder Flow", bn: "জন্মদিন রিমাইন্ডার ফ্লো" },
    { en: "School Holiday Bundle", bn: "স্কুল ছুটির বান্ডল" },
    { en: "New Branch Launch", bn: "নতুন শাখা উদ্বোধন" },
    { en: "Day-care Awareness", bn: "ডে-কেয়ার সচেতনতা" },
    { en: "Referral Boost", bn: "রেফারেল বুস্ট" },
  ]
  return names.map((name, i) => {
    const audience = rng.int(1200, 28000)
    const sent = Math.round(audience * rng.float(0.8, 1))
    const delivered = Math.round(sent * rng.float(0.88, 0.99))
    const opened = Math.round(delivered * rng.float(0.2, 0.6))
    const converted = Math.round(opened * rng.float(0.04, 0.18))
    return {
      id: `cmp_${pad(i)}`,
      name,
      channel: rng.weighted<Campaign["channel"]>([
        ["sms", 46],
        ["email", 26],
        ["both", 28],
      ]),
      segment: rng.pick(SEGMENTS).label,
      audience,
      sent,
      delivered,
      opened,
      converted,
      revenue: converted * rng.int(450, 1800),
      startedAt: demoNow() - rng.int(0, 120) * DAY_MS,
      status: rng.weighted<Campaign["status"]>([
        ["done", 40],
        ["running", 26],
        ["scheduled", 16],
        ["draft", 12],
        ["paused", 6],
      ]),
      hue: HUES[i % HUES.length],
    }
  })
}

function buildTemplates(rng: Rng): MessageTemplate[] {
  const spec: {
    name: Bilingual
    channel: "sms" | "email"
    body: Bilingual
    vars: string[]
  }[] = [
    {
      name: { en: "Entry confirmation", bn: "প্রবেশ নিশ্চিতকরণ" },
      channel: "sms",
      body: {
        en: "Hi {guardian}, {child} entered {branch} at {time}. Band {code}.",
        bn: "প্রিয় {guardian}, {child} {time}-এ {branch}-এ প্রবেশ করেছে। ব্যান্ড {code}।",
      },
      vars: ["guardian", "child", "branch", "time", "code"],
    },
    {
      name: { en: "Exit & bill", bn: "প্রস্থান ও বিল" },
      channel: "sms",
      body: {
        en: "{child} played {minutes} min. Total ৳{amount}. Thank you!",
        bn: "{child} {minutes} মিনিট খেলেছে। মোট ৳{amount}। ধন্যবাদ!",
      },
      vars: ["child", "minutes", "amount"],
    },
    {
      name: { en: "Membership expiring", bn: "সদস্যপদের মেয়াদ শেষ" },
      channel: "sms",
      body: {
        en: "Your {plan} membership expires on {date}. Renew for 10% off.",
        bn: "আপনার {plan} সদস্যপদ {date} তারিখে শেষ হবে। ১০% ছাড়ে নবায়ন করুন।",
      },
      vars: ["plan", "date"],
    },
    {
      name: { en: "Birthday offer", bn: "জন্মদিনের অফার" },
      channel: "email",
      body: {
        en: "Happy birthday {child}! A free play hour is waiting at {branch}.",
        bn: "শুভ জন্মদিন {child}! {branch}-এ এক ঘণ্টা ফ্রি প্লে অপেক্ষা করছে।",
      },
      vars: ["child", "branch"],
    },
    {
      name: { en: "Party booking receipt", bn: "পার্টি বুকিং রসিদ" },
      channel: "email",
      body: {
        en: "Booking {ref} confirmed for {date}, {heads} guests.",
        bn: "বুকিং {ref} {date} তারিখে {heads} জনের জন্য নিশ্চিত।",
      },
      vars: ["ref", "date", "heads"],
    },
    {
      name: {
        en: "Day-care pickup reminder",
        bn: "ডে-কেয়ার পিকআপ রিমাইন্ডার",
      },
      channel: "sms",
      body: {
        en: "{child}'s day-care window ends in 15 minutes.",
        bn: "{child}-এর ডে-কেয়ার সময় ১৫ মিনিটে শেষ হচ্ছে।",
      },
      vars: ["child"],
    },
  ]
  return spec.map((s, i) => ({
    id: `tpl_${pad(i)}`,
    ...s,
    usedCount: rng.int(120, 24000),
    updatedAt: demoNow() - rng.int(1, 90) * DAY_MS,
  }))
}

function buildBatches(rng: Rng, templates: MessageTemplate[]): MessageBatch[] {
  return Array.from({ length: 26 }, (_, i) => {
    const tpl = rng.pick(templates)
    const audience = rng.int(200, 18000)
    const sent = Math.round(audience * rng.float(0.9, 1))
    const delivered = Math.round(sent * rng.float(0.9, 0.995))
    return {
      id: `bat_${pad(i)}`,
      ref: `MB-${pad(8800 + i, 4)}`,
      channel: tpl.channel,
      template: tpl.name,
      audience,
      sent,
      delivered,
      failed: sent - delivered,
      cost: tpl.channel === "sms" ? sent * 0.35 : sent * 0.05,
      at: demoNow() - rng.int(0, 45) * DAY_MS,
      status: rng.weighted<MessageBatch["status"]>([
        ["sent", 74],
        ["sending", 12],
        ["queued", 9],
        ["failed", 5],
      ]),
    }
  }).sort((a, b) => b.at - a.at)
}

function buildDevices(rng: Rng, branch: Branch): Device[] {
  const kinds: [DeviceKind, number][] = [
    ["pos", 4],
    ["printer", 4],
    ["drawer", 3],
    ["scanner", 4],
    ["nfc", 3],
    ["turnstile", 2],
    ["tablet", 3],
  ]
  const out: Device[] = []
  let n = 0
  for (const [kind, count] of kinds) {
    for (let i = 0; i < count; i++) {
      out.push({
        id: `dev_${pad(n)}`,
        code: `${branch.initials}-${kind.toUpperCase().slice(0, 3)}-${i + 1}`,
        kind,
        model: rng.pick(DEVICE_MODELS[kind]),
        location: rng.pick(DEVICE_LOCATIONS),
        state: rng.weighted<Device["state"]>([
          ["online", 82],
          ["degraded", 12],
          ["offline", 6],
        ]),
        lastSeen: demoNow() - rng.int(0, 240) * MIN,
        firmware: `${rng.int(1, 4)}.${rng.int(0, 9)}.${rng.int(0, 20)}`,
        battery:
          kind === "tablet" || kind === "scanner"
            ? rng.int(12, 100)
            : undefined,
      })
      n++
    }
  }
  return out
}

function buildIntegrations(rng: Rng): Integration[] {
  const spec: { name: string; category: Bilingual; note: Bilingual }[] = [
    {
      name: "SSLCommerz",
      category: { en: "Payment gateway", bn: "পেমেন্ট গেটওয়ে" },
      note: {
        en: "Card, net banking and mobile wallets.",
        bn: "কার্ড, নেট ব্যাংকিং ও মোবাইল ওয়ালেট।",
      },
    },
    {
      name: "RedDot Digital",
      category: { en: "Payment gateway", bn: "পেমেন্ট গেটওয়ে" },
      note: {
        en: "Secondary gateway for card settlement.",
        bn: "কার্ড সেটেলমেন্টের দ্বিতীয় গেটওয়ে।",
      },
    },
    {
      name: "bKash Merchant",
      category: { en: "Mobile wallet", bn: "মোবাইল ওয়ালেট" },
      note: { en: "Direct merchant API.", bn: "সরাসরি মার্চেন্ট এপিআই।" },
    },
    {
      name: "Nagad",
      category: { en: "Mobile wallet", bn: "মোবাইল ওয়ালেট" },
      note: { en: "Direct merchant API.", bn: "সরাসরি মার্চেন্ট এপিআই।" },
    },
    {
      name: "Rocket",
      category: { en: "Mobile wallet", bn: "মোবাইল ওয়ালেট" },
      note: { en: "DBBL mobile banking.", bn: "ডিবিবিএল মোবাইল ব্যাংকিং।" },
    },
    {
      name: "Alpha SMS",
      category: { en: "Bulk SMS", bn: "বাল্ক এসএমএস" },
      note: {
        en: "Masking and non-masking routes.",
        bn: "মাস্কিং ও নন-মাস্কিং রুট।",
      },
    },
    {
      name: "Amazon SES",
      category: { en: "Email", bn: "ইমেইল" },
      note: {
        en: "Transactional email delivery.",
        bn: "ট্রানজেকশনাল ইমেইল ডেলিভারি।",
      },
    },
    {
      name: "Tally Prime",
      category: { en: "Accounting", bn: "হিসাবরক্ষণ" },
      note: { en: "Nightly ledger export.", bn: "রাতে লেজার এক্সপোর্ট।" },
    },
    {
      name: "Google Analytics 4",
      category: { en: "Analytics", bn: "অ্যানালিটিকস" },
      note: { en: "Mother website funnels.", bn: "মূল ওয়েবসাইটের ফানেল।" },
    },
    {
      name: "Firebase Cloud Messaging",
      category: { en: "Push", bn: "পুশ" },
      note: { en: "App push notifications.", bn: "অ্যাপ পুশ নোটিফিকেশন।" },
    },
  ]
  return spec.map((s, i) => ({
    id: `int_${pad(i)}`,
    ...s,
    state: rng.weighted<Integration["state"]>([
      ["connected", 76],
      ["available", 16],
      ["error", 8],
    ]),
    lastSync: demoNow() - rng.int(1, 600) * MIN,
  }))
}

function buildAudit(rng: Rng, staff: Staff[], branch: Branch): AuditEntry[] {
  return Array.from({ length: 80 }, (_, i) => {
    const action = rng.pick(AUDIT_ACTIONS)
    return {
      id: `aud_${pad(i)}`,
      at: demoNow() - i * rng.int(4, 40) * MIN,
      actor: rng.pick(staff).name,
      action: action.label,
      target: `#${pad(rng.int(1000, 99999), 5)}`,
      scope: branch.name,
      ip: `103.${rng.int(1, 250)}.${rng.int(1, 250)}.${rng.int(1, 250)}`,
      hue: action.hue as TagHue,
    }
  })
}

function buildUsers(rng: Rng, branch: Branch, staff: Staff[]): AppUser[] {
  const roleIds: Role["id"][] = [
    "master",
    "operations",
    "branchManager",
    "frontDesk",
    "outletStaff",
    "accounts",
    "payroll",
  ]
  return staff.slice(0, 26).map((s, i) => ({
    id: `usr_${pad(i)}`,
    name: s.name,
    email: `${s.id}@liliputerdunia.com.bd`,
    roleId:
      i === 0
        ? "master"
        : i === 1
          ? "branchManager"
          : rng.pick(roleIds.slice(2)),
    branchIds: i < 2 ? BRANCHES.map((b) => b.id) : [branch.id],
    lastActive: demoNow() - rng.int(2, 4000) * MIN,
    status: rng.weighted<AppUser["status"]>([
      ["active", 86],
      ["invited", 9],
      ["disabled", 5],
    ]),
    twoFactor: rng.bool(0.58),
  }))
}

function buildSyncQueue(rng: Rng, branch: Branch): SyncQueueItem[] {
  return Array.from({ length: rng.int(4, 18) }, (_, i) => ({
    id: `syn_${pad(i)}`,
    kind: rng.weighted<SyncQueueItem["kind"]>([
      ["sale", 46],
      ["band", 28],
      ["payment", 18],
      ["attendance", 8],
    ]),
    ref: `${branch.initials}${pad(70000 + i, 5)}`,
    at: demoNow() - rng.int(2, 180) * MIN,
    amount: round(rng.int(150, 4200), 10),
  }))
}

/**
 * The 181-day series, offsets −90…+90, so index 90 is always today.
 * Footfall is the spine: revenue and dwell are derived from it, and the
 * future half carries a forecast with a confidence band.
 */
function buildSeries(rng: Rng, branch: Branch): SeriesPoint[] {
  const today = demoToday()
  const base =
    branch.kind === "flagship" ? 0.82 : branch.kind === "standard" ? 0.66 : 0.52
  const out: SeriesPoint[] = []
  for (let offset = -90; offset <= 90; offset++) {
    const date = addDays(today, offset)
    const dow = date.getUTCDay()
    // Friday and Saturday are the Bangladeshi weekend — the demand peak.
    const weekendLift = dow === 5 || dow === 6 ? 0.34 : dow === 4 ? 0.12 : 0
    const seasonal = Math.sin((offset + 30) / 28) * 0.06
    const drift = offset * 0.0006
    const noise = rng.around(0, 0.035)
    const load = clamp(
      base + weekendLift + seasonal + drift + noise,
      0.22,
      1.18
    )
    const footfall = Math.round(branch.capacity * 2.6 * load)
    const dwell = Math.round(74 + weekendLift * 40 + rng.around(0, 7))
    const spend = 520 + weekendLift * 180 + rng.around(0, 45)
    const point: SeriesPoint = {
      day: isoDay(date),
      label: `${date.getUTCDate()}/${date.getUTCMonth() + 1}`,
      offset,
      footfall,
      revenue: Math.round(footfall * spend),
      dwell,
      members: Math.round(footfall * rng.float(0.16, 0.3)),
    }
    if (offset > 0) {
      const spread = 0.04 + offset * 0.0035
      point.forecast = footfall
      point.lower = Math.round(footfall * (1 - spread))
      point.upper = Math.round(footfall * (1 + spread))
    }
    out.push(point)
  }
  return out
}

function buildAlerts(rng: Rng): AlertItem[] {
  return rng.shuffle([...ALERT_SPEC]).map((a, i) => ({
    id: `alr_${pad(i)}`,
    at: demoNow() - rng.int(5, 600) * MIN,
    ...a,
  }))
}

/* ================================================================ *
 * ENTRY POINT
 * ================================================================ */

export function generateDataset(branch: Branch): Dataset {
  // ONE rng threaded through every builder. The call order below is
  // load-bearing: reorder it and every dataset changes (deterministically).
  const rng = createRng(branch.slug)

  const zones = buildZones(branch)
  const customers = buildCustomers(rng, branch, Math.round(branch.capacity * 9))
  const children = buildChildren(rng, customers)
  const memberships = buildMemberships(rng, branch, customers)
  const vouchers = buildVouchers(rng)
  const staff = buildStaff(rng, branch, Math.round(branch.capacity * 0.34))
  const attendance = buildAttendance(rng, staff)
  const wristbands = buildWristbands(
    rng,
    branch,
    zones,
    children,
    staff,
    memberships
  )
  const sessions = buildSessions(rng, wristbands)
  const daycare = buildDaycare(rng, branch, children, staff)
  const outlets = buildOutlets(rng, branch)
  const products = buildProducts(rng, outlets)
  const sales = buildSales(rng, branch, outlets, products, customers, staff)
  const suppliers = buildSuppliers(rng)
  const inventory = buildInventory(rng, products, suppliers)
  const purchaseOrders = buildPurchaseOrders(rng, branch, suppliers)
  const transfers = buildTransfers(rng, branch)
  const bookings = buildBookings(rng, branch, customers, children)
  const payments = buildPayments(rng, sessions, sales, bookings, memberships)
  const invoices = buildInvoices(rng, branch, customers)
  const expenses = buildExpenses(rng, branch)
  const ledger = buildLedger(rng)
  const campaigns = buildCampaigns(rng)
  const templates = buildTemplates(rng)
  const batches = buildBatches(rng, templates)
  const devices = buildDevices(rng, branch)
  const integrations = buildIntegrations(rng)
  const audit = buildAudit(rng, staff, branch)
  const users = buildUsers(rng, branch, staff)
  const syncQueue = buildSyncQueue(rng, branch)
  const series = buildSeries(rng, branch)
  const alerts = buildAlerts(rng)

  return {
    branch,
    zones,
    slabs: SLABS,
    customers,
    children,
    plans: PLANS,
    memberships,
    vouchers,
    wristbands,
    sessions,
    daycare,
    staff,
    attendance,
    outlets,
    products,
    sales,
    inventory,
    suppliers,
    purchaseOrders,
    transfers,
    packages: PACKAGES,
    bookings,
    payments,
    invoices,
    expenses,
    ledger,
    campaigns,
    batches,
    templates,
    devices,
    integrations,
    audit,
    roles: ROLES,
    users,
    syncQueue,
    series,
    kpis: buildKpis(series),
    alerts,
  }
}

/* ================================================================ *
 * KPIs
 * ================================================================ */

export const SERIES_TODAY_INDEX = 90

export function buildKpis(series: SeriesPoint[]): KpiCard[] {
  const window = series.slice(SERIES_TODAY_INDEX - 29, SERIES_TODAY_INDEX + 1)
  const prior = series.slice(SERIES_TODAY_INDEX - 59, SERIES_TODAY_INDEX - 29)
  const sum = (rows: SeriesPoint[], key: keyof SeriesPoint) =>
    rows.reduce((s, r) => s + (r[key] as number), 0)
  const avg = (rows: SeriesPoint[], key: keyof SeriesPoint) =>
    sum(rows, key) / rows.length
  const delta = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0)

  const footfall = sum(window, "footfall")
  const revenue = sum(window, "revenue")
  const dwell = avg(window, "dwell")
  const members = sum(window, "members")

  return [
    {
      id: "footfall",
      labelKey: "dashboard.footfall",
      value: footfall,
      delta: delta(footfall, sum(prior, "footfall")),
      format: "number",
      spark: window.map((p) => p.footfall),
      hue: "blue",
    },
    {
      id: "revenue",
      labelKey: "dashboard.revenue",
      value: revenue,
      delta: delta(revenue, sum(prior, "revenue")),
      format: "money",
      spark: window.map((p) => p.revenue),
      hue: "amber",
    },
    {
      id: "dwell",
      labelKey: "dashboard.avgDwell",
      value: Math.round(dwell),
      delta: delta(dwell, avg(prior, "dwell")),
      format: "minutes",
      spark: window.map((p) => p.dwell),
      hue: "teal",
    },
    {
      id: "spend",
      labelKey: "dashboard.spendPerHead",
      value: Math.round(revenue / Math.max(1, footfall)),
      delta: delta(
        revenue / Math.max(1, footfall),
        sum(prior, "revenue") / Math.max(1, sum(prior, "footfall"))
      ),
      format: "money",
      spark: window.map((p) => Math.round(p.revenue / Math.max(1, p.footfall))),
      hue: "green",
    },
    {
      id: "members",
      labelKey: "dashboard.memberVisits",
      value: members,
      delta: delta(members, sum(prior, "members")),
      format: "number",
      spark: window.map((p) => p.members),
      hue: "magenta",
    },
  ]
}
