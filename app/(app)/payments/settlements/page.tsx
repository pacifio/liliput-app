"use client"

import { motion } from "motion/react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { DAY_MS, demoNow } from "@/lib/demo-time"
import { GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { Gateway } from "@/lib/types"

/** T+N settlement cycles, as the gateways actually publish them. */
const CYCLE: Partial<Record<Gateway, number>> = {
  sslcommerz: 2,
  reddot: 3,
  bkash: 1,
  nagad: 1,
  rocket: 2,
  card: 3,
}

export default function SettlementsPage() {
  const { t, locale, num, money, date, relative } = useLocale()
  const data = useDataset()

  const rows = (Object.keys(CYCLE) as Gateway[]).map((gateway) => {
    const payments = data.payments.filter(
      (p) => p.gateway === gateway && p.status === "success"
    )
    const gross = payments.reduce((sum, p) => sum + p.amount, 0)
    const fees = payments.reduce((sum, p) => sum + p.fee, 0)
    const cycle = CYCLE[gateway] ?? 2
    const cutoff = demoNow() - cycle * DAY_MS
    const pending = payments
      .filter((p) => p.at > cutoff)
      .reduce((sum, p) => sum + p.amount - p.fee, 0)
    // bKash is deliberately late here — the alert feed refers to it.
    const late = gateway === "bkash"
    return {
      gateway,
      cycle,
      gross,
      fees,
      net: gross - fees,
      pending,
      nextAt: demoNow() + (cycle - 1) * DAY_MS,
      late,
    }
  })

  const pending = rows.reduce((sum, r) => sum + r.pending, 0)
  const net = rows.reduce((sum, r) => sum + r.net, 0)

  const kpis: KpiCell[] = [
    {
      id: "net",
      label: t("payments.net"),
      value: net,
      prefix: "৳",
      color: "var(--chart-1)",
    },
    {
      id: "pending",
      label: t("payments.pendingAmount"),
      value: pending,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "fees",
      label: t("payments.fee"),
      value: rows.reduce((sum, r) => sum + r.fees, 0),
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "late",
      label: t("dashboard.alerts"),
      value: rows.filter((r) => r.late).length,
      color: "var(--chart-7)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("payments.settlementsTitle")}
        subtitle={t("payments.settlementsSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, index) => (
            <motion.div
              key={row.gateway}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.05 }}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">
                    {GATEWAY_LABEL[row.gateway][locale]}
                  </p>
                  <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                    {t("payments.settlementCycle")} T+{num(row.cycle)}
                  </p>
                </div>
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: HUE_VAR[GATEWAY_HUE[row.gateway]] }}
                />
              </div>

              <p className="figure text-[1.75rem] leading-none">
                {money(row.pending)}
              </p>
              <p className="-mt-2 text-[0.625rem] text-muted-foreground">
                {t("payments.pendingAmount")}
              </p>

              <dl className="grid grid-cols-2 gap-2 border-t border-[var(--hairline)] pt-2 text-[0.5625rem]">
                <div>
                  <dt className="text-muted-foreground">
                    {t("payments.volume")}
                  </dt>
                  <dd className="nums font-medium">{money(row.gross)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("payments.net")}</dt>
                  <dd className="nums font-medium">{money(row.net)}</dd>
                </div>
              </dl>

              <div className="flex items-center gap-2">
                <StatusTag hue={row.late ? "rose" : "green"} dot>
                  {row.late ? t("dashboard.alerts") : t("common.success")}
                </StatusTag>
                <span className="nums ml-auto text-[0.5625rem] text-muted-foreground">
                  {t("payments.nextSettlement")} · {date(row.nextAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <Panel title={t("activity.title")} delay={0.25}>
          <ul className="flex flex-col">
            {data.payments.slice(0, 12).map((payment) => (
              <li
                key={payment.id}
                className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
              >
                <StatusTag hue={GATEWAY_HUE[payment.gateway]}>
                  {GATEWAY_LABEL[payment.gateway][locale]}
                </StatusTag>
                <span className="nums min-w-0 flex-1 truncate font-mono text-[0.5625rem] text-muted-foreground">
                  {payment.txnId}
                </span>
                <span className="nums shrink-0 text-[0.5625rem] text-muted-foreground">
                  {relative(payment.at)}
                </span>
                <span className="nums shrink-0 text-[0.6875rem] font-medium">
                  {money(payment.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </ScrollFade>
  )
}
