"use client"

import * as React from "react"
import { Watch } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { DwellTimer } from "@/components/motion/dwell-timer"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { demoToday } from "@/lib/demo-time"
import { liveMinutes } from "@/lib/derive"
import { useLocale } from "@/lib/i18n/provider"
import type { BandStatus, TagHue, Wristband } from "@/lib/types"

const HUE: Record<BandStatus, TagHue> = {
  active: "green",
  overstay: "rose",
  exited: "slate",
  lost: "amber",
}

const FILTERS = ["all", "active", "overstay", "exited"] as const

export default function WristbandsPage() {
  const { t, locale, num, time, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(() => {
    if (filter === "all") return data.wristbands
    return data.wristbands.filter((b) => b.status === filter)
  }, [data.wristbands, filter])

  const label = React.useCallback(
    (status: BandStatus) =>
      status === "active"
        ? t("gate.statusActive")
        : status === "overstay"
          ? t("gate.statusOverstay")
          : status === "lost"
            ? t("gate.statusLost")
            : t("gate.statusExited"),
    [t]
  )

  const columns = React.useMemo<ColumnDef<Wristband, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("gate.bandCode"),
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem]">
            {digits(row.original.code)}
          </span>
        ),
      },
      {
        id: "child",
        accessorFn: (row) => lookups.child.get(row.childId)?.name[locale] ?? "",
        header: t("common.child"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {lookups.child.get(row.original.childId)?.name[locale]}
            </p>
            <p className="truncate text-[0.5625rem] text-muted-foreground">
              {lookups.customer.get(row.original.guardianId)?.name[locale]}
            </p>
          </div>
        ),
      },
      {
        id: "zone",
        accessorFn: (row) => lookups.zone.get(row.zoneId)?.name[locale] ?? "",
        header: t("common.zone"),
        cell: ({ row }) => {
          const zone = lookups.zone.get(row.original.zoneId)
          return zone ? (
            <StatusTag hue={zone.hue}>{zone.name[locale]}</StatusTag>
          ) : null
        },
      },
      {
        id: "slab",
        accessorFn: (row) => lookups.slab.get(row.slabId)?.name[locale] ?? "",
        header: t("gate.slab"),
      },
      {
        id: "entry",
        accessorFn: (row) => row.entryAt,
        header: t("gate.entryTime"),
        cell: ({ row }) => time(row.original.entryAt),
        meta: { align: "right" },
      },
      {
        id: "dwell",
        accessorFn: (row) => liveMinutes(row),
        header: t("gate.dwell"),
        cell: ({ row }) => {
          const band = row.original
          const slab = lookups.slab.get(band.slabId)
          const live = band.status === "active" || band.status === "overstay"
          return (
            <div className="flex items-center justify-end gap-1.5">
              <span className="nums">{num(liveMinutes(band))}</span>
              <DwellTimer
                compact
                entryAt={band.entryAt}
                frozenMinutes={live ? undefined : band.minutes}
                includedMinutes={slab?.includedMinutes ?? 60}
              />
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
    [t, locale, lookups, time, num, digits, label]
  )

  const since = demoToday().getTime()
  const active = data.wristbands.filter(
    (b) => b.status === "active" || b.status === "overstay"
  ).length
  const exited = data.wristbands.filter(
    (b) => b.status === "exited" && (b.exitAt ?? 0) >= since
  ).length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("gate.bandsTitle")}
        subtitle={t("gate.bandsSubtitle", {
          active: num(active),
          exited: num(exited),
        })}
      />
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Watch />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={FILTERS.map((f) => ({
                  value: f,
                  label: f === "all" ? t("common.all") : label(f as BandStatus),
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
