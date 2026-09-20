"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Minus, Plus, Ticket } from "lucide-react"
import { toast } from "sonner"

import { Price, SectionTitle, ShopButton, ShopCard } from "@/components/shop/ui"
import { useDataset } from "@/lib/data"
import { addDays, demoToday, isoDay } from "@/lib/demo-time"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { useLive } from "@/lib/live"
import { cn } from "@/lib/utils"

export default function TicketsPage() {
  const { t, locale, num, money, date } = useLocale()
  const data = useDataset()
  const router = useRouter()
  const addLine = useLive((s) => s.addLine)

  const days = React.useMemo(
    () => Array.from({ length: 10 }, (_, i) => addDays(demoToday(), i)),
    []
  )

  const [day, setDay] = React.useState(() => isoDay(days[0]))
  const [slabId, setSlabId] = React.useState(data.slabs[1].id)
  const [children, setChildren] = React.useState(1)

  const slab = data.slabs.find((s) => s.id === slabId) ?? data.slabs[0]
  const total = slab.basePrice * children

  function add() {
    addLine({
      kind: "ticket",
      refId: slab.id,
      qty: children,
      unitPrice: slab.basePrice,
      date: day,
    })
    toast.success(t("shop.added"), {
      description: `${slab.name[locale]} · ${t("shop.childCount", { count: num(children) })}`,
    })
    router.push("/shop/cart")
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      <SectionTitle
        title={t("shop.ticketsTitle")}
        subtitle={t("shop.ticketsSubtitle")}
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
      </ShopCard>

      <ShopCard className="p-5" delay={0.05}>
        <p className="micro mb-3">{t("shop.pickSlab")}</p>
        <div className="grid gap-2 @lg:grid-cols-2">
          {data.slabs.map((s) => {
            const active = s.id === slabId
            return (
              <button
                key={s.id}
                onClick={() => setSlabId(s.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/[0.06]"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <span
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `color-mix(in oklch, ${HUE_VAR[s.hue]} 16%, transparent)`,
                    color: HUE_VAR[s.hue],
                  }}
                >
                  <Ticket className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8125rem] font-medium">
                    {s.name[locale]}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                    {t("shop.includedMinutes", {
                      count: num(s.includedMinutes),
                    })}
                  </p>
                  <p className="mt-0.5 text-[0.625rem] text-muted-foreground">
                    {t("shop.overtimeNote", {
                      price: num(s.overtimePrice),
                      minutes: num(s.overtimeBlock),
                    })}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Price amount={s.basePrice} className="text-sm" />
                  {active ? (
                    <Check className="mt-1 ml-auto size-3.5 text-primary" />
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </ShopCard>

      <ShopCard className="p-5" delay={0.1}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.8125rem] font-medium">{t("shop.children")}</p>
            <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
              {t("shop.ticketNote")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ShopButton
              size="sm"
              variant="outline"
              onClick={() => setChildren((c) => Math.max(1, c - 1))}
              disabled={children <= 1}
              className="w-9 px-0"
            >
              <Minus />
            </ShopButton>
            <span className="nums w-8 text-center text-base font-medium">
              {num(children)}
            </span>
            <ShopButton
              size="sm"
              variant="outline"
              onClick={() => setChildren((c) => Math.min(10, c + 1))}
              className="w-9 px-0"
            >
              <Plus />
            </ShopButton>
          </div>
        </div>
      </ShopCard>

      <ShopCard className="flex items-center gap-3 p-5" delay={0.15}>
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] text-muted-foreground">
            {t("shop.total")}
          </p>
          <p className="figure text-2xl leading-none">{money(total)}</p>
          <p className="mt-1 text-[0.625rem] text-muted-foreground">
            {date(new Date(`${day}T00:00:00.000Z`))} · {slab.name[locale]} ·{" "}
            {t("shop.childCount", { count: num(children) })}
          </p>
        </div>
        <ShopButton onClick={add}>{t("shop.addToCart")}</ShopButton>
      </ShopCard>
    </div>
  )
}
