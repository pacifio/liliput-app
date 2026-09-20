"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type {
  AuditEntry,
  Booking,
  Customer,
  Gateway,
  Membership,
  Payment,
  SaleOrder,
} from "@/lib/types"

/**
 * Orders placed from the customer shop.
 *
 * The generated dataset is a pure function of the branch slug and must stay
 * that way — it is what makes the demo identical on every open. Anything a
 * visitor actually does in the shop lives here instead, and `DataProvider`
 * lays it over the generated dataset. Every console screen then picks the new
 * rows up through `useDataset()` without knowing the shop exists.
 */

export type CartKind = "ticket" | "membership" | "party" | "product"

export type CartLine = {
  id: string
  kind: CartKind
  /** slabId | planId | packageId | productId, resolved against the dataset. */
  refId: string
  qty: number
  /** Price snapshot, so a line keeps what it cost when it was added. */
  unitPrice: number
  /** ISO day, for ticket and party lines. */
  date?: string
  /** Start hour, for party lines. */
  startHour?: number
}

export type ShopProfile = {
  name: string
  phone: string
  email: string
}

export type LiveOrder = {
  id: string
  ref: string
  branchId: string
  at: number
  gateway: Gateway
  total: number
  profile: ShopProfile
  lines: CartLine[]
  /** The console-shaped records this order contributed. */
  customer: Customer
  bookings: Booking[]
  sales: SaleOrder[]
  memberships: Membership[]
  payment: Payment
  audit: AuditEntry[]
}

type LiveState = {
  cart: CartLine[]
  profile: ShopProfile
  orders: LiveOrder[]

  addLine: (line: Omit<CartLine, "id">) => void
  setQty: (id: string, qty: number) => void
  removeLine: (id: string) => void
  clearCart: () => void

  setProfile: (profile: Partial<ShopProfile>) => void
  placeOrder: (order: LiveOrder) => void
  reset: () => void
}

const EMPTY_PROFILE: ShopProfile = { name: "", phone: "", email: "" }

function lineKey(line: Omit<CartLine, "id">) {
  return [line.kind, line.refId, line.date ?? "", line.startHour ?? ""].join(
    "|"
  )
}

export const useLive = create<LiveState>()(
  persist(
    (set) => ({
      cart: [],
      profile: EMPTY_PROFILE,
      orders: [],

      addLine: (line) =>
        set((state) => {
          // Adding the same thing twice bumps the quantity rather than
          // stacking a second identical row.
          const key = lineKey(line)
          const existing = state.cart.find((l) => lineKey(l) === key)
          if (existing) {
            return {
              cart: state.cart.map((l) =>
                l.id === existing.id ? { ...l, qty: l.qty + line.qty } : l
              ),
            }
          }
          return {
            cart: [
              ...state.cart,
              { ...line, id: `ln_${Math.random().toString(36).slice(2, 10)}` },
            ],
          }
        }),

      setQty: (id, qty) =>
        set((state) => ({
          cart:
            qty <= 0
              ? state.cart.filter((l) => l.id !== id)
              : state.cart.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),

      removeLine: (id) =>
        set((state) => ({ cart: state.cart.filter((l) => l.id !== id) })),

      clearCart: () => set({ cart: [] }),

      setProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),

      placeOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders], cart: [] })),

      reset: () => set({ cart: [], orders: [], profile: EMPTY_PROFILE }),
    }),
    { name: "liliput.shop" }
  )
)

/** The orders belonging to one branch, newest first. */
export function ordersForBranch(orders: LiveOrder[], branchId: string) {
  return orders.filter((order) => order.branchId === branchId)
}
