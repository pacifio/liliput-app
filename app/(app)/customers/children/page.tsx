"use client"

import * as React from "react"
import { AlertTriangle, HeartHandshake } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Child } from "@/lib/types"

export default function ChildProfilesPage() {
  const { t, locale, num } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")

  const withAllergies = data.children.filter((c) => c.allergies.length)
  const visitsByChild = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const band of data.wristbands) {
      map.set(band.childId, (map.get(band.childId) ?? 0) + 1)
    }
    return map
  }, [data.wristbands])

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("common.children"),
      value: data.children.length,
      color: "var(--chart-1)",
    },
    {
      id: "avgAge",
      label: t("customers.age"),
      value: Math.round(
        data.children.reduce((sum, c) => sum + c.age, 0) / data.children.length
      ),
      color: "var(--chart-3)",
    },
    {
      id: "allergies",
      label: t("customers.allergies"),
      value: withAllergies.length,
      color: "var(--chart-5)",
    },
    {
      id: "boys",
      label: "👦",
      value: data.children.filter((c) => c.gender === "boy").length,
      color: "var(--chart-2)",
    },
    {
      id: "girls",
      label: "👧",
      value: data.children.filter((c) => c.gender === "girl").length,
      color: "var(--chart-7)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Child, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.name.en} ${row.name.bn}`,
        header: t("common.child"),
        cell: ({ row }) => (
          <span className="truncate font-medium">
            {row.original.name[locale]}
          </span>
        ),
      },
      {
        id: "guardian",
        accessorFn: (row) =>
          lookups.customer.get(row.guardianId)?.name[locale] ?? "",
        header: t("common.guardian"),
        cell: ({ row }) => {
          const guardian = lookups.customer.get(row.original.guardianId)
          return (
            <div className="min-w-0">
              <p className="truncate">{guardian?.name[locale]}</p>
              <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                {guardian?.phone}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: "age",
        header: t("customers.age"),
        cell: ({ row }) =>
          t("customers.ageYears", { count: num(row.original.age) }),
        meta: { align: "right" },
      },
      {
        id: "zones",
        accessorFn: (row) => row.age,
        header: t("common.zone"),
        cell: ({ row }) => {
          const zones = data.zones.filter(
            (z) => row.original.age >= z.minAge && row.original.age <= z.maxAge
          )
          return (
            <div className="flex flex-wrap gap-1">
              {zones.slice(0, 2).map((zone) => (
                <StatusTag key={zone.id} hue={zone.hue}>
                  {zone.name[locale]}
                </StatusTag>
              ))}
              {zones.length > 2 ? (
                <span className="nums text-[0.5625rem] text-muted-foreground">
                  +{num(zones.length - 2)}
                </span>
              ) : null}
            </div>
          )
        },
      },
      {
        id: "allergies",
        accessorFn: (row) => row.allergies.length,
        header: t("customers.allergies"),
        cell: ({ row }) =>
          row.original.allergies.length ? (
            <span className="inline-flex items-center gap-1 text-[0.625rem] text-[var(--warning)]">
              <AlertTriangle className="size-2.5" />
              {row.original.allergies.map((a) => a[locale]).join(", ")}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "visits",
        accessorFn: (row) => visitsByChild.get(row.id) ?? 0,
        header: t("customers.visits"),
        cell: ({ row }) => num(visitsByChild.get(row.original.id) ?? 0),
        meta: { align: "right" },
      },
      {
        id: "notes",
        accessorFn: (row) => row.notes?.[locale] ?? "",
        header: t("daycare.notesLabel"),
        cell: ({ row }) =>
          row.original.notes ? (
            <span className="truncate text-muted-foreground">
              {row.original.notes[locale]}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [t, locale, lookups, num, data.zones, visitsByChild]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("customers.childrenTitle")}
        subtitle={t("customers.childrenSubtitle", {
          count: num(data.children.length),
        })}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.children}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<HeartHandshake />}
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
