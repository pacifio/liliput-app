"use client"

import * as React from "react"
import { ClipboardList, Lock } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { LedgerEntry } from "@/lib/types"

export default function DaybookPage() {
  const { t, locale, money, dateTime } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")

  const debit = data.ledger.reduce((sum, e) => sum + e.debit, 0)
  const credit = data.ledger.reduce((sum, e) => sum + e.credit, 0)
  const balance = data.ledger[data.ledger.length - 1]?.balance ?? 0

  const kpis: KpiCell[] = [
    {
      id: "credit",
      label: t("finance.credit"),
      value: credit,
      prefix: "৳",
      color: "var(--chart-6)",
    },
    {
      id: "debit",
      label: t("finance.debit"),
      value: debit,
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "net",
      label: t("finance.netRevenue"),
      value: credit - debit,
      prefix: "৳",
      color: "var(--chart-1)",
    },
    {
      id: "balance",
      label: t("finance.balance"),
      value: balance,
      prefix: "৳",
      color: "var(--chart-2)",
    },
  ]

  const columns = React.useMemo<ColumnDef<LedgerEntry, unknown>[]>(
    () => [
      {
        accessorKey: "at",
        header: t("common.date"),
        cell: ({ row }) => dateTime(row.original.at),
      },
      {
        id: "account",
        accessorFn: (row) => `${row.account.en} ${row.account.bn}`,
        header: t("finance.account"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.account[locale]}</span>
        ),
      },
      {
        id: "narration",
        accessorFn: (row) => row.narration[locale],
        header: t("finance.narration"),
        cell: ({ row }) => (
          <span className="truncate text-muted-foreground">
            {row.original.narration[locale]}
          </span>
        ),
      },
      {
        accessorKey: "debit",
        header: t("finance.debit"),
        cell: ({ row }) =>
          row.original.debit ? (
            <span className="text-[var(--destructive)]">
              {money(row.original.debit)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "credit",
        header: t("finance.credit"),
        cell: ({ row }) =>
          row.original.credit ? (
            <span className="text-[var(--success)]">
              {money(row.original.credit)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "balance",
        header: t("finance.balance"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.balance)}</span>
        ),
        meta: { align: "right" },
      },
    ],
    [t, locale, money, dateTime]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("finance.daybookTitle")}
        subtitle={t("finance.daybookSubtitle")}
      >
        <Button
          size="sm"
          onClick={() =>
            toast.success(t("finance.closeDay"), {
              description: money(balance),
            })
          }
        >
          <Lock />
          {t("finance.closeDay")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.ledger}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<ClipboardList />}
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
