"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarDays, Plus } from "lucide-react"

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
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Booking, TagHue } from "@/lib/types"

const STATUS_HUE: Record<Booking["status"], TagHue> = {
  pending: "amber",
  confirmed: "blue",
  "checked-in": "green",
  completed: "slate",
  cancelled: "rose",
}

const KIND_HUE: Record<Booking["kind"], TagHue> = {
  ticket: "teal",
  party: "magenta",
  daycare: "purple",
  membership: "amber",
}

const FILTERS = [
  "all",
  "pending",
  "confirmed",
  "checked-in",
  "completed",
] as const

export default function BookingsPage() {
  const { t, locale, num, money, date, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const statusLabel = React.useCallback(
    (status: Booking["status"]) =>
      ({
        pending: t("bookings.statusPending"),
        confirmed: t("bookings.statusConfirmed"),
        "checked-in": t("bookings.statusCheckedIn"),
        completed: t("bookings.statusCompleted"),
        cancelled: t("bookings.statusCancelled"),
      })[status],
    [t]
  )

  const kindLabel = React.useCallback(
    (kind: Booking["kind"]) =>
      ({
        ticket: t("bookings.kindTicket"),
        party: t("bookings.kindParty"),
        daycare: t("bookings.kindDaycare"),
        membership: t("bookings.kindMembership"),
      })[kind],
    [t]
  )

  const channelLabel = React.useCallback(
    (channel: Booking["channel"]) =>
      ({
        website: t("bookings.channelWebsite"),
        app: t("bookings.channelApp"),
        phone: t("bookings.channelPhone"),
        counter: t("bookings.channelCounter"),
      })[channel],
    [t]
  )

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.bookings
        : data.bookings.filter((b) => b.status === filter),
    [data.bookings, filter]
  )

  const value = data.bookings.reduce((sum, b) => sum + b.amount, 0)
  const collected = data.bookings.reduce((sum, b) => sum + b.paid, 0)
  const online = data.bookings.filter(
    (b) => b.channel === "website" || b.channel === "app"
  ).length

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("nav.bookings"),
      value: data.bookings.length,
      color: "var(--chart-1)",
    },
    {
      id: "value",
      label: t("common.total"),
      value,
      prefix: "৳",
      color: "var(--chart-2)",
    },
    {
      id: "collected",
      label: t("common.paid"),
      value: collected,
      prefix: "৳",
      color: "var(--chart-6)",
    },
    {
      id: "online",
      label: t("bookings.channelWebsite"),
      value: online,
      color: "var(--chart-3)",
    },
    {
      id: "parties",
      label: t("bookings.kindParty"),
      value: data.bookings.filter((b) => b.kind === "party").length,
      color: "var(--chart-7)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Booking, unknown>[]>(
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
        id: "customer",
        accessorFn: (row) =>
          lookups.customer.get(row.customerId)?.name[locale] ?? "",
        header: t("common.guardian"),
        cell: ({ row }) => (
          <span className="truncate font-medium">
            {lookups.customer.get(row.original.customerId)?.name[locale]}
          </span>
        ),
      },
      {
        accessorKey: "kind",
        header: t("bookings.kind"),
        cell: ({ row }) => (
          <StatusTag hue={KIND_HUE[row.original.kind]}>
            {kindLabel(row.original.kind)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "date",
        header: t("common.date"),
        cell: ({ row }) => date(row.original.startAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "heads",
        header: t("bookings.heads"),
        cell: ({ row }) => num(row.original.heads),
        meta: { align: "right" },
      },
      {
        accessorKey: "channel",
        header: t("bookings.channel"),
        cell: ({ row }) => channelLabel(row.original.channel),
      },
      {
        accessorKey: "amount",
        header: t("common.amount"),
        cell: ({ row }) => (
          <div className="text-right">
            <p className="nums font-medium">{money(row.original.amount)}</p>
            {row.original.paid < row.original.amount ? (
              <p className="nums text-[0.5625rem] text-[var(--warning)]">
                {money(row.original.amount - row.original.paid)}
              </p>
            ) : null}
          </div>
        ),
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
    [
      t,
      locale,
      lookups,
      num,
      money,
      date,
      digits,
      kindLabel,
      channelLabel,
      statusLabel,
    ]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("bookings.title")}
        subtitle={t("bookings.subtitle", { count: num(data.bookings.length) })}
      >
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/bookings/calendar" />}
        >
          <CalendarDays />
          {t("nav.bookingCalendar")}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/bookings/new" />}
        >
          <Plus />
          {t("bookings.newTitle")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<CalendarDays />}
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
                      : statusLabel(f as Booking["status"]),
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
