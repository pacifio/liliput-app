"use client"

import * as React from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DEFAULT_BRANCH_ID } from "@/lib/branches"
import {
  DEFAULT_REPORT_RANGE,
  resolveRange,
  type ReportRange,
} from "@/lib/report-range"

export const UI_SCALE_MIN = 0.9
export const UI_SCALE_MAX = 1.4
export const UI_SCALE_STEP = 0.05

export const UI_SCALE_PRESETS = [
  { value: 0.9, labelKey: "shell.scaleCompact" },
  { value: 1, labelKey: "shell.scaleDefault" },
  { value: 1.15, labelKey: "shell.scaleLarge" },
  { value: 1.3, labelKey: "shell.scaleLarger" },
] as const

type UiState = {
  /** The branch every screen is scoped to. */
  branchId: string
  setBranchId: (id: string) => void

  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void

  commandOpen: boolean
  setCommandOpen: (value: boolean) => void

  /** Root font-size multiplier driving --ui-scale. */
  uiScale: number
  setUiScale: (value: number) => void

  /** Global reporting window, driven by the top-bar date range picker. */
  reportRange: ReportRange
  setReportRange: (range: ReportRange) => void

  /** Whether the customer shop renders as a website or inside a phone frame. */
  shopView: "web" | "phone"
  setShopView: (value: "web" | "phone") => void

  /**
   * Simulated loss of connectivity. Gate and POS keep working against local
   * state; completed transactions pile up in `syncQueue` until it clears.
   */
  offlineMode: boolean
  setOfflineMode: (value: boolean) => void
  syncQueue: number
  enqueueSync: (count?: number) => void
  drainSync: () => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      branchId: DEFAULT_BRANCH_ID,
      setBranchId: (branchId) => set({ branchId }),

      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),

      uiScale: 1,
      setUiScale: (uiScale) =>
        set({
          uiScale: Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, uiScale)),
        }),

      // Deliberately not persisted: an absolute range saved today would be
      // stale and confusing the next time the demo is opened.
      reportRange: DEFAULT_REPORT_RANGE,
      setReportRange: (reportRange) => set({ reportRange }),

      shopView: "web",
      setShopView: (shopView) => set({ shopView }),

      offlineMode: false,
      setOfflineMode: (offlineMode) =>
        set(offlineMode ? { offlineMode } : { offlineMode, syncQueue: 0 }),
      syncQueue: 0,
      enqueueSync: (count = 1) =>
        set((state) => ({ syncQueue: state.syncQueue + count })),
      drainSync: () => set({ syncQueue: 0 }),
    }),
    {
      name: "liliput.ui",
      partialize: (state) => ({
        branchId: state.branchId,
        sidebarCollapsed: state.sidebarCollapsed,
        uiScale: state.uiScale,
        shopView: state.shopView,
      }),
    }
  )
)

/**
 * The reporting window with presets resolved against the current day. Always
 * use this rather than reading `reportRange` straight off the store.
 */
export function useReportRange(): ReportRange {
  const stored = useUi((state) => state.reportRange)
  return React.useMemo(() => resolveRange(stored), [stored])
}
