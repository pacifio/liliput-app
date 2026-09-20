"use client"

import * as React from "react"
import Link from "next/link"
import { BadgeCheck, Nfc, Plus } from "lucide-react"

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
import { DAY_MS, demoNow } from "@/lib/demo-time"
import { useLocale } from "@/lib/i18n/provider"
import type { Membership, TagHue } from "@/lib/types"

const HUE: Record<Membership["status"], TagHue> = {
  active: "green",
  expiring: "amber",
  expired: "rose",
  suspended: "slate",
}

const FILTERS = ["all", "active", "expiring", "expired"] as const

export default function MembersPage() {
  const { t, locale, num, money, date } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const label = React.useCallback(
    (status: Membership["status"]) =>
      status === "active"
        ? t("membership.statusActive")
        : status === "expiring"
          ? t("membership.statusExpiring")
          : status === "expired"
            ? t("membership.statusExpired")
            : t("membership.statusSuspended"),
    [t]
  )

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.memberships
        : data.memberships.filter((m) => m.status === filter),
    [data.memberships, filter]
  )

  const expiring = data.memberships.filter(
    (m) => m.status === "expiring"
  ).length
  const active = data.memberships.filter((m) => m.status === "active").length
  const revenue = data.memberships.reduce(
    (sum, m) => sum + (data.plans.find((p) => p.id === m.planId)?.price ?? 0),
    0
  )

  const kpis: KpiCell[] = [
    {
      id: "total",
      label: t("nav.members"),
      value: data.memberships.length,
      color: "var(--chart-1)",
    },
    {
      id: "active",
      label: t("membership.statusActive"),
      value: active,
      color: "var(--chart-6)",
    },
    {
      id: "expiring",
      label: t("membership.statusExpiring"),
      value: expiring,
      color: "var(--chart-2)",
    },
    {
      id: "revenue",
      label: t("finance.streamMembership"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "autoRenew",
      label: t("membership.autoRenew"),
      value: data.memberships.filter((m) => m.autoRenew).length,
      color: "var(--chart-3)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Membership, unknown>[]>(
    () => [
      {
        id: "customer",
        accessorFn: (row) =>
          lookups.customer.get(row.customerId)?.name[locale] ?? "",
        header: t("common.guardian"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {lookups.customer.get(row.original.customerId)?.name[locale]}
            </p>
            <p className="nums truncate font-mono text-[0.5625rem] text-muted-foreground">
              {row.original.cardUid}
            </p>
          </div>
        ),
      },
      {
        id: "plan",
        accessorFn: (row) => row.planId,
        header: t("membership.plan"),
        cell: ({ row }) => {
          const plan = lookups.plan.get(row.original.planId)
          return plan ? (
            <StatusTag hue={plan.hue}>{plan.name[locale]}</StatusTag>
          ) : null
        },
      },
      {
        accessorKey: "tier",
        header: t("membership.tier"),
        cell: ({ row }) => (
          <span className="capitalize">{row.original.tier}</span>
        ),
      },
      {
        id: "visits",
        accessorFn: (row) => row.visitsUsed,
        header: t("membership.visits"),
        cell: ({ row }) => {
          const plan = lookups.plan.get(row.original.planId)
          return (
            <span className="nums">
              {num(row.original.visitsUsed)}/{num(plan?.visits ?? 0)}
            </span>
          )
        },
        meta: { align: "right" },
      },
      {
        id: "expires",
        accessorFn: (row) => row.expiresAt,
        header: t("membership.validity"),
        cell: ({ row }) => {
          const days = Math.round((row.original.expiresAt - demoNow()) / DAY_MS)
          return (
            <div className="text-right">
              <p className="nums">{date(row.original.expiresAt)}</p>
              <p className="nums text-[0.5625rem] text-muted-foreground">
                {days > 0
                  ? t("membership.daysLeft", { count: num(days) })
                  : t("membership.statusExpired")}
              </p>
            </div>
          )
        },
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
    [t, locale, lookups, num, date, label]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("membership.title")}
        subtitle={t("membership.subtitle", {
          count: num(data.memberships.length),
          expiring: num(expiring),
        })}
      >
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/memberships/cards" />}
        >
          <Nfc />
          {t("nav.cards")}
        </Button>
        <Button size="sm">
          <Plus />
          {t("membership.sell")}
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
          emptyIcon={<BadgeCheck />}
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
                      : label(f as Membership["status"]),
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
