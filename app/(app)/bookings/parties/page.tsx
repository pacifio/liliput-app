"use client"

import { motion } from "motion/react"
import { Check, PartyPopper } from "lucide-react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

export default function PartyPackagesPage() {
  const { t, locale, num, money, date } = useLocale()
  const data = useDataset()
  const lookups = useLookups()

  const parties = data.bookings.filter((b) => b.kind === "party")
  const revenue = parties.reduce((sum, b) => sum + b.amount, 0)

  const kpis: KpiCell[] = [
    {
      id: "packages",
      label: t("bookings.partiesTitle"),
      value: data.packages.length,
      color: "var(--chart-1)",
    },
    {
      id: "booked",
      label: t("nav.bookings"),
      value: parties.length,
      color: "var(--chart-2)",
    },
    {
      id: "revenue",
      label: t("finance.streamParties"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "heads",
      label: t("bookings.heads"),
      value: parties.reduce((sum, b) => sum + b.heads, 0),
      color: "var(--chart-6)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("bookings.partiesTitle")}
        subtitle={t("bookings.partiesSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-3">
          {data.packages.map((pkg, index) => {
            const booked = parties.filter((b) => b.packageId === pkg.id)
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
              >
                <div className="h-1" style={{ background: HUE_VAR[pkg.hue] }} />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium">{pkg.name[locale]}</p>
                      <p className="nums text-[0.625rem] text-muted-foreground">
                        {t("bookings.upToHeads", { count: num(pkg.heads) })} ·{" "}
                        {t("bookings.forHours", { count: num(pkg.hours) })}
                      </p>
                    </div>
                    <StatusTag hue={pkg.hue}>{num(booked.length)}</StatusTag>
                  </div>
                  <p className="figure text-[2rem] leading-none">
                    {money(pkg.price)}
                  </p>
                  <p className="micro">{t("bookings.includes")}</p>
                  <ul className="flex flex-col gap-1">
                    {pkg.includes.map((item) => (
                      <li
                        key={item.en}
                        className="flex items-start gap-1.5 text-[0.6875rem]"
                      >
                        <Check className="mt-px size-3 shrink-0 text-[var(--success)]" />
                        {item[locale]}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="mt-auto">
                    <PartyPopper />
                    {t("bookings.newTitle")}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>

        <Panel
          title={t("nav.bookings")}
          subtitle={t("bookings.kindParty")}
          delay={0.2}
        >
          <ul className="flex flex-col">
            {parties.slice(0, 12).map((booking) => {
              const pkg = booking.packageId
                ? lookups.package.get(booking.packageId)
                : undefined
              return (
                <li
                  key={booking.id}
                  className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <span className="nums w-20 shrink-0 text-[0.625rem] text-muted-foreground">
                    {date(booking.startAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.6875rem] font-medium">
                      {lookups.customer.get(booking.customerId)?.name[locale]}
                    </p>
                    <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                      {booking.ref} · {num(booking.heads)} {t("bookings.heads")}
                    </p>
                  </div>
                  {pkg ? (
                    <StatusTag hue={pkg.hue}>{pkg.name[locale]}</StatusTag>
                  ) : null}
                  <span className="nums shrink-0 text-[0.625rem] font-medium">
                    {money(booking.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </ScrollFade>
  )
}
