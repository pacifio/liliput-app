"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  CheckCircle2,
  CloudOff,
  Database,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { CapacityMeter } from "@/components/motion/capacity-meter"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { DAY_MS, demoNow } from "@/lib/demo-time"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"

/**
 * The tender's §8 assurances made observable: uptime against the contracted
 * 99.5%, backup cadence, the offline queue, hardware state and UAT progress.
 */
const UAT_SCENARIOS = [
  {
    id: "u1",
    en: "Wristband entry & exit billing",
    bn: "রিস্টব্যান্ড প্রবেশ ও প্রস্থান বিলিং",
    passed: true,
  },
  {
    id: "u2",
    en: "NFC membership verification",
    bn: "এনএফসি সদস্যপদ যাচাই",
    passed: true,
  },
  {
    id: "u3",
    en: "Multi-outlet POS with split payment",
    bn: "স্প্লিট পেমেন্টসহ মাল্টি-আউটলেট POS",
    passed: true,
  },
  {
    id: "u4",
    en: "Day-care time-limit calculation",
    bn: "ডে-কেয়ার সময়সীমা হিসাব",
    passed: true,
  },
  {
    id: "u5",
    en: "Offline mode & queue replay",
    bn: "অফলাইন মোড ও কিউ রিপ্লে",
    passed: true,
  },
  {
    id: "u6",
    en: "Role-based access enforcement",
    bn: "ভূমিকাভিত্তিক প্রবেশাধিকার",
    passed: true,
  },
  {
    id: "u7",
    en: "Gateway settlement reconciliation",
    bn: "গেটওয়ে সেটেলমেন্ট মিলকরণ",
    passed: false,
  },
  {
    id: "u8",
    en: "30-branch master roll-up",
    bn: "৩০ শাখার মাস্টার রোল-আপ",
    passed: true,
  },
  {
    id: "u9",
    en: "Bulk SMS delivery receipts",
    bn: "বাল্ক এসএমএস ডেলিভারি রসিদ",
    passed: true,
  },
  {
    id: "u10",
    en: "Data export to accounting",
    bn: "হিসাবরক্ষণে ডেটা এক্সপোর্ট",
    passed: false,
  },
]

export default function HealthPage() {
  const { t, locale, num, dec, relative, date, pct } = useLocale()
  const data = useDataset()
  const offline = useUi((s) => s.offlineMode)
  const syncQueue = useUi((s) => s.syncQueue)
  const drainSync = useUi((s) => s.drainSync)

  const queue = offline ? syncQueue : data.syncQueue.length
  const passed = UAT_SCENARIOS.filter((s) => s.passed).length
  const devicesUp = data.devices.filter((d) => d.state === "online").length

  // A 30-day uptime record that clears the contracted floor with two dips.
  const uptimeSeries = React.useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) =>
        i === 11 ? 98.4 : i === 22 ? 99.1 : 99.7 + ((i * 7) % 3) * 0.1
      ),
    []
  )
  const uptime =
    uptimeSeries.reduce((sum, v) => sum + v, 0) / uptimeSeries.length

  const kpis: KpiCell[] = [
    {
      id: "uptime",
      label: t("admin.uptime"),
      value: Math.round(uptime * 100) / 100,
      suffix: "%",
      // Two decimals, or the one figure the contract is written against
      // rounds to a flattering 100%.
      format: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      spark: uptimeSeries,
      color: "var(--success)",
    },
    {
      id: "response",
      label: t("admin.responseTime"),
      value: 640,
      suffix: " ms",
      color: "var(--chart-1)",
    },
    {
      id: "users",
      label: t("admin.concurrentUsers"),
      value: 184,
      color: "var(--chart-3)",
    },
    {
      id: "queue",
      label: t("admin.offlineQueue"),
      value: queue,
      color: "var(--chart-4)",
    },
    {
      id: "devices",
      label: t("admin.devicesTitle"),
      value: devicesUp,
      suffix: `/${num(data.devices.length)}`,
      color: "var(--chart-2)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("admin.healthTitle")}
        subtitle={t("admin.healthSubtitle")}
      />

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <Panel
            title={t("admin.uptime")}
            subtitle={t("admin.uptimeTarget")}
            delay={0}
          >
            <div className="flex items-end gap-3">
              <p className="figure text-[2.5rem] leading-none">
                {dec(uptime, 2)}%
              </p>
              <StatusTag hue={uptime >= 99.5 ? "green" : "rose"} dot>
                {uptime >= 99.5 ? t("common.success") : t("dashboard.alerts")}
              </StatusTag>
            </div>
            <div className="mt-4">
              <CombChart
                values={uptimeSeries.map((v) => (v - 98) * 100)}
                height={64}
                gap={6}
                barWidth={4}
                color="var(--success)"
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric
                icon={<Zap className="size-3" />}
                label={t("admin.responseTime")}
                value={`${num(640)} ms`}
                hint={`< ${num(2)} s`}
              />
              <Metric
                icon={<Gauge className="size-3" />}
                label={t("admin.concurrentUsers")}
                value={num(184)}
                hint={num(500)}
              />
              <Metric
                icon={<ShieldCheck className="size-3" />}
                label={t("admin.ssl")}
                value="TLS 1.3"
                hint={t("admin.validTill", {
                  date: date(demoNow() + 240 * DAY_MS),
                })}
              />
            </div>
          </Panel>

          <div className="flex flex-col gap-3">
            <Panel title={t("admin.backups")} delay={0.05}>
              <div className="flex items-start gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]">
                  <Database className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-medium">
                    {t("admin.lastBackup")} ·{" "}
                    {relative(demoNow() - 2.4 * 3_600_000)}
                  </p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    {t("admin.backupSchedule")}
                  </p>
                </div>
              </div>
              <ul className="mt-3 flex flex-col">
                {Array.from({ length: 4 }, (_, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 border-b border-[var(--hairline)] py-1.5 text-[0.625rem] last:border-0"
                  >
                    <CheckCircle2 className="size-3 shrink-0 text-[var(--success)]" />
                    <span className="min-w-0 flex-1 truncate">
                      {relative(demoNow() - (i + 1) * 6 * 3_600_000)}
                    </span>
                    <span className="nums shrink-0 text-muted-foreground">
                      {dec(1.8 + i * 0.05, 2)} GB
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title={t("admin.offlineQueue")} delay={0.1}>
              <div className="flex items-start gap-2.5">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: queue
                      ? "color-mix(in oklch, var(--warning) 14%, transparent)"
                      : "color-mix(in oklch, var(--success) 14%, transparent)",
                    color: queue ? "var(--warning)" : "var(--success)",
                  }}
                >
                  <CloudOff className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.6875rem] font-medium">
                    {queue
                      ? t("admin.queuedItems", { count: num(queue) })
                      : t("shell.synced")}
                  </p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    {offline ? t("shell.offlineOn") : t("common.active")}
                  </p>
                </div>
                {queue ? (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      drainSync()
                      toast.success(t("shell.synced"))
                    }}
                  >
                    <RefreshCw />
                    {t("shell.syncNow")}
                  </Button>
                ) : null}
              </div>
              <ul className="mt-3 flex flex-col">
                {data.syncQueue.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 border-b border-[var(--hairline)] py-1.5 text-[0.625rem] last:border-0"
                  >
                    <StatusTag hue="amber">{item.kind}</StatusTag>
                    <span className="nums min-w-0 flex-1 truncate font-mono text-[0.5625rem] text-muted-foreground">
                      {item.ref}
                    </span>
                    <span className="nums shrink-0 text-muted-foreground">
                      {relative(item.at)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        <Panel
          title={t("admin.uat")}
          subtitle={t("admin.uatPassed", {
            passed: num(passed),
            total: num(UAT_SCENARIOS.length),
          })}
          delay={0.15}
        >
          <CapacityMeter
            value={passed}
            capacity={UAT_SCENARIOS.length}
            hue="green"
            sublabel={pct((passed / UAT_SCENARIOS.length) * 100, 0)}
          />
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {UAT_SCENARIOS.map((scenario, index) => (
              <motion.li
                key={scenario.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5 ring-1 ring-foreground/[0.06]"
              >
                <CheckCircle2
                  className="size-3 shrink-0"
                  style={{
                    color: scenario.passed
                      ? "var(--success)"
                      : "var(--muted-foreground)",
                  }}
                />
                <span className="min-w-0 flex-1 truncate text-[0.625rem]">
                  {scenario[locale]}
                </span>
                <StatusTag hue={scenario.passed ? "green" : "amber"}>
                  {scenario.passed ? t("common.success") : t("common.pending")}
                </StatusTag>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </div>
    </ScrollFade>
  )
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-lg bg-surface p-2.5 ring-1 ring-foreground/[0.06]">
      <p className="flex items-center gap-1 text-[0.5625rem] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="nums mt-1 text-[0.6875rem] font-medium">{value}</p>
      <p className="nums text-[0.5625rem] text-muted-foreground">{hint}</p>
    </div>
  )
}
