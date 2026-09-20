"use client"

import * as React from "react"
import { Target } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import { CapacityMeter } from "@/components/motion/capacity-meter"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import {
  DeltaPill,
  KpiStrip,
  type KpiCell,
} from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { useBranchSummaries, type BranchSummary } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

/**
 * Targets are derived from capacity rather than stored: a branch's monthly
 * number is what its licensed floor can reasonably turn over, so the whole
 * table stays consistent when a branch is resized.
 */
function targetFor(row: BranchSummary) {
  const daily = row.branch.capacity * 2.4
  const factor =
    row.branch.kind === "flagship"
      ? 1.08
      : row.branch.kind === "standard"
        ? 1
        : 0.92
  return {
    footfall: Math.round(daily * 30 * factor),
    revenue: Math.round(daily * 30 * factor * 560),
  }
}

export default function TargetsPage() {
  const { t, locale, num, money, pct } = useLocale()
  const summaries = useBranchSummaries()
  const [query, setQuery] = React.useState("")

  const rows = summaries.map((row) => {
    const target = targetFor(row)
    const achievedFootfall = row.footfall * 30
    const achievedRevenue = row.revenue * 30
    return {
      ...row,
      target,
      achievedFootfall,
      achievedRevenue,
      attainment: achievedRevenue / target.revenue,
    }
  })

  const totalTarget = rows.reduce((sum, r) => sum + r.target.revenue, 0)
  const totalAchieved = rows.reduce((sum, r) => sum + r.achievedRevenue, 0)
  const onTrack = rows.filter((r) => r.attainment >= 1).length

  const kpis: KpiCell[] = [
    {
      id: "target",
      label: t("branches.target"),
      value: totalTarget,
      prefix: "৳",
      color: "var(--chart-3)",
    },
    {
      id: "achieved",
      label: t("branches.achieved"),
      value: totalAchieved,
      prefix: "৳",
      color: "var(--chart-1)",
    },
    {
      id: "attainment",
      label: t("branches.attainment"),
      value: Math.round((totalAchieved / Math.max(1, totalTarget)) * 100),
      suffix: "%",
      color: "var(--chart-2)",
    },
    {
      id: "onTrack",
      label: t("branches.topPerformers"),
      value: onTrack,
      suffix: `/${num(rows.length)}`,
      color: "var(--chart-6)",
    },
  ]

  type Row = (typeof rows)[number]

  const columns = React.useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        id: "branch",
        accessorFn: (row) => `${row.branch.name.en} ${row.branch.name.bn}`,
        header: t("common.branch"),
        cell: ({ row }) => {
          const b = row.original.branch
          return (
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded text-[0.5rem] font-semibold"
                style={{
                  background: `color-mix(in oklch, ${HUE_VAR[b.hue]} 18%, transparent)`,
                  color: HUE_VAR[b.hue],
                }}
              >
                {b.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{b.name[locale]}</p>
                <p className="truncate text-[0.5625rem] text-muted-foreground">
                  {b.area[locale]}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        id: "targetRevenue",
        accessorFn: (row) => row.target.revenue,
        header: t("branches.target"),
        cell: ({ row }) => money(row.original.target.revenue),
        meta: { align: "right" },
      },
      {
        accessorKey: "achievedRevenue",
        header: t("branches.achieved"),
        cell: ({ row }) => (
          <span className="font-medium">
            {money(row.original.achievedRevenue)}
          </span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "attainment",
        header: t("branches.attainment"),
        cell: ({ row }) => (
          <div className="w-28">
            <CapacityMeter
              value={Math.round(row.original.attainment * 100)}
              capacity={100}
              hue={row.original.attainment >= 1 ? "green" : "amber"}
              sublabel={pct(row.original.attainment * 100, 0)}
            />
          </div>
        ),
      },
      {
        id: "targetFootfall",
        accessorFn: (row) => row.target.footfall,
        header: t("dashboard.footfall"),
        cell: ({ row }) => (
          <span className="nums">
            {num(row.original.achievedFootfall)} /{" "}
            {num(row.original.target.footfall)}
          </span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "delta",
        header: t("common.vsLastWeek"),
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DeltaPill value={row.original.delta} />
          </div>
        ),
        meta: { align: "right" },
      },
      {
        id: "verdict",
        accessorFn: (row) => row.attainment,
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={row.original.attainment >= 1 ? "green" : "amber"} dot>
            {row.original.attainment >= 1
              ? t("branches.topPerformers")
              : t("branches.needsAttention")}
          </StatusTag>
        ),
      },
    ],
    [t, locale, num, money, pct]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("branches.targetsTitle")}
        subtitle={t("branches.targetsSubtitle")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.branch.id}
          emptyIcon={<Target />}
          pageSize={30}
          className="min-h-0 flex-1"
          toolbar={
            <TableSearch
              value={query}
              onChange={setQuery}
              className="ml-auto"
            />
          }
        />
      </div>
    </div>
  )
}
