"use client"

import * as React from "react"

import { useMounted } from "@/hooks/use-mounted"
import { BRANCHES, getBranch } from "@/lib/branches"
import { useLocale } from "@/lib/i18n/provider"
import { ordersForBranch, useLive, type LiveOrder } from "@/lib/live"
import { generateDataset, SERIES_TODAY_INDEX } from "@/lib/mock/generate"
import { useUi } from "@/lib/store"
import type { Branch, Dataset } from "@/lib/types"

/**
 * Datasets are pure functions of the branch slug, so they can be cached
 * forever — switching back to a branch returns the identical data rather
 * than re-rolling it.
 */
const cache = new Map<string, Dataset>()

export function datasetFor(branch: Branch): Dataset {
  const hit = cache.get(branch.slug)
  if (hit) return hit
  const built = generateDataset(branch)
  cache.set(branch.slug, built)
  return built
}

/**
 * Lays the shop's orders over the generated dataset.
 *
 * Only the collections a customer can actually add to are touched, and the
 * new rows go to the front so they read as the most recent activity.
 */
function withLiveOrders(base: Dataset, orders: LiveOrder[]): Dataset {
  if (!orders.length) return base
  const bookings = orders.flatMap((o) => o.bookings)
  const sales = orders.flatMap((o) => o.sales)
  const memberships = orders.flatMap((o) => o.memberships)
  const payments = orders.map((o) => o.payment)
  const customers = orders.map((o) => o.customer)
  const audit = orders.flatMap((o) => o.audit)

  return {
    ...base,
    customers: [...customers, ...base.customers],
    bookings: [...bookings, ...base.bookings],
    sales: [...sales, ...base.sales],
    memberships: [...memberships, ...base.memberships],
    payments: [...payments, ...base.payments],
    audit: [...audit, ...base.audit],
  }
}

const DataContext = React.createContext<Dataset | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const branchId = useUi((s) => s.branchId)
  const orders = useLive((s) => s.orders)
  // The shop store rehydrates from localStorage after mount, so the overlay is
  // withheld until then: the server render and the first client render both
  // see the bare generated dataset and agree.
  const mounted = useMounted()

  const dataset = React.useMemo(() => {
    const base = datasetFor(getBranch(branchId))
    if (!mounted) return base
    return withLiveOrders(base, ordersForBranch(orders, branchId))
  }, [branchId, orders, mounted])

  return <DataContext.Provider value={dataset}>{children}</DataContext.Provider>
}

export function useDataset(): Dataset {
  const value = React.useContext(DataContext)
  if (!value) throw new Error("useDataset must be used inside <DataProvider>")
  return value
}

export function useBranch(): Branch {
  return useDataset().branch
}

export function useBranches() {
  const branchId = useUi((s) => s.branchId)
  const setBranchId = useUi((s) => s.setBranchId)
  return { branches: BRANCHES, branchId, setBranchId }
}

/** Money is BDT everywhere; only the numeral system follows the locale. */
export function useMoney() {
  const { money, compactMoney } = useLocale()
  return React.useMemo(
    () => ({
      currency: "BDT",
      symbol: "৳",
      format: money,
      compact: compactMoney,
    }),
    [money, compactMoney]
  )
}

/** Memoised id → entity maps, so screens never scan an array in a render. */
export function useLookups() {
  const data = useDataset()
  return React.useMemo(
    () => ({
      customer: new Map(data.customers.map((c) => [c.id, c])),
      child: new Map(data.children.map((c) => [c.id, c])),
      zone: new Map(data.zones.map((z) => [z.id, z])),
      slab: new Map(data.slabs.map((s) => [s.id, s])),
      staff: new Map(data.staff.map((s) => [s.id, s])),
      outlet: new Map(data.outlets.map((o) => [o.id, o])),
      product: new Map(data.products.map((p) => [p.id, p])),
      membership: new Map(data.memberships.map((m) => [m.id, m])),
      plan: new Map(data.plans.map((p) => [p.id, p])),
      supplier: new Map(data.suppliers.map((s) => [s.id, s])),
      device: new Map(data.devices.map((d) => [d.id, d])),
      payment: new Map(data.payments.map((p) => [p.id, p])),
      package: new Map(data.packages.map((p) => [p.id, p])),
      band: new Map(data.wristbands.map((b) => [b.id, b])),
      role: new Map(data.roles.map((r) => [r.id, r])),
      branch: new Map(BRANCHES.map((b) => [b.id, b])),
    }),
    [data]
  )
}

export type BranchSummary = {
  branch: Branch
  footfall: number
  revenue: number
  dwell: number
  members: number
  capacityUsed: number
  onFloor: number
  spark: number[]
  memberShare: number
  alerts: number
  delta: number
}

/**
 * The master-admin roll-up. Generating 30 datasets is expensive, so this is
 * memoised at module level and only the `/branches/*` screens call it —
 * every other screen stays on the single active branch.
 */
let rollupCache: BranchSummary[] | null = null

export function branchSummaries(): BranchSummary[] {
  if (rollupCache) return rollupCache
  rollupCache = BRANCHES.map((branch) => {
    const data = datasetFor(branch)
    const today = data.series[SERIES_TODAY_INDEX]
    // Compared against the same weekday a week ago, not yesterday: footfall
    // swings hard between weekdays and the Friday–Saturday weekend, so a
    // day-over-day delta mostly measures which day of the week it is.
    const lastWeek = data.series[SERIES_TODAY_INDEX - 7]
    const onFloor = data.wristbands.filter(
      (b) => b.status === "active" || b.status === "overstay"
    ).length
    return {
      branch,
      footfall: today.footfall,
      revenue: today.revenue,
      dwell: today.dwell,
      members: today.members,
      onFloor,
      capacityUsed: onFloor / branch.capacity,
      spark: data.series
        .slice(SERIES_TODAY_INDEX - 29, SERIES_TODAY_INDEX + 1)
        .map((p) => p.footfall),
      memberShare: today.members / Math.max(1, today.footfall),
      alerts: data.alerts.filter((a) => a.severity !== "info").length,
      delta: ((today.footfall - lastWeek.footfall) / lastWeek.footfall) * 100,
    }
  })
  return rollupCache
}

export function useBranchSummaries(): BranchSummary[] {
  return React.useMemo(() => branchSummaries(), [])
}
