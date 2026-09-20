"use client"

import { Check } from "lucide-react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { demoNow } from "@/lib/demo-time"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { LOCALES, LOCALE_META } from "@/lib/i18n/config"
import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

export default function LocalizationSettingsPage() {
  const { t, locale, setLocale, num, money, date, dateTime, pct, relative } =
    useLocale()

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("settings.localizationTitle")}
        subtitle={t("settings.localizationSubtitle")}
      />

      <div className="grid gap-3 px-5 pb-6 lg:grid-cols-2">
        <Panel title={t("settings.language")} delay={0}>
          <div className="flex flex-col gap-2">
            {LOCALES.map((value) => (
              <button
                key={value}
                onClick={() => setLocale(value)}
                className={cn(
                  "flex items-center gap-3 rounded-lg bg-surface p-3 text-left ring-1 transition-colors",
                  locale === value
                    ? "ring-primary/50"
                    : "ring-foreground/[0.06] hover:bg-muted/50"
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[0.625rem] font-semibold">
                  {LOCALE_META[value].short}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.6875rem] font-medium">
                    {LOCALE_META[value].nativeLabel}
                  </p>
                  <p className="truncate text-[0.5625rem] text-muted-foreground">
                    {LOCALE_META[value].region}
                  </p>
                </div>
                {locale === value ? (
                  <Check className="size-3.5 shrink-0 text-primary" />
                ) : null}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[0.625rem] leading-relaxed text-muted-foreground">
            {t("shell.demoNotice")}
          </p>
        </Panel>

        <Panel
          title={t("settings.preview")}
          subtitle={t("settings.numerals")}
          delay={0.05}
        >
          <dl className="flex flex-col gap-2">
            <Row label={t("settings.numerals")} value={num(1234567)} />
            <Row label={t("settings.currency")} value={money(1234567)} />
            <Row label={t("common.date")} value={date(demoNow())} />
            <Row label={t("common.time")} value={dateTime(demoNow())} />
            <Row label={t("branches.attainment")} value={pct(87.4, 1)} />
            <Row
              label={t("common.updated", { time: "" })}
              value={relative(demoNow() - 5 * 3_600_000)}
            />
          </dl>
          <p className="mt-3 text-[0.625rem] leading-relaxed text-muted-foreground">
            {locale === "bn"
              ? "বাংলা সংখ্যা লাখ ও কোটি অনুযায়ী গোষ্ঠীবদ্ধ হয়।"
              : "Bangla renders Bengali numerals with lakh/crore grouping."}
          </p>
        </Panel>
      </div>
    </ScrollFade>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-[var(--hairline)] py-1.5 text-[0.6875rem] last:border-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="nums truncate font-medium">{value}</dd>
    </div>
  )
}
