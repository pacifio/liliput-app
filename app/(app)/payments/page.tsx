"use client"

import * as React from "react"
import { CreditCard } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { useLocale } from "@/lib/i18n/provider"
import type { Payment, TagHue } from "@/lib/types"

const STATUS_HUE: Record<Payment["status"], TagHue> = {
  success: "green",
  pending: "amber",
  failed: "rose",
  refunded: "slate",
}

const FILTERS = ["all", "success", "pending", "failed", "refunded"] as const

export default function PaymentsPage() {
  const { t, locale, num, money, dateTime, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.payments
        : data.payments.filter((p) => p.status === filter),
    [data.payments, filter]
  )

  const success = data.payments.filter((p) => p.status === "success")
  const value = success.reduce((sum, p) => sum + p.amount, 0)
  const fees = success.reduce((sum, p) => sum + p.fee, 0)

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("payments.title"),
      value: data.payments.length,
      color: "var(--chart-1)",
    },
    {
      id: "value",
      label: t("payments.volume"),
      value,
      prefix: "৳",
      color: "var(--chart-2)",
    },
    {
      id: "fees",
      label: t("payments.fee"),
      value: fees,
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "net",
      label: t("payments.net"),
      value: value - fees,
      prefix: "৳",
      color: "var(--chart-6)",
    },
    {
      id: "rate",
      label: t("payments.successRate"),
      value:
        Math.round(
          (success.length / Math.max(1, data.payments.length)) * 1000
        ) / 10,
      suffix: "%",
      color: "var(--chart-3)",
    },
  ]

  const statusLabel = (status: Payment["status"]) =>
    ({
      success: t("common.success"),
      pending: t("common.pending"),
      failed: t("common.failed"),
      refunded: t("payments.statusRefunded"),
    })[status]

  const againstLabel = (against: Payment["against"]) =>
    ({
      ticket: t("payments.againstTicket"),
      pos: t("payments.againstPos"),
      booking: t("payments.againstBooking"),
      membership: t("payments.againstMembership"),
      daycare: t("payments.againstDaycare"),
    })[against]

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
        accessorKey: "against",
        header: t("payments.against"),
        cell: ({ row }) => againstLabel(row.original.against),
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
            <span className="truncate">
              {lookups.customer.get(row.original.customerId)?.name[locale]}
            </span>
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
        accessorKey: "fee",
        header: t("payments.fee"),
        cell: ({ row }) => money(row.original.fee),
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
          <StatusTag hue={STATUS_HUE[row.original.status]} dot>
            {statusLabel(row.original.status)}
          </StatusTag>
        ),
      },
    ],
    [t, locale, lookups, money, dateTime, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("payments.title")}
        subtitle={t("payments.subtitle", {
          count: num(data.payments.length),
          value: money(value),
        })}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<CreditCard />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={FILTERS.map((f) => ({
                  value: f,
                  label:
                    f === "all"
                      ? t("common.all")
                      : statusLabel(f as Payment["status"]),
                }))}
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
