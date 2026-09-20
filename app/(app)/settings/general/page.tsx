"use client"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"

export default function GeneralSettingsPage() {
  const { t, locale, num, money, date } = useLocale()
  const data = useDataset()
  const branch = data.branch
  const clock = (hour: number) =>
    `${num(hour, { minimumIntegerDigits: 2 })}:${num(0, { minimumIntegerDigits: 2 })}`

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("settings.generalTitle")}
        subtitle={t("settings.generalSubtitle")}
      >
        <Button size="sm">{t("common.save")}</Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6 lg:grid-cols-2">
        <Panel title={t("common.branch")} delay={0}>
          <dl className="flex flex-col gap-2">
            <Field
              label={t("settings.branchName")}
              value={branch.name[locale]}
            />
            <Field label={t("common.branch")} value={branch.area[locale]} />
            <Field
              label={t("branches.manager")}
              value={branch.manager[locale]}
            />
            <Field label={t("common.phone")} value={branch.phone} />
            <Field
              label={t("settings.capacity")}
              value={`${num(branch.capacity)}`}
            />
            <Field
              label={t("common.date")}
              value={date(new Date(branch.openedAt))}
            />
          </dl>
          <div className="mt-3">
            <StatusTag hue={branch.status === "live" ? "green" : "amber"} dot>
              {branch.status === "live"
                ? t("branches.statusLive")
                : branch.status === "soft-launch"
                  ? t("branches.statusSoftLaunch")
                  : t("branches.statusFitOut")}
            </StatusTag>
          </div>
        </Panel>

        <Panel title={t("settings.tradingHours")} delay={0.05}>
          <dl className="flex flex-col gap-2">
            <Field label={t("common.from")} value={clock(10)} />
            <Field label={t("common.to")} value={clock(22)} />
            <Field
              label={t("settings.defaultSlab")}
              value={data.slabs[1].name[locale]}
            />
            <Field
              label={t("daycare.rate")}
              value={`${money(260)} ${t("common.perHour")}`}
            />
          </dl>

          <p className="micro mt-4 mb-1.5">{t("membership.plansTitle")}</p>
          <ul className="flex flex-col">
            {data.slabs.map((slab) => (
              <li
                key={slab.id}
                className="flex items-center gap-2 border-b border-[var(--hairline)] py-1.5 text-[0.6875rem] last:border-0"
              >
                <StatusTag hue={slab.hue}>{slab.name[locale]}</StatusTag>
                <span className="nums ml-auto text-muted-foreground">
                  {num(slab.includedMinutes)} {t("common.minutes")}
                </span>
                <span className="nums w-16 text-right font-medium">
                  {money(slab.basePrice)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("nav.outlets")} delay={0.1}>
          <ul className="flex flex-col">
            {data.outlets.map((outlet) => (
              <li
                key={outlet.id}
                className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
              >
                <StatusTag hue={outlet.hue}>{outlet.name[locale]}</StatusTag>
                <span className="nums ml-auto font-mono text-[0.5625rem] text-muted-foreground">
                  {outlet.terminalId}
                </span>
                <span className="nums w-10 text-right text-[0.625rem]">
                  {num(outlet.staffCount)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("gate.capacityTitle")} delay={0.15}>
          <ul className="flex flex-col">
            {data.zones.map((zone) => (
              <li
                key={zone.id}
                className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
              >
                <StatusTag hue={zone.hue}>{zone.name[locale]}</StatusTag>
                <span className="ml-auto text-[0.5625rem] text-muted-foreground">
                  {zone.ageBand[locale]}
                </span>
                <span className="nums w-10 text-right text-[0.625rem] font-medium">
                  {num(zone.capacity)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </ScrollFade>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="micro mb-1">{label}</dt>
      <dd className="nums flex h-7 items-center rounded-md border border-border bg-surface px-2.5 text-[0.6875rem]">
        {value}
      </dd>
    </div>
  )
}
