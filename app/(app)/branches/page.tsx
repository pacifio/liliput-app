"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"

import { BranchMap } from "@/components/charts/branch-map"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CapacityMeter } from "@/components/motion/capacity-meter"
import { Sparkline } from "@/components/motion/comb-chart"
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
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useBranchSummaries, type BranchSummary } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"

export default function BranchRollupPage() {
  const { t, locale, num, money, pct } = useLocale()
  const summaries = useBranchSummaries()
  const router = useRouter()
  const setBranchId = useUi((s) => s.setBranchId)
  const activeId = useUi((s) => s.branchId)
  const [query, setQuery] = React.useState("")

  const open = (id: string) => {
    setBranchId(id)
    router.push("/dashboard")
  }

  const footfall = summaries.reduce((sum, s) => sum + s.footfall, 0)
  const revenue = summaries.reduce((sum, s) => sum + s.revenue, 0)
  const live = summaries.filter((s) => s.branch.status === "live").length
  const capacity =
    summaries.reduce((sum, s) => sum + s.capacityUsed, 0) / summaries.length
  const members = summaries.reduce((sum, s) => sum + s.members, 0)

  const kpis: KpiCell[] = [
    {
      id: "footfall",
      label: t("branches.networkFootfall"),
      value: footfall,
      spark: summaries.map((s) => s.footfall),
      color: "var(--chart-1)",
    },
    {
      id: "revenue",
      label: t("branches.networkRevenue"),
      value: revenue,
      prefix: "৳",
      spark: summaries.map((s) => s.revenue),
      color: "var(--chart-2)",
    },
    {
      id: "live",
      label: t("branches.branchesLive"),
      value: live,
      suffix: `/${num(summaries.length)}`,
      color: "var(--chart-6)",
    },
    {
      id: "capacity",
      label: t("branches.avgCapacity"),
      value: Math.round(capacity * 100),
      suffix: "%",
      color: "var(--chart-4)",
    },
    {
      id: "members",
      label: t("dashboard.memberVisits"),
      value: members,
      color: "var(--chart-3)",
    },
  ]

  const ranked = [...summaries].sort((a, b) => b.revenue - a.revenue)

  const columns = React.useMemo<ColumnDef<BranchSummary, unknown>[]>(
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
                  {b.area[locale]} · {b.manager[locale]}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.branch.status,
        header: t("common.status"),
        cell: ({ row }) => {
          const s = row.original.branch.status
          return (
            <StatusTag
              hue={
                s === "live" ? "green" : s === "soft-launch" ? "amber" : "slate"
              }
              dot
            >
              {s === "live"
                ? t("branches.statusLive")
                : s === "soft-launch"
                  ? t("branches.statusSoftLaunch")
                  : t("branches.statusFitOut")}
            </StatusTag>
          )
        },
      },
      {
        accessorKey: "footfall",
        header: t("dashboard.footfall"),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Sparkline
              values={row.original.spark}
              color={HUE_VAR[row.original.branch.hue]}
              className="w-16 opacity-70"
            />
            <span className="nums w-10 text-right">
              {num(row.original.footfall)}
            </span>
          </div>
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
        accessorKey: "revenue",
        header: t("dashboard.revenue"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.revenue)}</span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "capacityUsed",
        header: t("branches.capacityUsed"),
        cell: ({ row }) => (
          <div className="w-24">
            <CapacityMeter
              value={row.original.onFloor}
              capacity={row.original.branch.capacity}
              hue={row.original.branch.hue}
            />
          </div>
        ),
      },
      {
        accessorKey: "dwell",
        header: t("dashboard.avgDwell"),
        cell: ({ row }) => num(row.original.dwell),
        meta: { align: "right" },
      },
      {
        accessorKey: "memberShare",
        header: t("branches.memberShare"),
        cell: ({ row }) => pct(row.original.memberShare * 100, 0),
        meta: { align: "right" },
      },
      {
        accessorKey: "alerts",
        header: t("dashboard.alerts"),
        cell: ({ row }) =>
          row.original.alerts ? (
            <StatusTag hue="rose">{num(row.original.alerts)}</StatusTag>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
    ],
    [t, locale, num, money, pct]
  )

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("branches.title")}
        subtitle={t("branches.subtitle", { count: num(summaries.length) })}
      />

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
          <Panel
            title={t("branches.map")}
            subtitle={t("branches.mapHint")}
            delay={0.05}
          >
            <BranchMap
              summaries={summaries}
              activeId={activeId}
              onSelect={open}
            />
          </Panel>

          <div className="flex flex-col gap-3">
            <Panel title={t("branches.topPerformers")} delay={0.1}>
              <ol className="flex flex-col">
                {ranked.slice(0, 5).map((row, index) => (
                  <RankRow
                    key={row.branch.id}
                    rank={index + 1}
                    summary={row}
                    onOpen={open}
                  />
                ))}
              </ol>
            </Panel>
            <Panel title={t("branches.needsAttention")} delay={0.15}>
              <ol className="flex flex-col">
                {ranked
                  .slice(-5)
                  .reverse()
                  .map((row, index) => (
                    <RankRow
                      key={row.branch.id}
                      rank={summaries.length - index}
                      summary={row}
                      onOpen={open}
                    />
                  ))}
              </ol>
            </Panel>
          </div>
        </div>

        <DataTable
          data={summaries}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.branch.id}
          onRowClick={(row) => open(row.branch.id)}
          emptyIcon={<Building2 />}
          pageSize={30}
          toolbar={
            <TableSearch
              value={query}
              onChange={setQuery}
              className="ml-auto"
            />
          }
        />
      </div>
    </ScrollFade>
  )
}

function RankRow({
  rank,
  summary,
  onOpen,
}: {
  rank: number
  summary: BranchSummary
  onOpen: (id: string) => void
}) {
  const { locale, num, money } = useLocale()
  return (
    <li className="border-b border-[var(--hairline)] last:border-0">
      <button
        onClick={() => onOpen(summary.branch.id)}
        className="flex w-full items-center gap-2.5 py-2 text-left"
      >
        <span className="nums w-4 shrink-0 text-[0.625rem] text-muted-foreground">
          {num(rank)}
        </span>
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded text-[0.5rem] font-semibold"
          style={{
            background: `color-mix(in oklch, ${HUE_VAR[summary.branch.hue]} 18%, transparent)`,
            color: HUE_VAR[summary.branch.hue],
          }}
        >
          {summary.branch.initials}
        </span>
        <span className="min-w-0 flex-1 truncate text-[0.6875rem]">
          {summary.branch.name[locale]}
        </span>
        <span className="nums shrink-0 text-[0.625rem] font-medium">
          {money(summary.revenue)}
        </span>
        <DeltaPill value={summary.delta} />
      </button>
    </li>
  )
}
