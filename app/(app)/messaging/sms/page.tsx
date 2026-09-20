"use client"

import * as React from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { MessageBatch, TagHue } from "@/lib/types"
import { cn } from "@/lib/utils"

const HUE: Record<MessageBatch["status"], TagHue> = {
  queued: "slate",
  sending: "blue",
  sent: "green",
  failed: "rose",
}

export default function BulkSmsPage() {
  const { t, locale, num, money, relative, pct } = useLocale()
  const data = useDataset()

  const batches = data.batches.filter((b) => b.channel === "sms")
  const templates = data.templates.filter((tp) => tp.channel === "sms")
  const [templateId, setTemplateId] = React.useState(templates[0]?.id ?? "")
  const [segment, setSegment] = React.useState<string>("all")

  const template = templates.find((tp) => tp.id === templateId)
  const audience =
    segment === "all"
      ? data.customers.filter((c) => c.consent.sms).length
      : data.customers.filter((c) => c.consent.sms && c.segment.en === segment)
          .length
  const cost = audience * 0.35

  const sent = batches.reduce((sum, b) => sum + b.sent, 0)
  const delivered = batches.reduce((sum, b) => sum + b.delivered, 0)
  const failed = batches.reduce((sum, b) => sum + b.failed, 0)
  const spend = batches.reduce((sum, b) => sum + b.cost, 0)

  const segments = [
    ...new Map(data.customers.map((c) => [c.segment.en, c.segment])).values(),
  ]

  const kpis: KpiCell[] = [
    {
      id: "sent",
      label: t("messaging.sent"),
      value: sent,
      color: "var(--chart-1)",
    },
    {
      id: "delivery",
      label: t("messaging.deliveryRate"),
      value: Math.round((delivered / Math.max(1, sent)) * 1000) / 10,
      suffix: "%",
      color: "var(--chart-6)",
    },
    {
      id: "failed",
      label: t("messaging.failed"),
      value: failed,
      color: "var(--chart-5)",
    },
    {
      id: "cost",
      label: t("messaging.cost"),
      value: Math.round(spend),
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "consent",
      label: t("customers.consent"),
      value: data.customers.filter((c) => c.consent.sms).length,
      color: "var(--chart-3)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("messaging.smsTitle")}
        subtitle={t("messaging.smsSubtitle", {
          sent: num(sent),
          cost: money(Math.round(spend)),
        })}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1fr_1.3fr]">
          <Panel title={t("messaging.compose")} delay={0}>
            <p className="micro mb-1.5">{t("messaging.template")}</p>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => setTemplateId(tp.id)}
                  className={cn(
                    "h-6 rounded-full border px-2.5 text-[0.625rem] transition-colors",
                    templateId === tp.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {tp.name[locale]}
                </button>
              ))}
            </div>

            {template ? (
              <div className="mt-3 rounded-lg bg-surface p-3 ring-1 ring-foreground/[0.06]">
                <p className="micro mb-1.5">{t("messaging.preview")}</p>
                <p className="text-[0.6875rem] leading-relaxed">
                  {template.body[locale]}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.vars.map((v) => (
                    <span
                      key={v}
                      className="rounded bg-muted px-1 font-mono text-[0.5rem] text-muted-foreground"
                    >
                      {`{${v}}`}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="micro mt-3 mb-1.5">{t("messaging.audience")}</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSegment("all")}
                className={cn(
                  "h-6 rounded-full border px-2.5 text-[0.625rem] transition-colors",
                  segment === "all"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/60"
                )}
              >
                {t("common.all")}
              </button>
              {segments.map((s) => (
                <button
                  key={s.en}
                  onClick={() => setSegment(s.en)}
                  className={cn(
                    "h-6 rounded-full border px-2.5 text-[0.625rem] transition-colors",
                    segment === s.en
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {s[locale]}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-lg bg-surface p-2.5 ring-1 ring-foreground/[0.06]">
              <div className="flex items-baseline justify-between text-[0.6875rem]">
                <span className="text-muted-foreground">
                  {t("messaging.audience")}
                </span>
                <span className="nums font-medium">{num(audience)}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-[0.6875rem]">
                <span className="text-muted-foreground">
                  {t("messaging.estimatedCost")}
                </span>
                <span className="nums font-medium">{money(cost)}</span>
              </div>
            </div>

            <div className="mt-3 flex gap-1.5">
              <Button
                size="sm"
                className="flex-1"
                onClick={() =>
                  toast.success(t("messaging.sendNow"), {
                    description: `${num(audience)} · ${money(cost)}`,
                  })
                }
              >
                <Send />
                {t("messaging.sendNow")}
              </Button>
              <Button size="sm" variant="outline">
                {t("messaging.schedule")}
              </Button>
            </div>
          </Panel>

          <Panel
            title={t("messaging.smsTitle")}
            subtitle={t("messaging.sent")}
            delay={0.05}
          >
            <CombChart
              values={batches
                .slice(0, 24)
                .reverse()
                .map((b) => b.sent)}
              height={72}
              color="var(--chart-1)"
            />
            <ul className="mt-3 flex flex-col">
              {batches.map((batch) => (
                <li
                  key={batch.id}
                  className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.6875rem] font-medium">
                      {batch.template[locale]}
                    </p>
                    <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                      {batch.ref} · {relative(batch.at)}
                    </p>
                  </div>
                  <span className="nums shrink-0 text-[0.625rem]">
                    {num(batch.sent)}
                  </span>
                  <span className="nums w-12 shrink-0 text-right text-[0.5625rem] text-muted-foreground">
                    {pct((batch.delivered / Math.max(1, batch.sent)) * 100, 0)}
                  </span>
                  <StatusTag hue={HUE[batch.status]} dot>
                    {batch.status === "sent"
                      ? t("messaging.sent")
                      : batch.status === "sending"
                        ? t("common.pending")
                        : batch.status === "queued"
                          ? t("common.pending")
                          : t("messaging.failed")}
                  </StatusTag>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
