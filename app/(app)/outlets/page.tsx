"use client"

import { motion } from "motion/react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { SplitBar } from "@/components/charts/split-bar"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { lowStock, outletTotals } from "@/lib/derive"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

export default function OutletsPage() {
  const { t, locale, num, money, pct } = useLocale()
  const data = useDataset()
  const totals = outletTotals(data)
  const low = lowStock(data)

  const revenue = totals.reduce((sum, r) => sum + r.revenue, 0)
  const orders = totals.reduce((sum, r) => sum + r.orders, 0)
  const items = totals.reduce((sum, r) => sum + r.items, 0)
  const cost = data.sales.reduce(
    (sum, s) =>
      sum +
      s.lines.reduce(
        (n, l) =>
          n +
          (data.products.find((p) => p.id === l.productId)?.cost ?? 0) * l.qty,
        0
      ),
    0
  )
  const grossRevenue = data.sales.reduce((sum, s) => sum + s.total, 0)

  const kpis: KpiCell[] = [
    {
      id: "revenue",
      label: t("pos.todaySales"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-1)",
    },
    {
      id: "orders",
      label: t("nav.pos"),
      value: orders,
      color: "var(--chart-2)",
    },
    {
      id: "items",
      label: t("pos.itemsSold"),
      value: items,
      color: "var(--chart-3)",
    },
    {
      id: "basket",
      label: t("pos.basketSize"),
      value: Math.round(revenue / Math.max(1, orders)),
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "margin",
      label: t("pos.margin"),
      value: Math.round(
        ((grossRevenue - cost) / Math.max(1, grossRevenue)) * 100
      ),
      suffix: "%",
      color: "var(--chart-6)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("pos.outletsTitle")}
        subtitle={t("pos.outletsSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {totals.map(({ outlet, orders, revenue, items }, index) => {
            const products = data.products.filter(
              (p) => p.outletId === outlet.id
            )
            const lowHere = low.filter((i) => i.outletId === outlet.id)
            return (
              <motion.div
                key={outlet.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.05 }}
                className="flex flex-col gap-3 overflow-hidden rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {outlet.name[locale]}
                    </p>
                    <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                      {outlet.terminalId}
                    </p>
                  </div>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: HUE_VAR[outlet.hue] }}
                  />
                </div>
                <p className="figure text-[1.75rem] leading-none">
                  {money(revenue)}
                </p>
                <CombChart
                  values={Array.from({ length: 24 }, (_, i) =>
                    Math.max(
                      1,
                      Math.round(
                        orders * (0.4 + Math.sin(i / 3) * 0.3 + i / 40)
                      )
                    )
                  )}
                  height={28}
                  color={HUE_VAR[outlet.hue]}
                  glow={false}
                />
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[0.5625rem]">
                  <Cell label={t("nav.pos")} value={num(orders)} />
                  <Cell label={t("pos.itemsSold")} value={num(items)} />
                  <Cell label={t("nav.stock")} value={num(products.length)} />
                  <Cell
                    label={t("inventory.lowStock")}
                    value={num(lowHere.length)}
                  />
                </dl>
                {lowHere.length ? (
                  <StatusTag hue="amber" dot>
                    {t("inventory.lowStock")} · {num(lowHere.length)}
                  </StatusTag>
                ) : (
                  <StatusTag hue="green" dot>
                    {t("inventory.healthy")}
                  </StatusTag>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title={t("dashboard.revenueMix")} delay={0.2}>
            <SplitBar
              money
              slices={totals.map((row, i) => ({
                id: row.outlet.id,
                label: row.outlet.name[locale],
                value: row.revenue,
                color: `var(--chart-${i + 1})`,
              }))}
            />
          </Panel>
          <Panel title={t("dashboard.topOutlets")} delay={0.25}>
            <ul className="flex flex-col">
              {[...totals]
                .sort((a, b) => b.revenue - a.revenue)
                .map((row) => (
                  <li
                    key={row.outlet.id}
                    className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                  >
                    <span className="min-w-0 flex-1 truncate text-[0.6875rem]">
                      {row.outlet.name[locale]}
                    </span>
                    <span className="nums shrink-0 text-[0.625rem] text-muted-foreground">
                      {pct((row.revenue / Math.max(1, revenue)) * 100, 0)}
                    </span>
                    <span className="nums shrink-0 text-[0.6875rem] font-medium">
                      {money(row.revenue)}
                    </span>
                  </li>
                ))}
            </ul>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-muted-foreground">{label}</dt>
      <dd className="nums truncate font-medium">{value}</dd>
    </div>
  )
}
