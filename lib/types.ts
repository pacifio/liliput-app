/**
 * The whole domain model for the Liliputer Dunia console.
 *
 * Two conventions run through every entity below:
 *   - every user-visible string is `Bilingual` and rendered as `value[locale]`
 *   - every categorical field carries a `TagHue` so colour is data, not CSS
 */

export type Bilingual = { en: string; bn: string }

export type TagHue =
  "blue" | "teal" | "green" | "purple" | "magenta" | "amber" | "rose" | "slate"

/* ================================================================ *
 * BRANCHES
 * ================================================================ */

export type BranchKind = "flagship" | "standard" | "compact"

export type Branch = {
  id: string
  slug: string
  name: Bilingual
  area: Bilingual
  kind: BranchKind
  /** Simultaneous children the play floor is licensed for. */
  capacity: number
  floorArea: number
  openedAt: string
  manager: Bilingual
  phone: string
  hue: TagHue
  initials: string
  status: "live" | "soft-launch" | "fit-out"
  /** Normalised 0..1 position on the Dhaka dot map. */
  map: { x: number; y: number }
}

/* ================================================================ *
 * ACCESS — zones, wristbands, play sessions
 * ================================================================ */

export type Zone = {
  id: string
  name: Bilingual
  capacity: number
  ageBand: Bilingual
  minAge: number
  maxAge: number
  hue: TagHue
  supervised: boolean
}

export type BandStatus = "active" | "exited" | "overstay" | "lost"

export type Wristband = {
  id: string
  /** Printed on the band and encoded in its QR. */
  code: string
  childId: string
  guardianId: string
  zoneId: string
  slabId: string
  membershipId?: string
  entryAt: number
  exitAt?: number
  /** Minutes on the floor. Live for active bands, frozen on exit. */
  minutes: number
  status: BandStatus
  gate: Bilingual
  operatorId: string
}

/** A pricing slab: a free window then per-block overtime. */
export type Slab = {
  id: string
  name: Bilingual
  includedMinutes: number
  basePrice: number
  overtimeBlock: number
  overtimePrice: number
  hue: TagHue
}

export type PlaySession = {
  id: string
  bandId: string
  childId: string
  guardianId: string
  zoneId: string
  slabId: string
  entryAt: number
  exitAt: number
  minutes: number
  basePrice: number
  overtime: number
  discount: number
  total: number
  paymentId?: string
}

/* ================================================================ *
 * MEMBERSHIP — NFC cards
 * ================================================================ */

export type PlanId = "weekly" | "monthly" | "half-year"

export type Plan = {
  id: PlanId
  name: Bilingual
  days: number
  visits: number
  price: number
  discountPct: number
  perks: Bilingual[]
  hue: TagHue
}

export type MembershipTier = "silver" | "gold" | "platinum"

export type MembershipStatus = "active" | "expiring" | "expired" | "suspended"

export type Membership = {
  id: string
  /** Printed on the NFC card, e.g. "04 A2 7F 3B". */
  cardUid: string
  customerId: string
  planId: PlanId
  tier: MembershipTier
  startedAt: number
  expiresAt: number
  visitsUsed: number
  status: MembershipStatus
  autoRenew: boolean
  branchId: string
}

export type Voucher = {
  id: string
  code: string
  label: Bilingual
  kind: "percent" | "flat" | "free-hour"
  value: number
  issued: number
  redeemed: number
  expiresAt: number
  status: "active" | "paused" | "expired"
  hue: TagHue
}

/* ================================================================ *
 * PEOPLE — customers, children, staff
 * ================================================================ */

export type Customer = {
  id: string
  name: Bilingual
  phone: string
  email: string
  area: Bilingual
  joinedAt: number
  visits: number
  spend: number
  points: number
  segment: Bilingual
  segmentHue: TagHue
  source: "website" | "app" | "walk-in" | "referral"
  membershipId?: string
  consent: { sms: boolean; email: boolean }
}

export type Child = {
  id: string
  name: Bilingual
  guardianId: string
  age: number
  gender: "boy" | "girl"
  allergies: Bilingual[]
  notes?: Bilingual
  /** Stable seed for the generated avatar. */
  avatarSeed: number
}

export type Department =
  | "floor"
  | "daycare"
  | "frontDesk"
  | "outlet"
  | "kitchen"
  | "maintenance"
  | "admin"

export type Staff = {
  id: string
  name: Bilingual
  role: Bilingual
  department: Department
  phone: string
  joinedAt: number
  salary: number
  shift: "morning" | "evening" | "split"
  status: "active" | "leave" | "probation"
  hue: TagHue
  certified: boolean
}

export type Attendance = {
  id: string
  staffId: string
  day: string
  inAt?: number
  outAt?: number
  state: "present" | "late" | "absent" | "leave" | "holiday"
  hours: number
}

/* ================================================================ *
 * DAY-CARE
 * ================================================================ */

export type DaycareStay = {
  id: string
  childId: string
  guardianId: string
  caregiverId: string
  checkInAt: number
  checkOutAt?: number
  limitMinutes: number
  minutes: number
  ratePerHour: number
  total: number
  status: "in-care" | "released" | "overdue"
  notes?: Bilingual
  meals: number
}

/* ================================================================ *
 * COMMERCE — outlets, products, sales, inventory
 * ================================================================ */

export type OutletKind = "toys" | "books" | "cosmetics" | "food"

export type Outlet = {
  id: string
  name: Bilingual
  kind: OutletKind
  hue: TagHue
  terminalId: string
  staffCount: number
}

export type Product = {
  id: string
  sku: string
  name: Bilingual
  outletId: string
  category: Bilingual
  price: number
  cost: number
  stock: number
  reorderAt: number
  vatPct: number
  hue: TagHue
}

export type SaleLine = {
  productId: string
  qty: number
  price: number
  total: number
}

export type SaleOrder = {
  id: string
  ref: string
  outletId: string
  customerId?: string
  membershipId?: string
  lines: SaleLine[]
  subtotal: number
  discount: number
  vat: number
  total: number
  at: number
  cashierId: string
  paymentId: string
  synced: boolean
}

export type InventoryItem = {
  id: string
  sku: string
  name: Bilingual
  category: Bilingual
  outletId: string
  onHand: number
  reserved: number
  reorderAt: number
  unit: Bilingual
  unitCost: number
  supplierId: string
  updatedAt: number
  hue: TagHue
}

export type Supplier = {
  id: string
  name: Bilingual
  contact: Bilingual
  phone: string
  category: Bilingual
  terms: Bilingual
  rating: number
  outstanding: number
  since: number
}

export type PurchaseOrder = {
  id: string
  ref: string
  supplierId: string
  placedAt: number
  expectedAt: number
  items: number
  total: number
  status: "draft" | "sent" | "partial" | "received" | "cancelled"
}

export type StockTransfer = {
  id: string
  ref: string
  fromBranchId: string
  toBranchId: string
  items: number
  value: number
  raisedAt: number
  status: "requested" | "in-transit" | "received" | "rejected"
}

/* ================================================================ *
 * BOOKINGS — website / app
 * ================================================================ */

export type PartyPackage = {
  id: string
  name: Bilingual
  heads: number
  hours: number
  price: number
  includes: Bilingual[]
  hue: TagHue
}

export type BookingKind = "ticket" | "party" | "daycare" | "membership"

export type Booking = {
  id: string
  ref: string
  kind: BookingKind
  customerId: string
  childIds: string[]
  packageId?: string
  date: string
  startAt: number
  endAt: number
  heads: number
  amount: number
  paid: number
  channel: "website" | "app" | "phone" | "counter"
  status: "pending" | "confirmed" | "checked-in" | "completed" | "cancelled"
  paymentId?: string
  note?: Bilingual
}

/* ================================================================ *
 * MONEY
 * ================================================================ */

export type Gateway =
  "sslcommerz" | "reddot" | "bkash" | "nagad" | "rocket" | "card" | "cash"

export type Payment = {
  id: string
  txnId: string
  gateway: Gateway
  amount: number
  fee: number
  at: number
  status: "success" | "pending" | "failed" | "refunded"
  against: "ticket" | "pos" | "booking" | "membership" | "daycare"
  refId: string
  customerId?: string
}

export type Invoice = {
  id: string
  ref: string
  customerId: string
  issuedAt: number
  dueAt: number
  amount: number
  paid: number
  status: "draft" | "sent" | "paid" | "overdue" | "void"
  kind: "corporate" | "party" | "membership"
}

export type Expense = {
  id: string
  ref: string
  head: Bilingual
  vendor: Bilingual
  amount: number
  at: number
  scope: "branch" | "corporate"
  approvedBy?: string
  status: "pending" | "approved" | "paid" | "rejected"
  hue: TagHue
}

export type LedgerEntry = {
  id: string
  at: number
  account: Bilingual
  narration: Bilingual
  debit: number
  credit: number
  balance: number
}

/* ================================================================ *
 * COMMUNICATIONS
 * ================================================================ */

export type Campaign = {
  id: string
  name: Bilingual
  channel: "sms" | "email" | "both"
  segment: Bilingual
  audience: number
  sent: number
  delivered: number
  opened: number
  converted: number
  revenue: number
  startedAt: number
  status: "draft" | "scheduled" | "running" | "done" | "paused"
  hue: TagHue
}

export type MessageBatch = {
  id: string
  ref: string
  channel: "sms" | "email"
  template: Bilingual
  audience: number
  sent: number
  delivered: number
  failed: number
  cost: number
  at: number
  status: "queued" | "sending" | "sent" | "failed"
}

export type MessageTemplate = {
  id: string
  name: Bilingual
  channel: "sms" | "email"
  body: Bilingual
  vars: string[]
  usedCount: number
  updatedAt: number
}

/* ================================================================ *
 * PLATFORM — devices, roles, audit, offline queue
 * ================================================================ */

export type DeviceKind =
  "pos" | "printer" | "drawer" | "scanner" | "nfc" | "turnstile" | "tablet"

export type Device = {
  id: string
  code: string
  kind: DeviceKind
  model: string
  location: Bilingual
  state: "online" | "degraded" | "offline"
  lastSeen: number
  firmware: string
  battery?: number
}

export type Integration = {
  id: string
  name: string
  category: Bilingual
  state: "connected" | "error" | "available"
  lastSync: number
  note: Bilingual
}

export type AuditEntry = {
  id: string
  at: number
  actor: Bilingual
  action: Bilingual
  target: string
  scope: Bilingual
  ip: string
  hue: TagHue
}

export type RoleId =
  | "master"
  | "operations"
  | "branchManager"
  | "frontDesk"
  | "outletStaff"
  | "accounts"
  | "payroll"

export type Role = {
  id: RoleId
  name: Bilingual
  description: Bilingual
  users: number
  hue: TagHue
  /** module key → permission level */
  grants: Record<string, "full" | "write" | "read" | "none">
}

export type AppUser = {
  id: string
  name: Bilingual
  email: string
  roleId: RoleId
  branchIds: string[]
  lastActive: number
  status: "active" | "invited" | "disabled"
  twoFactor: boolean
}

export type SyncQueueItem = {
  id: string
  kind: "sale" | "band" | "payment" | "attendance"
  ref: string
  at: number
  amount?: number
}

/* ================================================================ *
 * METRICS
 * ================================================================ */

export type SeriesPoint = {
  day: string
  label: string
  offset: number
  footfall: number
  revenue: number
  dwell: number
  members: number
  forecast?: number
  lower?: number
  upper?: number
}

export type KpiCard = {
  id: string
  labelKey: string
  value: number
  delta: number
  format?: "money" | "number" | "percent" | "minutes"
  spark: number[]
  hue: TagHue
}

export type AlertItem = {
  id: string
  at: number
  severity: "info" | "warning" | "critical"
  title: Bilingual
  detail: Bilingual
  module: Bilingual
}

/* ================================================================ *
 * DATASET
 * ================================================================ */

export type Dataset = {
  branch: Branch
  zones: Zone[]
  slabs: Slab[]
  customers: Customer[]
  children: Child[]
  plans: Plan[]
  memberships: Membership[]
  vouchers: Voucher[]
  wristbands: Wristband[]
  sessions: PlaySession[]
  daycare: DaycareStay[]
  staff: Staff[]
  attendance: Attendance[]
  outlets: Outlet[]
  products: Product[]
  sales: SaleOrder[]
  inventory: InventoryItem[]
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  transfers: StockTransfer[]
  packages: PartyPackage[]
  bookings: Booking[]
  payments: Payment[]
  invoices: Invoice[]
  expenses: Expense[]
  ledger: LedgerEntry[]
  campaigns: Campaign[]
  batches: MessageBatch[]
  templates: MessageTemplate[]
  devices: Device[]
  integrations: Integration[]
  audit: AuditEntry[]
  roles: Role[]
  users: AppUser[]
  syncQueue: SyncQueueItem[]
  series: SeriesPoint[]
  kpis: KpiCard[]
  alerts: AlertItem[]
}
