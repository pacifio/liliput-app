"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Clock, Users } from "lucide-react"
import { toast } from "sonner"

import {
  HueWash,
  Price,
  SectionTitle,
  ShopButton,
  ShopCard,
} from "@/components/shop/ui"
import { useDataset } from "@/lib/data"
import { addDays, demoToday, isoDay } from "@/lib/demo-time"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { useLive } from "@/lib/live"
import { cn } from "@/lib/utils"

const HOURS = [11, 13, 15, 17, 19]

export default function PartiesPage() {
  const { t, locale, num, money } = useLocale()
  const data = useDataset()
  const router = useRouter()
  const addLine = useLive((s) => s.addLine)

  // Parties need lead time, so the picker starts a week out.
  const days = React.useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(demoToday(), i + 7)),
    []
  )
  const [day, setDay] = React.useState(() => isoDay(days[0]))
  const [hour, setHour] = React.useState(15)

  function book(packageId: string, price: number, name: string) {
    addLine({
      kind: "party",
      refId: packageId,
      qty: 1,
      unitPrice: price,
      date: day,
      startHour: hour,
    })
    toast.success(t("shop.added"), { description: name })
    router.push("/shop/cart")
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      <SectionTitle
        title={t("shop.partiesTitle")}
        subtitle={t("shop.partiesSubtitle")}
      />

      <ShopCard className="p-5">
        <p className="micro mb-3">{t("shop.pickDate")}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const key = isoDay(d)
            const active = key === day
            return (
              <button
                key={key}
                onClick={() => setDay(key)}
                className={cn(
                  "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted/60"
                )}
              >
                <span className="text-[0.5625rem] text-muted-foreground">
                  {new Intl.DateTimeFormat(
                    locale === "bn" ? "bn-BD" : "en-US",
                    { weekday: "short", timeZone: "UTC" }
                  ).format(d)}
                </span>
                <span className="nums text-sm font-medium">
                  {num(d.getUTCDate())}
                </span>
              </button>
            )
          })}
        </div>

        <p className="micro mt-5 mb-3">{t("shop.pickTime")}</p>
        <div className="flex flex-wrap gap-2">
          {HOURS.map((h) => (
            <button
              key={h}
              onClick={() => setHour(h)}
              className={cn(
                "nums h-9 rounded-xl border px-3.5 text-[0.8125rem] transition-colors",
                hour === h
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted/60"
              )}
            >
              {num(h)}:{num(0, { minimumIntegerDigits: 2 })}
            </button>
          ))}
        </div>
      </ShopCard>

      <div className="grid gap-4 @3xl:grid-cols-3">
        {data.packages.map((pkg, index) => (
          <ShopCard key={pkg.id} delay={index * 0.06} className="flex flex-col">
            <HueWash hue={HUE_VAR[pkg.hue]} className="h-24 p-5">
              <p className="text-base font-medium">{pkg.name[locale]}</p>
              <p className="mt-1 flex items-center gap-3 text-[0.6875rem] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {num(pkg.heads)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {t("shop.hoursCount", { count: num(pkg.hours) })}
                </span>
              </p>
            </HueWash>

            <div className="flex flex-1 flex-col gap-4 p-5">
              <div>
                <Price amount={pkg.price} className="text-2xl" />
                <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                  {t("shop.advanceNote")} · {money(Math.round(pkg.price * 0.3))}
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {pkg.includes.map((item) => (
                  <li
                    key={item.en}
                    className="flex items-start gap-2 text-[0.8125rem]"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
                    {item[locale]}
                  </li>
                ))}
              </ul>

              <ShopButton
                className="mt-auto w-full"
                onClick={() => book(pkg.id, pkg.price, pkg.name[locale])}
              >
                {t("shop.bookParty")}
              </ShopButton>
            </div>
          </ShopCard>
        ))}
      </div>
    </div>
  )
}
