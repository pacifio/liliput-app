"use client"

import { motion } from "motion/react"
import { Mail, MessageSquare, Pencil } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"

export default function TemplatesPage() {
  const { t, locale, num, relative } = useLocale()
  const data = useDataset()

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("messaging.templatesTitle")}
        subtitle={t("messaging.templatesSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.templates.map((template, index) => (
          <motion.article
            key={template.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.05 }}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {template.name[locale]}
                </p>
                <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                  {t("messaging.usedTimes", { count: num(template.usedCount) })}
                </p>
              </div>
              <StatusTag hue={template.channel === "sms" ? "teal" : "purple"}>
                {template.channel === "sms" ? (
                  <MessageSquare className="size-2.5" />
                ) : (
                  <Mail className="size-2.5" />
                )}
                {template.channel === "sms"
                  ? t("messaging.channelSms")
                  : t("messaging.channelEmail")}
              </StatusTag>
            </div>

            <div className="rounded-lg bg-surface p-2.5 ring-1 ring-foreground/[0.06]">
              <p className="text-[0.6875rem] leading-relaxed">
                {template.body[locale]}
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              {template.vars.map((v) => (
                <span
                  key={v}
                  className="rounded bg-muted px-1 font-mono text-[0.5rem] text-muted-foreground"
                >
                  {`{${v}}`}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-[var(--hairline)] pt-2">
              <span className="text-[0.5625rem] text-muted-foreground">
                {relative(template.updatedAt)}
              </span>
              <Button size="xs" variant="outline" className="ml-auto">
                <Pencil />
                {t("common.edit")}
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </ScrollFade>
  )
}
