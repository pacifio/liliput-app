import { demoNow, demoToday } from "@/lib/demo-time"
import { SERIES_TODAY_INDEX } from "@/lib/mock/generate"
import type { Dataset, Wristband } from "@/lib/types"

/** Bands physically on the play floor right now. */
export function onFloor(data: Dataset): Wristband[] {
  return data.wristbands.filter(
    (b) => b.status === "active" || b.status === "overstay"
  )
}

export function zoneHeadcount(data: Dataset): Map<string, number> {
  const map = new Map<string, number>(data.zones.map((z) => [z.id, 0]))
  for (const band of onFloor(data)) {
    map.set(band.zoneId, (map.get(band.zoneId) ?? 0) + 1)
  }
  return map
}

export function todayPoint(data: Dataset) {
  return data.series[SERIES_TODAY_INDEX]
}

/** Revenue split by stream for the current trading day. */
export function revenueStreams(data: Dataset) {
  const since = demoToday().getTime()
  const tickets = data.sessions
    .filter((s) => s.exitAt >= since)
    .reduce((sum, s) => sum + s.total, 0)
  const outlets = data.sales
    .filter((s) => s.at >= since)
    .reduce((sum, s) => sum + s.total, 0)
  const membership = data.memberships
    .filter((m) => m.startedAt >= since)
    .reduce(
      (sum, m) => sum + (data.plans.find((p) => p.id === m.planId)?.price ?? 0),
      0
    )
  const daycare = data.daycare
    .filter((d) => d.checkInAt >= since)
    .reduce((sum, d) => sum + d.total, 0)
  const parties = data.bookings
    .filter((b) => b.kind === "party" && b.startAt >= since)
    .reduce((sum, b) => sum + b.paid, 0)
  return { tickets, outlets, membership, daycare, parties }
}

export function outletTotals(data: Dataset) {
  const since = demoToday().getTime()
  return data.outlets.map((outlet) => {
    const sales = data.sales.filter(
      (s) => s.outletId === outlet.id && s.at >= since
    )
    return {
      outlet,
      orders: sales.length,
      revenue: sales.reduce((sum, s) => sum + s.total, 0),
      items: sales.reduce(
        (sum, s) => sum + s.lines.reduce((n, l) => n + l.qty, 0),
        0
      ),
    }
  })
}

export function lowStock(data: Dataset) {
  return data.inventory.filter((item) => item.onHand <= item.reorderAt)
}

export function inCare(data: Dataset) {
  return data.daycare.filter((d) => d.status !== "released")
}

export function expiringMemberships(data: Dataset) {
  return data.memberships.filter((m) => m.status === "expiring")
}

/** Minutes a band has been on the floor, measured against the demo clock. */
export function liveMinutes(band: Wristband) {
  if (band.exitAt) return band.minutes
  return Math.max(0, Math.round((demoNow() - band.entryAt) / 60_000))
}

export function sessionCharge(
  band: Wristband,
  data: Dataset,
  minutes = liveMinutes(band)
) {
  const slab = data.slabs.find((s) => s.id === band.slabId) ?? data.slabs[0]
  const over = Math.max(0, minutes - slab.includedMinutes)
  const blocks = Math.ceil(over / slab.overtimeBlock)
  const overtime = blocks * slab.overtimePrice
  const membership = band.membershipId
    ? data.memberships.find((m) => m.id === band.membershipId)
    : undefined
  const plan = membership
    ? data.plans.find((p) => p.id === membership.planId)
    : undefined
  const discount = plan
    ? Math.round(((slab.basePrice + overtime) * plan.discountPct) / 100)
    : 0
  return {
    slab,
    minutes,
    over,
    blocks,
    overtime,
    discount,
    plan,
    total: slab.basePrice + overtime - discount,
  }
}
