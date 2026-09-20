"use client"

import * as React from "react"
import { Receipt, Undo2 } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { useLocale } from "@/lib/i18n/provider"
import type { Payment } from "@/lib/types"

export default function RefundsPage() {
  const { t, locale, num, money, dateTime, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")

  // Refunds and failures live on one screen: both are money that did not land.
  const rows = data.payments.filter(
    (p) => p.status === "refunded" || p.status === "failed"
  )
  const refunded = rows.filter((p) => p.status === "refunded")
  const failed = rows.filter((p) => p.status === "failed")

  const kpis: KpiCell[] = [
    {
      id: "refunded",
      label: t("payments.statusRefunded"),
      value: refunded.length,
      color: "var(--chart-5)",
    },
    {
      id: "value",
      label: t("common.amount"),
      value: refunded.reduce((sum, p) => sum + p.amount, 0),
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "failed",
      label: t("common.failed"),
      value: failed.length,
      color: "var(--chart-7)",
    },
    {
      id: "failedValue",
      label: t("payments.pendingAmount"),
      value: failed.reduce((sum, p) => sum + p.amount, 0),
      prefix: "৳",
      color: "var(--chart-2)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Payment, unknown>[]>(
    () => [
      {
        accessorKey: "txnId",
        header: t("payments.txnId"),
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem]">
            {digits(row.original.txnId)}
          </span>
        ),
      },
      {
        accessorKey: "gateway",
        header: t("payments.gateway"),
        cell: ({ row }) => (
          <StatusTag hue={GATEWAY_HUE[row.original.gateway]}>
            {GATEWAY_LABEL[row.original.gateway][locale]}
          </StatusTag>
        ),
      },
      {
        id: "customer",
        accessorFn: (row) =>
          row.customerId
            ? (lookups.customer.get(row.customerId)?.name[locale] ?? "")
            : "",
        header: t("common.guardian"),
        cell: ({ row }) =>
          row.original.customerId ? (
            lookups.customer.get(row.original.customerId)?.name[locale]
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
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
        cell: ({ row }) => dateTime(row.original.at),
        meta: { align: "right" },
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag
            hue={row.original.status === "refunded" ? "slate" : "rose"}
            dot
          >
            {row.original.status === "refunded"
              ? t("payments.statusRefunded")
              : t("common.failed")}
          </StatusTag>
        ),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) =>
          row.original.status === "failed" ? (
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                toast.success(t("payments.issueRefund"), {
                  description: money(row.original.amount),
                })
              }
            >
              <Undo2 />
              {t("payments.issueRefund")}
            </Button>
          ) : null,
        meta: { align: "right" },
      },
    ],
    [t, locale, lookups, money, dateTime, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("payments.refundsTitle")}
        subtitle={t("payments.refundsSubtitle")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Receipt />}
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
