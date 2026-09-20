"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Customer, Dataset } from "@/lib/types"

/**
 * The customer-facing account session — separate from `useLive` (cart, guest
 * checkout profile, placed orders) so signing out never touches the cart or
 * order history. Persisted the same way, so a signed-in demo stays signed in
 * across reloads until "Sign out" is used.
 */

export type AccountSession = {
  customerId: string
  name: string
  phone: string
  email: string
}

type AccountState = {
  session: AccountSession | null
  login: (session: AccountSession) => void
  logout: () => void
  updateProfile: (patch: Partial<Omit<AccountSession, "customerId">>) => void
}

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      session: null,
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
      updateProfile: (patch) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, ...patch } }
            : state
        ),
    }),
    { name: "liliput.account" }
  )
)

/**
 * Resolves a phone number against the dataset's customers the same way the
 * day-care desk resolves a guardian: strip everything but digits, match on
 * the last 6. `data.customers` already carries live shop customers layered
 * over the seeded ones, so this finds both a seeded VIP and a returning
 * guest who checked out before ever signing in.
 */
export function findSeededCustomer(
  phone: string,
  data: Dataset
): Customer | undefined {
  const needle = phone.replace(/\D/g, "")
  if (needle.length < 6) return undefined
  return data.customers.find((c) =>
    c.phone.replace(/\D/g, "").endsWith(needle.slice(-6))
  )
}
