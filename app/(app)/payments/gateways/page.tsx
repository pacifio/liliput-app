"use client"

import { motion } from "motion/react"

import { SplitBar } from "@/components/charts/split-bar"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { Gateway } from "@/lib/types"

const ONLINE: Gateway[] = [
  "sslcommerz",
  "reddot",
  "bkash",
  "nagad",
  "rocket",
  "card",
]

export default function GatewaysPage() {
  const { t, locale, num, money, pct, relative } = useLocale()
  const data = useDataset()

  const stats = ONLINE.map((gateway) => {
    const rows = data.payments.filter((p) => p.gateway === gateway)
    const ok = rows.filter((p) => p.status === "success")
    return {
      gateway,
      count: rows.length,
      volume: ok.reduce((sum, p) => sum + p.amount, 0),
      fees: ok.reduce((sum, p) => sum + p.fee, 0),
      successRate: ok.length / Math.max(1, rows.length),
      integration: data.integrations.find((i) =>
        i.name
          .toLowerCase()
          .includes(gateway === "card" ? "sslcommerz" : gateway)
      ),
    }
  })

  const volume = stats.reduce((sum, s) => sum + s.volume, 0)
  const fees = stats.reduce((sum, s) => sum + s.fees, 0)

  const kpis: KpiCell[] = [
    {
      id: "volume",
      label: t("payments.volume"),
      value: volume,
      prefix: "৳",
      color: "var(--chart-1)",
    },
    {
      id: "fees",
      label: t("payments.fee"),
      value: fees,
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "gateways",
      label: t("payments.gatewaysTitle"),
      value: stats.filter((s) => s.integration?.state === "connected").length,
      suffix: `/${num(stats.length)}`,
      color: "var(--chart-6)",
    },
    {
      id: "rate",
      label: t("payments.successRate"),
      value:
        Math.round(
          (stats.reduce((sum, s) => sum + s.successRate, 0) / stats.length) *
            1000
        ) / 10,
      suffix: "%",
      color: "var(--chart-3)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("payments.gatewaysTitle")}
        subtitle={t("payments.gatewaysSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((row, index) => (
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
                  <p className="truncate text-[0.5625rem] text-muted-foreground">
                    {row.integration?.category[locale]}
                  </p>
                </div>
                <StatusTag
                  hue={
                    row.integration?.state === "connected"
                      ? "green"
                      : row.integration?.state === "error"
                        ? "rose"
                        : "slate"
                  }
                  dot
                >
                  {row.integration?.state === "connected"
                    ? t("admin.connected")
                    : row.integration?.state === "error"
                      ? t("admin.error")
                      : t("admin.available")}
                </StatusTag>
              </div>

              <p className="figure text-[1.75rem] leading-none">
                {money(row.volume)}
              </p>

              <CombChart
                values={Array.from({ length: 24 }, (_, i) =>
                  Math.max(
                    1,
                    Math.round(
                      row.count * (0.4 + Math.sin(i / 3.5) * 0.3 + i / 50)
                    )
                  )
                )}
                height={26}
                color={HUE_VAR[GATEWAY_HUE[row.gateway]]}
                glow={false}
              />

              <dl className="grid grid-cols-3 gap-2 text-[0.5625rem]">
                <div>
                  <dt className="text-muted-foreground">
                    {t("payments.title")}
                  </dt>
                  <dd className="nums font-medium">{num(row.count)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("payments.fee")}</dt>
                  <dd className="nums font-medium">{money(row.fees)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("payments.successRate")}
                  </dt>
                  <dd className="nums font-medium">
                    {pct(row.successRate * 100, 1)}
                  </dd>
                </div>
              </dl>

              {row.integration ? (
                <p className="border-t border-[var(--hairline)] pt-2 text-[0.5625rem] text-muted-foreground">
                  {t("admin.lastSync")} · {relative(row.integration.lastSync)}
                </p>
              ) : null}
            </motion.div>
          ))}
        </div>

        <Panel title={t("payments.volume")} delay={0.25}>
          <SplitBar
            money
            slices={stats.map((row) => ({
              id: row.gateway,
              label: GATEWAY_LABEL[row.gateway][locale],
              value: row.volume,
              color: HUE_VAR[GATEWAY_HUE[row.gateway]],
            }))}
          />
        </Panel>
      </div>
    </ScrollFade>
  )
}
