"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

export default function PlansPage() {
  const { t, locale, num, money, pct } = useLocale()
  const data = useDataset()

  const stats = data.plans.map((plan) => {
    const holders = data.memberships.filter((m) => m.planId === plan.id)
    return {
      plan,
      holders: holders.length,
      revenue: holders.length * plan.price,
      renewals: holders.filter((m) => m.autoRenew).length,
      share: holders.length / Math.max(1, data.memberships.length),
    }
  })

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("membership.plansTitle")}
        subtitle={t("membership.plansSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <div className="grid gap-3 lg:grid-cols-3">
          {stats.map(({ plan, holders, revenue, renewals, share }, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
            >
              <div
                className="h-1 w-full"
                style={{ background: HUE_VAR[plan.hue] }}
              />
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">{plan.name[locale]}</p>
                    <p className="nums text-[0.625rem] text-muted-foreground">
                      {num(plan.days)} {t("range.days")} · {num(plan.visits)}{" "}
                      {t("membership.visits")}
                    </p>
                  </div>
                  <StatusTag hue={plan.hue}>
                    {t("membership.discountOnOutlets", {
                      pct: num(plan.discountPct),
                    })}
                  </StatusTag>
                </div>

                <p className="figure text-[2rem] leading-none">
                  {money(plan.price)}
                </p>

                <ul className="flex flex-col gap-1">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk.en}
                      className="flex items-start gap-1.5 text-[0.6875rem]"
                    >
                      <Check className="mt-px size-3 shrink-0 text-[var(--success)]" />
                      {perk[locale]}
                    </li>
                  ))}
                </ul>

                <div className="mt-1 grid grid-cols-3 gap-2 border-t border-[var(--hairline)] pt-3">
                  <Stat label={t("nav.members")} value={num(holders)} />
                  <Stat label={t("common.total")} value={money(revenue)} />
                  <Stat
                    label={t("membership.autoRenew")}
                    value={pct((renewals / Math.max(1, holders)) * 100, 0)}
                  />
                </div>

                <Button size="sm" className="mt-1">
                  {t("membership.sell")}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <Panel
          title={t("customers.tierBreakdown")}
          subtitle={t("membership.plansSubtitle")}
          delay={0.2}
        >
          <div className="flex flex-col gap-3">
            {stats.map(({ plan, holders, share }) => (
              <div key={plan.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-[0.6875rem]">
                  {plan.name[locale]}
                </span>
                <div className="min-w-0 flex-1">
                  <CombChart
                    values={Array.from({ length: 30 }, (_, i) =>
                      Math.round(
                        holders * (0.6 + Math.sin(i / 4) * 0.2 + i / 90)
                      )
                    )}
                    height={26}
                    color={HUE_VAR[plan.hue]}
                    glow={false}
                  />
                </div>
                <span className="nums w-14 shrink-0 text-right text-[0.6875rem] font-medium">
                  {pct(share * 100, 0)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </ScrollFade>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[0.5625rem] text-muted-foreground">{label}</p>
      <p className="nums truncate text-[0.6875rem] font-medium">{value}</p>
    </div>
  )
}
