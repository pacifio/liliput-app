"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import {
  addDays,
  daysInMonth,
  demoToday,
  isoDay,
  startOfMonth,
} from "@/lib/demo-time"
import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

const WEEKDAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"]
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function BookingCalendarPage() {
  const { t, locale, num, money, time } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const today = demoToday()

  const [monthOffset, setMonthOffset] = React.useState(0)
  const [selected, setSelected] = React.useState(isoDay(today))

  const month = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1)
  )
  const first = startOfMonth(month)
  const total = daysInMonth(month)
  const lead = first.getUTCDay()

  const byDay = React.useMemo(() => {
    const map = new Map<string, typeof data.bookings>()
    for (const booking of data.bookings) {
      const bucket = map.get(booking.date) ?? []
      bucket.push(booking)
      map.set(booking.date, bucket)
    }
    return map
  }, [data.bookings])

  const dayBookings = byDay.get(selected) ?? []
  const weekdays = locale === "bn" ? WEEKDAYS_BN : WEEKDAYS_EN

  const monthLabel = new Intl.DateTimeFormat(
    locale === "bn" ? "bn-BD-u-nu-beng" : "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" }
  ).format(month)

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("bookings.calendarTitle")}
        subtitle={t("bookings.calendarSubtitle")}
      >
        <div className="flex items-center gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setMonthOffset((v) => v - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="w-32 text-center text-[0.6875rem] font-medium">
            {monthLabel}
          </span>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setMonthOffset((v) => v + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title={monthLabel} delay={0}>
          <div className="mb-1.5 grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <div key={day} className="micro text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: lead }).map((_, i) => (
              <div key={`lead-${i}`} />
            ))}
            {Array.from({ length: total }, (_, i) => {
              const date = addDays(first, i)
              const key = isoDay(date)
              const rows = byDay.get(key) ?? []
              const isToday = key === isoDay(today)
              const isSelected = key === selected
              const load = Math.min(1, rows.length / 8)
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.18,
                    delay: Math.min(i, 24) * 0.008,
                  }}
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-[0.625rem] transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-muted/70",
                    isToday && !isSelected && "ring-1 ring-primary/50"
                  )}
                >
                  <span
                    className={cn(
                      "nums",
                      isToday && !isSelected && "font-medium text-primary"
                    )}
                  >
                    {num(i + 1)}
                  </span>
                  {rows.length ? (
                    <span
                      className="h-1 rounded-full"
                      style={{
                        width: `${20 + load * 40}%`,
                        background: isSelected
                          ? "currentColor"
                          : `color-mix(in oklch, var(--chart-1) ${40 + load * 60}%, transparent)`,
                      }}
                    />
                  ) : (
                    <span className="h-1" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </Panel>

        <Panel
          title={t("nav.bookings")}
          subtitle={`${num(dayBookings.length)}`}
          delay={0.05}
        >
          {dayBookings.length ? (
            <ul className="flex flex-col">
              {dayBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <span className="nums w-11 shrink-0 text-[0.625rem] text-muted-foreground">
                    {time(booking.startAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.6875rem] font-medium">
                      {lookups.customer.get(booking.customerId)?.name[locale]}
                    </p>
                    <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                      {booking.ref} · {num(booking.heads)}
                    </p>
                  </div>
                  <StatusTag
                    hue={
                      booking.kind === "party"
                        ? "magenta"
                        : booking.kind === "daycare"
                          ? "purple"
                          : "teal"
                    }
                  >
                    {booking.kind === "party"
                      ? t("bookings.kindParty")
                      : booking.kind === "daycare"
                        ? t("bookings.kindDaycare")
                        : booking.kind === "membership"
                          ? t("bookings.kindMembership")
                          : t("bookings.kindTicket")}
                  </StatusTag>
                  <span className="nums shrink-0 text-[0.625rem] font-medium">
                    {money(booking.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-[0.6875rem] text-muted-foreground">
              {t("common.noResults")}
            </p>
          )}
        </Panel>
      </div>
    </ScrollFade>
  )
}
