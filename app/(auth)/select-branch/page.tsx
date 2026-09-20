"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { LayoutGrid, Search } from "lucide-react"

import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { BRANCHES } from "@/lib/branches"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"

export default function SelectBranchPage() {
  const { t, locale, num } = useLocale()
  const router = useRouter()
  const setBranchId = useUi((s) => s.setBranchId)
  const [query, setQuery] = React.useState("")

  const rows = BRANCHES.filter((branch) => {
    if (!query.trim()) return true
    const needle = query.toLowerCase()
    return (
      branch.name.en.toLowerCase().includes(needle) ||
      branch.name.bn.includes(query) ||
      branch.area.en.toLowerCase().includes(needle) ||
      branch.area.bn.includes(query)
    )
  })

  const open = (id: string) => {
    setBranchId(id)
    router.push("/dashboard")
  }

  return (
    <div className="flex max-h-[80svh] w-full flex-col gap-3">
      <div>
        <h1 className="text-xl font-medium tracking-tight">
          {t("auth.selectBranch")}
        </h1>
        <p className="mt-1 text-[0.6875rem] text-muted-foreground">
          {t("auth.selectBranchSubtitle", { count: num(BRANCHES.length) })}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("common.search")}
          className="h-8 w-full rounded-md border border-border bg-card pr-2.5 pl-7 text-[0.6875rem] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <ScrollFade className="min-h-0 flex-1" fade={20}>
        <ul className="flex flex-col gap-1 pr-0.5">
          {rows.map((branch, index) => (
            <motion.li
              key={branch.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 14) * 0.02 }}
            >
              <button
                onClick={() => open(branch.id)}
                className="flex w-full items-center gap-2.5 rounded-lg bg-card p-2.5 text-left ring-1 ring-foreground/[0.06] transition-colors hover:bg-muted/50"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-[0.5625rem] font-semibold"
                  style={{
                    background: `color-mix(in oklch, ${HUE_VAR[branch.hue]} 18%, transparent)`,
                    color: HUE_VAR[branch.hue],
                  }}
                >
                  {branch.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.6875rem] font-medium">
                    {branch.name[locale]}
                  </p>
                  <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                    {branch.area[locale]} · {num(branch.capacity)}
                  </p>
                </div>
                {branch.status !== "live" ? (
                  <StatusTag hue="amber">
                    {branch.status === "soft-launch"
                      ? t("branches.statusSoftLaunch")
                      : t("branches.statusFitOut")}
                  </StatusTag>
                ) : null}
              </button>
            </motion.li>
          ))}
        </ul>
      </ScrollFade>

      <button
        onClick={() => router.push("/branches")}
        className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-[0.6875rem] text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <LayoutGrid className="size-3" />
        {t("auth.openRollup")}
      </button>
    </div>
  )
}
