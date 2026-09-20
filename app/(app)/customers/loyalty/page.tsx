"use client"

import { motion } from "motion/react"
import { Gift } from "lucide-react"

import { SplitBar } from "@/components/charts/split-bar"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"

const TIERS = ["platinum", "gold", "silver"] as const

export default function LoyaltyPage() {
  const { t, locale, num, money } = useLocale()
  const data = useDataset()
  const lookups = useLookups()

  const points = data.customers.reduce((sum, c) => sum + c.points, 0)
  const top = [...data.customers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 12)
  const redeemed = data.vouchers.reduce((sum, v) => sum + v.redeemed, 0)

  const tierCounts = TIERS.map((tier, i) => ({
    id: tier,
    label: tier,
    value: data.memberships.filter((m) => m.tier === tier).length,
    color: `var(--chart-${i + 1})`,
  }))

  const kpis: KpiCell[] = [
    {
      id: "points",
      label: t("customers.points"),
      value: points,
      color: "var(--chart-1)",
    },
    {
      id: "members",
      label: t("nav.members"),
      value: data.memberships.length,
      color: "var(--chart-2)",
    },
    {
      id: "redeemed",
      label: t("membership.redeemed"),
      value: redeemed,
      color: "var(--chart-6)",
    },
    {
      id: "avg",
      label: t("customers.points"),
      value: Math.round(points / Math.max(1, data.customers.length)),
      color: "var(--chart-3)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("customers.loyaltyTitle")}
        subtitle={t("customers.loyaltySubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1fr_1.3fr]">
          <Panel title={t("customers.tierBreakdown")} delay={0}>
            <SplitBar slices={tierCounts} />
            <ul className="mt-4 flex flex-col">
              {data.plans.map((plan) => {
                const holders = data.memberships.filter(
                  (m) => m.planId === plan.id
                )
                return (
                  <li
                    key={plan.id}
                    className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                  >
                    <StatusTag hue={plan.hue}>{plan.name[locale]}</StatusTag>
                    <span className="nums ml-auto text-[0.625rem] text-muted-foreground">
                      {num(holders.length)}
                    </span>
                    <span className="nums w-20 text-right text-[0.6875rem] font-medium">
                      {money(holders.length * plan.price)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Panel>

          <Panel
            title={t("customers.topEarners")}
            subtitle={t("customers.points")}
            delay={0.05}
          >
            <ul className="flex flex-col">
              {top.map((customer, index) => {
                const membership = customer.membershipId
                  ? lookups.membership.get(customer.membershipId)
                  : undefined
                return (
                  <motion.li
                    key={customer.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.025 }}
                    className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                  >
                    <span className="nums w-5 shrink-0 text-[0.625rem] text-muted-foreground">
                      {num(index + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.6875rem] font-medium">
                        {customer.name[locale]}
                      </p>
                      <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                        {num(customer.visits)} {t("customers.visits")} ·{" "}
                        {money(customer.spend)}
                      </p>
                    </div>
                    {membership ? (
                      <StatusTag hue="amber">
                        <span className="capitalize">{membership.tier}</span>
                      </StatusTag>
                    ) : null}
                    <span className="nums shrink-0 text-[0.6875rem] font-medium">
                      <Gift className="mr-1 inline size-2.5 text-muted-foreground" />
                      {num(customer.points)}
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
