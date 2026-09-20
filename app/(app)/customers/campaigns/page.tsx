"use client"

import * as React from "react"
import { Megaphone, Plus } from "lucide-react"

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
import type { Campaign, TagHue } from "@/lib/types"

const HUE: Record<Campaign["status"], TagHue> = {
  draft: "slate",
  scheduled: "blue",
  running: "green",
  done: "teal",
  paused: "amber",
}

export default function CampaignsPage() {
  const { t, locale, num, money, date, pct } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")

  const revenue = data.campaigns.reduce((sum, c) => sum + c.revenue, 0)
  const sent = data.campaigns.reduce((sum, c) => sum + c.sent, 0)
  const converted = data.campaigns.reduce((sum, c) => sum + c.converted, 0)

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("customers.campaignsTitle"),
      value: data.campaigns.length,
      color: "var(--chart-1)",
    },
    {
      id: "sent",
      label: t("messaging.sent"),
      value: sent,
      color: "var(--chart-2)",
    },
    {
      id: "converted",
      label: t("customers.converted"),
      value: converted,
      color: "var(--chart-6)",
    },
    {
      id: "revenue",
      label: t("customers.attributedRevenue"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "rate",
      label: t("customers.converted"),
      value: Math.round((converted / Math.max(1, sent)) * 1000) / 10,
      suffix: "%",
      color: "var(--chart-3)",
    },
  ]

  const label = (status: Campaign["status"]) =>
    ({
      draft: t("common.pending"),
      scheduled: t("messaging.schedule"),
      running: t("common.active"),
      done: t("common.completed"),
      paused: t("common.inactive"),
    })[status]

  const columns = React.useMemo<ColumnDef<Campaign, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.name.en} ${row.name.bn}`,
        header: t("common.name"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name[locale]}</p>
            <p className="truncate text-[0.5625rem] text-muted-foreground">
              {row.original.segment[locale]}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "channel",
        header: t("messaging.channelSms"),
        cell: ({ row }) => (
          <StatusTag
            hue={
              row.original.channel === "sms"
                ? "teal"
                : row.original.channel === "email"
                  ? "purple"
                  : "blue"
            }
          >
            {row.original.channel === "sms"
              ? t("messaging.channelSms")
              : row.original.channel === "email"
                ? t("messaging.channelEmail")
                : t("common.all")}
          </StatusTag>
        ),
      },
      {
        accessorKey: "audience",
        header: t("customers.audience"),
        cell: ({ row }) => num(row.original.audience),
        meta: { align: "right" },
      },
      {
        accessorKey: "delivered",
        header: t("customers.delivered"),
        cell: ({ row }) => (
          <span className="nums">
            {num(row.original.delivered)}
            <span className="ml-1 text-[0.5625rem] text-muted-foreground">
              {pct(
                (row.original.delivered / Math.max(1, row.original.sent)) * 100,
                0
              )}
            </span>
          </span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "opened",
        header: t("customers.opened"),
        cell: ({ row }) => num(row.original.opened),
        meta: { align: "right" },
      },
      {
        accessorKey: "converted",
        header: t("customers.converted"),
        cell: ({ row }) => num(row.original.converted),
        meta: { align: "right" },
      },
      {
        accessorKey: "revenue",
        header: t("customers.attributedRevenue"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.revenue)}</span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "startedAt",
        header: t("common.date"),
        cell: ({ row }) => date(row.original.startedAt),
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
    ],
    [t, locale, num, money, date, pct]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("customers.campaignsTitle")}
        subtitle={t("customers.campaignsSubtitle")}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.campaigns}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Megaphone />}
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
