"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check, Eye, Minus, Pencil } from "lucide-react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { TranslationKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const MODULES: { key: string; labelKey: TranslationKey }[] = [
  { key: "gate", labelKey: "nav.access" },
  { key: "memberships", labelKey: "nav.membership" },
  { key: "daycare", labelKey: "nav.daycare" },
  { key: "bookings", labelKey: "nav.bookings" },
  { key: "pos", labelKey: "nav.pos" },
  { key: "inventory", labelKey: "nav.inventory" },
  { key: "customers", labelKey: "nav.customers" },
  { key: "branches", labelKey: "nav.network" },
  { key: "messaging", labelKey: "nav.messaging" },
  { key: "payments", labelKey: "nav.payments" },
  { key: "finance", labelKey: "nav.money" },
  { key: "staff", labelKey: "nav.staff" },
  { key: "admin", labelKey: "nav.administration" },
]

type Grant = "full" | "write" | "read" | "none"

const ORDER: Grant[] = ["none", "read", "write", "full"]

export default function RolesPage() {
  const { t, locale, num } = useLocale()
  const data = useDataset()

  // Editable in the demo: clicking a cell cycles the grant, so a tender panel
  // can see the matrix respond rather than reading a static table.
  const [overrides, setOverrides] = React.useState<
    Record<string, Record<string, Grant>>
  >({})

  const grantOf = (roleId: string, module: string): Grant =>
    overrides[roleId]?.[module] ??
    (data.roles.find((r) => r.id === roleId)?.grants[module] as Grant) ??
    "none"

  const cycle = (roleId: string, module: string) => {
    const current = grantOf(roleId, module)
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]
    setOverrides((state) => ({
      ...state,
      [roleId]: { ...state[roleId], [module]: next },
    }))
  }

  const label: Record<Grant, string> = {
    full: t("admin.permissionFull"),
    write: t("admin.permissionWrite"),
    read: t("admin.permissionRead"),
    none: t("admin.permissionNone"),
  }

  const tone: Record<Grant, string> = {
    full: "var(--success)",
    write: "var(--chart-1)",
    read: "var(--muted-foreground)",
    none: "var(--muted-foreground)",
  }

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("admin.rolesTitle")}
        subtitle={t("admin.rolesSubtitle")}
      />

      <div className="grid gap-3 px-5 pb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: index * 0.04 }}
              className="flex flex-col gap-2 rounded-xl bg-card p-3.5 ring-1 ring-foreground/10"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[0.6875rem] font-medium">
                  {role.name[locale]}
                </p>
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: HUE_VAR[role.hue] }}
                />
              </div>
              <p className="text-[0.5625rem] leading-relaxed text-muted-foreground">
                {role.description[locale]}
              </p>
              <StatusTag hue={role.hue} className="mt-auto">
                {t("admin.userCount", { count: num(role.users) })}
              </StatusTag>
            </motion.div>
          ))}
        </div>

        <Panel
          title={t("admin.rolesTitle")}
          subtitle={t("admin.module")}
          delay={0.2}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th className="micro sticky left-0 bg-card px-2 py-2 text-left">
                    {t("admin.module")}
                  </th>
                  {data.roles.map((role) => (
                    <th
                      key={role.id}
                      className="micro px-2 py-2 text-center whitespace-nowrap"
                    >
                      {role.name[locale]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((module) => (
                  <tr key={module.key}>
                    <td className="sticky left-0 border-b border-[var(--hairline)] bg-card px-2 py-1.5 text-[0.6875rem] whitespace-nowrap">
                      {t(module.labelKey)}
                    </td>
                    {data.roles.map((role) => {
                      const grant = grantOf(role.id, module.key)
                      return (
                        <td
                          key={role.id}
                          className="border-b border-[var(--hairline)] px-1 py-1.5 text-center"
                        >
                          <button
                            onClick={() => cycle(role.id, module.key)}
                            title={label[grant]}
                            className={cn(
                              "mx-auto flex h-5 w-full max-w-[4.5rem] items-center justify-center gap-1 rounded text-[0.5625rem] transition-colors",
                              grant === "none"
                                ? "bg-muted/50"
                                : "bg-[color-mix(in_oklch,currentColor_12%,transparent)]"
                            )}
                            style={{ color: tone[grant] }}
                          >
                            {grant === "full" ? (
                              <Check className="size-2.5" />
                            ) : grant === "write" ? (
                              <Pencil className="size-2.5" />
                            ) : grant === "read" ? (
                              <Eye className="size-2.5" />
                            ) : (
                              <Minus className="size-2.5" />
                            )}
                            {label[grant]}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </ScrollFade>
  )
}
