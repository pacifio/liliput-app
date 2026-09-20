"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Battery } from "lucide-react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { DEVICE_HUE, DEVICE_LABEL } from "@/lib/labels"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { DeviceKind } from "@/lib/types"

const KINDS: DeviceKind[] = [
  "pos",
  "printer",
  "drawer",
  "scanner",
  "nfc",
  "turnstile",
  "tablet",
]

export default function DevicesPage() {
  const { t, locale, num, relative, pct } = useLocale()
  const data = useDataset()
  const [kind, setKind] = React.useState<string>("all")

  const rows =
    kind === "all" ? data.devices : data.devices.filter((d) => d.kind === kind)

  const online = data.devices.filter((d) => d.state === "online").length

  const kpis: KpiCell[] = [
    {
      id: "total",
      label: t("admin.devicesTitle"),
      value: data.devices.length,
      color: "var(--chart-1)",
    },
    {
      id: "online",
      label: t("admin.stateOnline"),
      value: online,
      color: "var(--chart-6)",
    },
    {
      id: "degraded",
      label: t("admin.stateDegraded"),
      value: data.devices.filter((d) => d.state === "degraded").length,
      color: "var(--chart-4)",
    },
    {
      id: "offline",
      label: t("admin.stateOffline"),
      value: data.devices.filter((d) => d.state === "offline").length,
      color: "var(--chart-5)",
    },
    {
      id: "uptime",
      label: t("admin.uptime"),
      value:
        Math.round((online / Math.max(1, data.devices.length)) * 1000) / 10,
      suffix: "%",
      color: "var(--chart-3)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("admin.devicesTitle")}
        subtitle={t("admin.devicesSubtitle")}
      >
        <SegmentedPills
          size="sm"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: t("common.all") },
            ...KINDS.map((k) => ({ value: k, label: DEVICE_LABEL[k][locale] })),
          ]}
        />
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: Math.min(index, 16) * 0.03 }}
              className="flex flex-col gap-2.5 rounded-xl bg-card p-3.5 ring-1 ring-foreground/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="nums truncate font-mono text-[0.625rem] font-medium">
                    {device.code}
                  </p>
                  <p className="truncate text-[0.5625rem] text-muted-foreground">
                    {DEVICE_LABEL[device.kind][locale]}
                  </p>
                </div>
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    background:
                      device.state === "online"
                        ? "var(--success)"
                        : device.state === "degraded"
                          ? "var(--warning)"
                          : "var(--destructive)",
                  }}
                />
              </div>

              <div
                className="flex h-8 items-center justify-center rounded-lg text-[0.5625rem]"
                style={{
                  background: `color-mix(in oklch, ${HUE_VAR[DEVICE_HUE[device.kind]]} 10%, transparent)`,
                  color: HUE_VAR[DEVICE_HUE[device.kind]],
                }}
              >
                {device.model}
              </div>

              <dl className="flex flex-col gap-0.5 text-[0.5625rem]">
                <Row
                  label={t("common.branch")}
                  value={device.location[locale]}
                />
                <Row label={t("admin.firmware")} value={device.firmware} />
                <Row
                  label={t("admin.lastSeen")}
                  value={relative(device.lastSeen)}
                />
              </dl>

              <div className="mt-auto flex items-center gap-2 border-t border-[var(--hairline)] pt-2">
                <StatusTag
                  hue={
                    device.state === "online"
                      ? "green"
                      : device.state === "degraded"
                        ? "amber"
                        : "rose"
                  }
                  dot
                >
                  {device.state === "online"
                    ? t("admin.stateOnline")
                    : device.state === "degraded"
                      ? t("admin.stateDegraded")
                      : t("admin.stateOffline")}
                </StatusTag>
                {device.battery !== undefined ? (
                  <span
                    className="nums ml-auto flex items-center gap-1 text-[0.5625rem]"
                    style={{
                      color:
                        device.battery < 20
                          ? "var(--destructive)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    <Battery className="size-2.5" />
                    {pct(device.battery, 0)}
                  </span>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        <Panel title={t("admin.deviceKind")} delay={0.25}>
          <ul className="flex flex-col">
            {KINDS.map((k) => {
              const all = data.devices.filter((d) => d.kind === k)
              const up = all.filter((d) => d.state === "online").length
              return (
                <li
                  key={k}
                  className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <StatusTag hue={DEVICE_HUE[k]}>
                    {DEVICE_LABEL[k][locale]}
                  </StatusTag>
                  <span className="nums ml-auto text-[0.625rem] text-muted-foreground">
                    {num(up)}/{num(all.length)}
                  </span>
                  <span
                    className="nums w-12 text-right text-[0.6875rem] font-medium"
                    style={{
                      color:
                        up === all.length ? "var(--success)" : "var(--warning)",
                    }}
                  >
                    {pct((up / Math.max(1, all.length)) * 100, 0)}
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </ScrollFade>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="nums min-w-0 truncate">{value}</dd>
    </div>
  )
}
