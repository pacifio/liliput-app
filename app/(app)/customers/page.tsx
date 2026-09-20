"use client"

import * as React from "react"
import { Plus, Users } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Customer } from "@/lib/types"

export default function CustomersPage() {
  const { t, locale, num, money, date } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")

  const spend = data.customers.reduce((sum, c) => sum + c.spend, 0)
  const members = data.customers.filter((c) => c.membershipId).length
  const smsConsent = data.customers.filter((c) => c.consent.sms).length

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("customers.title"),
      value: data.customers.length,
      color: "var(--chart-1)",
    },
    {
      id: "children",
      label: t("common.children"),
      value: data.children.length,
      color: "var(--chart-3)",
    },
    {
      id: "members",
      label: t("nav.members"),
      value: members,
      color: "var(--chart-2)",
    },
    {
      id: "spend",
      label: t("customers.spend"),
      value: spend,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "consent",
      label: t("customers.consent"),
      value: smsConsent,
      color: "var(--chart-6)",
    },
  ]

  const sourceLabel = (source: Customer["source"]) =>
    ({
      website: t("customers.sourceWebsite"),
      app: t("customers.sourceApp"),
      "walk-in": t("customers.sourceWalkIn"),
      referral: t("customers.sourceReferral"),
    })[source]

  const columns = React.useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.name.en} ${row.name.bn} ${row.phone}`,
        header: t("common.guardian"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name[locale]}</p>
            <p className="nums truncate text-[0.5625rem] text-muted-foreground">
              {row.original.phone}
            </p>
          </div>
        ),
      },
      {
        id: "area",
        accessorFn: (row) => row.area[locale],
        header: t("common.branch"),
      },
      {
        id: "segment",
        accessorFn: (row) => row.segment[locale],
        header: t("customers.segment"),
        cell: ({ row }) => (
          <StatusTag hue={row.original.segmentHue}>
            {row.original.segment[locale]}
          </StatusTag>
        ),
      },
      {
        accessorKey: "source",
        header: t("customers.source"),
        cell: ({ row }) => sourceLabel(row.original.source),
      },
      {
        accessorKey: "visits",
        header: t("customers.visits"),
        cell: ({ row }) => num(row.original.visits),
        meta: { align: "right" },
      },
      {
        accessorKey: "spend",
        header: t("customers.spend"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.spend)}</span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "points",
        header: t("customers.points"),
        cell: ({ row }) => num(row.original.points),
        meta: { align: "right" },
      },
      {
        id: "member",
        accessorFn: (row) => (row.membershipId ? 1 : 0),
        header: t("nav.membership"),
        cell: ({ row }) =>
          row.original.membershipId ? (
            <StatusTag hue="amber" dot>
              {t("common.member")}
            </StatusTag>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "joinedAt",
        header: t("customers.joined"),
        cell: ({ row }) => date(row.original.joinedAt),
        meta: { align: "right" },
      },
    ],
    [t, locale, num, money, date]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle", {
          count: num(data.customers.length),
        })}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.customers}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Users />}
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
