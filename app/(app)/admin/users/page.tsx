"use client"

import * as React from "react"
import { Plus, ShieldCheck, Users } from "lucide-react"

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
import { useLocale } from "@/lib/i18n/provider"
import type { AppUser } from "@/lib/types"

export default function UsersPage() {
  const { t, locale, num, relative } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("admin.usersTitle"),
      value: data.users.length,
      color: "var(--chart-1)",
    },
    {
      id: "active",
      label: t("common.active"),
      value: data.users.filter((u) => u.status === "active").length,
      color: "var(--chart-6)",
    },
    {
      id: "invited",
      label: t("admin.statusInvited"),
      value: data.users.filter((u) => u.status === "invited").length,
      color: "var(--chart-4)",
    },
    {
      id: "twoFactor",
      label: t("admin.twoFactor"),
      value: data.users.filter((u) => u.twoFactor).length,
      color: "var(--chart-3)",
    },
  ]

  const columns = React.useMemo<ColumnDef<AppUser, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.name.en} ${row.name.bn} ${row.email}`,
        header: t("common.name"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name[locale]}</p>
            <p className="truncate font-mono text-[0.5625rem] text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "roleId",
        header: t("nav.roles"),
        cell: ({ row }) => {
          const role = lookups.role.get(row.original.roleId)
          return role ? (
            <StatusTag hue={role.hue}>{role.name[locale]}</StatusTag>
          ) : null
        },
      },
      {
        id: "scope",
        accessorFn: (row) => row.branchIds.length,
        header: t("common.branches"),
        cell: ({ row }) =>
          row.original.branchIds.length > 1 ? (
            <StatusTag hue="rose">
              {t("admin.scopeAll")} · {num(row.original.branchIds.length)}
            </StatusTag>
          ) : (
            <span className="truncate">
              {lookups.branch.get(row.original.branchIds[0])?.name[locale]}
            </span>
          ),
      },
      {
        accessorKey: "twoFactor",
        header: t("admin.twoFactor"),
        cell: ({ row }) =>
          row.original.twoFactor ? (
            <StatusTag hue="teal">
              <ShieldCheck className="size-2.5" />
              {t("common.on")}
            </StatusTag>
          ) : (
            <span className="text-muted-foreground">{t("common.off")}</span>
          ),
      },
      {
        accessorKey: "lastActive",
        header: t("admin.lastActive"),
        cell: ({ row }) => relative(row.original.lastActive),
        meta: { align: "right" },
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag
            hue={
              row.original.status === "active"
                ? "green"
                : row.original.status === "invited"
                  ? "amber"
                  : "slate"
            }
            dot
          >
            {row.original.status === "active"
              ? t("common.active")
              : row.original.status === "invited"
                ? t("admin.statusInvited")
                : t("admin.statusDisabled")}
          </StatusTag>
        ),
      },
    ],
    [t, locale, lookups, num, relative]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("admin.usersTitle")}
        subtitle={t("admin.usersSubtitle", { count: num(data.users.length) })}
      >
        <Button size="sm">
          <Plus />
          {t("admin.invite")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.users}
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
