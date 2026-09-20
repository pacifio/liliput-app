"use client"

import { motion } from "motion/react"
import { Plug } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"

export default function IntegrationsPage() {
  const { t, locale, relative } = useLocale()
  const data = useDataset()

  const connected = data.integrations.filter((i) => i.state === "connected")
  const errors = data.integrations.filter((i) => i.state === "error")

  const kpis: KpiCell[] = [
    {
      id: "total",
      label: t("admin.integrationsTitle"),
      value: data.integrations.length,
      color: "var(--chart-1)",
    },
    {
      id: "connected",
      label: t("admin.connected"),
      value: connected.length,
      color: "var(--chart-6)",
    },
    {
      id: "errors",
      label: t("admin.error"),
      value: errors.length,
      color: "var(--chart-5)",
    },
    {
      id: "available",
      label: t("admin.available"),
      value: data.integrations.filter((i) => i.state === "available").length,
      color: "var(--chart-3)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("admin.integrationsTitle")}
        subtitle={t("admin.integrationsSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.integrations.map((integration, index) => (
            <motion.article
              key={integration.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: index * 0.04 }}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[0.625rem] font-semibold text-muted-foreground">
                  {integration.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.6875rem] font-medium">
                    {integration.name}
                  </p>
                  <p className="truncate text-[0.5625rem] text-muted-foreground">
                    {integration.category[locale]}
                  </p>
                </div>
              </div>

              <p className="text-[0.625rem] leading-relaxed text-muted-foreground">
                {integration.note[locale]}
              </p>

              <div className="mt-auto flex items-center gap-2 border-t border-[var(--hairline)] pt-2">
                <StatusTag
                  hue={
                    integration.state === "connected"
                      ? "green"
                      : integration.state === "error"
                        ? "rose"
                        : "slate"
                  }
                  dot
                >
                  {integration.state === "connected"
                    ? t("admin.connected")
                    : integration.state === "error"
                      ? t("admin.error")
                      : t("admin.available")}
                </StatusTag>
                <span className="ml-auto text-[0.5625rem] text-muted-foreground">
                  {relative(integration.lastSync)}
                </span>
                {integration.state === "available" ? (
                  <Button size="xs" variant="outline">
                    <Plug />
                    {t("admin.connect")}
                  </Button>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </ScrollFade>
  )
}
