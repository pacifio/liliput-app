import { DAY_MS, demoNow } from "@/lib/demo-time"
import type { CartLine, LiveOrder, ShopProfile } from "@/lib/live"
import type {
  AuditEntry,
  Bilingual,
  Booking,
  Customer,
  Dataset,
  Gateway,
  Membership,
  Payment,
  SaleLine,
  SaleOrder,
} from "@/lib/types"

/**
 * Turns a shop cart into the records the operator console reads.
 *
 * This is the whole bridge between the two halves of the demo: a visitor
 * checks out here, and the same transaction appears in /bookings, /payments,
 * /pos, /memberships and the revenue mix — because it is literally the same
 * shape the generator produces.
 */

const pad = (n: number, w = 4) => String(n).padStart(w, "0")

function rand(max: number) {
  return Math.floor(Math.random() * max)
}

function startOfDay(day: string) {
  return new Date(`${day}T00:00:00.000Z`).getTime()
}

/**
 * Play tickets have no time picker. Booked for today, the visit is assumed to
 * be imminent — the next full hour — so it shows up in the console's upcoming
 * list rather than looking like it was already missed. Booked ahead, it
 * defaults to late morning.
 */
function defaultHour(day: string, now: number) {
  const today = new Date(now).toISOString().slice(0, 10)
  if (day !== today) return 11
  return Math.min(21, new Date(now).getUTCHours() + 1)
}

function hex2() {
  return rand(256).toString(16).toUpperCase().padStart(2, "0")
}

/** "04 A2 7F 3B" — the format printed on a Liliputer membership card. */
export function newCardUid() {
  return [hex2(), hex2(), hex2(), hex2()].join(" ")
}

export function lineLabel(line: CartLine, data: Dataset): Bilingual {
  switch (line.kind) {
    case "ticket":
      return (
        data.slabs.find((s) => s.id === line.refId)?.name ?? {
          en: "Play ticket",
          bn: "প্লে টিকিট",
        }
      )
    case "membership":
      return (
        data.plans.find((p) => p.id === line.refId)?.name ?? {
          en: "Membership",
          bn: "সদস্যপদ",
        }
      )
    case "party":
      return (
        data.packages.find((p) => p.id === line.refId)?.name ?? {
          en: "Party package",
          bn: "পার্টি প্যাকেজ",
        }
      )
    case "product":
      return (
        data.products.find((p) => p.id === line.refId)?.name ?? {
          en: "Item",
          bn: "পণ্য",
        }
      )
  }
}

/** Party bookings take a 30% deposit; everything else is paid in full. */
export function linePayable(line: CartLine) {
  const gross = line.unitPrice * line.qty
  return line.kind === "party" ? Math.round(gross * 0.3) : gross
}

/** VAT is charged on retail goods only, not on play time or memberships. */
export const PRODUCT_VAT = 0.06

/**
 * One shop customer per phone number, keyed on its last 6 digits — the same
 * idiom the day-care desk uses to resolve a guardian by phone. Kept as its
 * own export so a signed-in account can resolve to the same id a checkout
 * would otherwise mint.
 */
export function deriveShopCustomerId(phone: string) {
  const digitsOnly = phone.replace(/\D/g, "")
  return `cus_shop_${digitsOnly.slice(-6) || "000000"}`
}

export function cartTotals(cart: CartLine[]) {
  const gross = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)
  const due = cart.reduce((sum, l) => sum + linePayable(l), 0)
  const productSubtotal = cart
    .filter((l) => l.kind === "product")
    .reduce((sum, l) => sum + l.unitPrice * l.qty, 0)
  const vat = Math.round(productSubtotal * PRODUCT_VAT)
  return { gross, vat, payable: due + vat, deposit: gross - due }
}

export function buildOrder({
  cart,
  data,
  profile,
  gateway,
  customerId: customerIdOverride,
}: {
  cart: CartLine[]
  data: Dataset
  profile: ShopProfile
  gateway: Gateway
  /**
   * When a customer is signed in, their session id carries over so a new
   * order joins their existing history instead of minting a fresh one keyed
   * off the phone number (which would only match for brand-new accounts).
   */
  customerId?: string
}): LiveOrder {
  const at = demoNow()
  const seq = rand(90000) + 10000
  const ref = `LD${seq}`
  const orderId = `ord_${seq}`
  const paymentId = `pay_shop_${seq}`
  const branch = data.branch

  // One customer record per device, keyed on the phone number, so a second
  // order from the same visitor does not create a second profile.
  const customerId = customerIdOverride ?? deriveShopCustomerId(profile.phone)
  const name: Bilingual = { en: profile.name, bn: profile.name }

  const bookings: Booking[] = []
  const memberships: Membership[] = []
  const productLines = cart.filter((l) => l.kind === "product")

  for (const line of cart) {
    if (line.kind === "product") continue

    const day = line.date ?? new Date(at).toISOString().slice(0, 10)
    const startAt =
      startOfDay(day) + (line.startHour ?? defaultHour(day, at)) * 3_600_000
    const gross = line.unitPrice * line.qty

    if (line.kind === "membership") {
      const plan = data.plans.find((p) => p.id === line.refId)
      if (!plan) continue
      for (let i = 0; i < line.qty; i++) {
        memberships.push({
          id: `mem_shop_${seq}_${i}`,
          cardUid: newCardUid(),
          customerId,
          planId: plan.id,
          tier:
            plan.id === "half-year"
              ? "platinum"
              : plan.id === "monthly"
                ? "gold"
                : "silver",
          startedAt: at,
          expiresAt: at + plan.days * DAY_MS,
          visitsUsed: 0,
          status: "active",
          autoRenew: false,
          branchId: branch.id,
        })
      }
    }

    const pkg =
      line.kind === "party"
        ? data.packages.find((p) => p.id === line.refId)
        : undefined

    bookings.push({
      id: `bkg_shop_${seq}_${bookings.length}`,
      ref: `${ref}-${bookings.length + 1}`,
      kind: line.kind,
      customerId,
      childIds: [],
      packageId: pkg?.id,
      date: day,
      startAt,
      endAt: startAt + (pkg ? pkg.hours : 2) * 3_600_000,
      heads: pkg ? pkg.heads : line.qty,
      amount: gross,
      paid: linePayable(line),
      // Bought on the customer app, not taken at the counter.
      channel: "app",
      status: "confirmed",
      paymentId,
    })
  }

  // Product lines become one sale per outlet, the way a real basket splits at
  // the till.
  const sales: SaleOrder[] = []
  const byOutlet = new Map<string, SaleLine[]>()
  for (const line of productLines) {
    const product = data.products.find((p) => p.id === line.refId)
    if (!product) continue
    const bucket = byOutlet.get(product.outletId) ?? []
    bucket.push({
      productId: product.id,
      qty: line.qty,
      price: line.unitPrice,
      total: line.unitPrice * line.qty,
    })
    byOutlet.set(product.outletId, bucket)
  }
  for (const [outletId, lines] of byOutlet) {
    const subtotal = lines.reduce((sum, l) => sum + l.total, 0)
    const vat = Math.round(subtotal * PRODUCT_VAT)
    sales.push({
      id: `sal_shop_${seq}_${sales.length}`,
      ref: `${branch.initials}${pad(seq, 5)}`,
      outletId,
      customerId,
      lines,
      subtotal,
      discount: 0,
      vat,
      total: subtotal + vat,
      at,
      cashierId: data.staff[0]?.id ?? "stf_000",
      paymentId,
      synced: true,
    })
  }

  const total = cartTotals(cart).payable

  const payment: Payment = {
    id: paymentId,
    txnId: `TXN${pad(rand(900000000) + 100000000, 9)}`,
    gateway,
    amount: total,
    fee: gateway === "cash" ? 0 : Math.round(total * 0.0185),
    at,
    status: "success",
    against: memberships.length
      ? "membership"
      : sales.length && !bookings.length
        ? "pos"
        : "booking",
    refId: orderId,
    customerId,
  }

  const customer: Customer = {
    id: customerId,
    name,
    phone: profile.phone,
    email: profile.email,
    area: branch.area,
    joinedAt: at,
    visits: 1,
    spend: total,
    points: Math.round(total / 50),
    segment: { en: "Online", bn: "অনলাইন" },
    segmentHue: "teal",
    source: "app",
    membershipId: memberships[0]?.id,
    consent: { sms: true, email: !!profile.email },
  }

  const audit: AuditEntry[] = [
    {
      id: `aud_shop_${seq}`,
      at,
      actor: name,
      action: { en: "Placed an online order", bn: "অনলাইন অর্ডার দিয়েছেন" },
      target: ref,
      scope: branch.name,
      ip: `103.${rand(250) + 1}.${rand(250) + 1}.${rand(250) + 1}`,
      hue: "teal",
    },
  ]

  return {
    id: orderId,
    ref,
    branchId: branch.id,
    at,
    gateway,
    total,
    profile,
    lines: cart,
    customer,
    bookings,
    sales,
    memberships,
    payment,
    audit,
  }
}
