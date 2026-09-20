"use client"

import * as React from "react"
import { Banknote, Check, Plus } from "lucide-react"
import { toast } from "sonner"

import { SplitBar } from "@/components/charts/split-bar"
import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { Expense, TagHue } from "@/lib/types"

const HUE: Record<Expense["status"], TagHue> = {
  pending: "amber",
  approved: "blue",
  paid: "green",
  rejected: "rose",
}

const FILTERS = ["all", "branch", "corporate"] as const

export default function ExpensesPage() {
  const { t, locale, num, money, date, digits } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")
  const [scope, setScope] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(
    () =>
      scope === "all"
        ? data.expenses
        : data.expenses.filter((e) => e.scope === scope),
    [data.expenses, scope]
  )

  const total = data.expenses
    .filter((e) => e.status !== "rejected")
    .reduce((sum, e) => sum + e.amount, 0)
  const pending = data.expenses.filter((e) => e.status === "pending")

  const byHead = [
    ...new Map(
      data.expenses.map((e) => [e.head.en, { head: e.head, hue: e.hue }])
    ).values(),
  ].map((entry) => ({
    id: entry.head.en,
    label: entry.head[locale],
    value: data.expenses
      .filter((e) => e.head.en === entry.head.en && e.status !== "rejected")
      .reduce((sum, e) => sum + e.amount, 0),
    color: HUE_VAR[entry.hue],
  }))

  const kpis: KpiCell[] = [
    {
      id: "total",
      label: t("finance.totalExpense"),
      value: total,
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "count",
      label: t("finance.expensesTitle"),
      value: data.expenses.length,
      color: "var(--chart-1)",
    },
    {
      id: "pending",
      label: t("common.pending"),
      value: pending.length,
      color: "var(--chart-4)",
    },
    {
      id: "corporate",
      label: t("finance.scopeCorporate"),
      value: data.expenses
        .filter((e) => e.scope === "corporate" && e.status !== "rejected")
        .reduce((sum, e) => sum + e.amount, 0),
      prefix: "৳",
      color: "var(--chart-3)",
    },
  ]

  const label = (status: Expense["status"]) =>
    ({
      pending: t("common.pending"),
      approved: t("finance.approve"),
      paid: t("common.paid"),
      rejected: t("common.cancelled"),
    })[status]

  const columns = React.useMemo<ColumnDef<Expense, unknown>[]>(
    () => [
      {
        accessorKey: "ref",
        header: t("bookings.ref"),
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem]">
            {digits(row.original.ref)}
          </span>
        ),
      },
      {
        id: "head",
        accessorFn: (row) => `${row.head.en} ${row.head.bn}`,
        header: t("finance.head"),
        cell: ({ row }) => (
          <StatusTag hue={row.original.hue}>
            {row.original.head[locale]}
          </StatusTag>
        ),
      },
      {
        id: "vendor",
        accessorFn: (row) => `${row.vendor.en} ${row.vendor.bn}`,
        header: t("finance.vendor"),
        cell: ({ row }) => (
          <span className="truncate">{row.original.vendor[locale]}</span>
        ),
      },
      {
        accessorKey: "scope",
        header: t("finance.scope"),
        cell: ({ row }) =>
          row.original.scope === "branch"
            ? t("finance.scopeBranch")
            : t("finance.scopeCorporate"),
      },
      {
        accessorKey: "amount",
        header: t("common.amount"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.amount)}</span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "at",
        header: t("common.date"),
        cell: ({ row }) => date(row.original.at),
        meta: { align: "right" },
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.status]} dot>
            {label(row.original.status)}
          </StatusTag>
        ),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) =>
          row.original.status === "pending" ? (
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                toast.success(t("finance.approve"), {
                  description: money(row.original.amount),
                })
              }
            >
              <Check />
              {t("finance.approve")}
            </Button>
          ) : null,
        meta: { align: "right" },
      },
    ],
    [t, locale, money, date, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("finance.expensesTitle")}
        subtitle={t("finance.expensesSubtitle")}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="micro mb-2.5">{t("finance.head")}</p>
          <SplitBar money slices={byHead} />
        </div>
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Banknote />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={scope}
                onChange={setScope}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "branch", label: t("finance.scopeBranch") },
                  { value: "corporate", label: t("finance.scopeCorporate") },
                ]}
              />
              <TableSearch
                value={query}
                onChange={setQuery}
                className="ml-auto"
              />
            </>
          }
        />
      </div>
    </div>
  )
}
