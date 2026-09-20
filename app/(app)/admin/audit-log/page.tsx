"use client"

import * as React from "react"
import { ClipboardList, Download } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { AuditEntry } from "@/lib/types"

export default function AuditLogPage() {
  const { t, locale, dateTime, relative, digits } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<AuditEntry, unknown>[]>(
    () => [
      {
        accessorKey: "at",
        header: t("common.date"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="nums">{dateTime(row.original.at)}</p>
            <p className="text-[0.5625rem] text-muted-foreground">
              {relative(row.original.at)}
            </p>
          </div>
        ),
      },
      {
        id: "actor",
        accessorFn: (row) => `${row.actor.en} ${row.actor.bn}`,
        header: t("admin.actor"),
        cell: ({ row }) => (
          <span className="truncate font-medium">
            {row.original.actor[locale]}
          </span>
        ),
      },
      {
        id: "action",
        accessorFn: (row) => `${row.action.en} ${row.action.bn}`,
        header: t("admin.action"),
        cell: ({ row }) => (
          <StatusTag hue={row.original.hue}>
            {row.original.action[locale]}
          </StatusTag>
        ),
      },
      {
        accessorKey: "target",
        header: t("admin.target"),
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem]">
            {digits(row.original.target)}
          </span>
        ),
      },
      {
        id: "scope",
        accessorFn: (row) => row.scope[locale],
        header: t("common.branch"),
      },
      {
        accessorKey: "ip",
        header: "IP",
        // A machine identifier: it stays in Latin digits so it can be copied.
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem] text-muted-foreground">
            {row.original.ip}
          </span>
        ),
        meta: { align: "right" },
      },
    ],
    [t, locale, dateTime, relative, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("admin.auditTitle")}
        subtitle={t("admin.auditSubtitle")}
      >
        <Button size="sm" variant="outline">
          <Download />
          {t("common.export")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={data.audit}
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
