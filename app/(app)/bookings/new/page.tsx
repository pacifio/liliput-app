"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, ArrowRight, Check, PartyPopper } from "lucide-react"
import { toast } from "sonner"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { addDays, demoToday, isoDay } from "@/lib/demo-time"
import { GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { useLocale } from "@/lib/i18n/provider"
import type { Gateway } from "@/lib/types"
import { cn } from "@/lib/utils"

const STEPS = [
  "stepCustomer",
  "stepChildren",
  "stepPackage",
  "stepSchedule",
  "stepPayment",
  "stepReview",
] as const

const GATEWAYS: Gateway[] = ["bkash", "nagad", "sslcommerz", "card", "cash"]

export default function NewBookingPage() {
  const { t, locale, num, money, date, pct } = useLocale()
  const data = useDataset()

  const [step, setStep] = React.useState(0)
  const [customerId, setCustomerId] = React.useState<string | null>(null)
  const [childIds, setChildIds] = React.useState<string[]>([])
  const [packageId, setPackageId] = React.useState<string | null>(null)
  const [dayOffset, setDayOffset] = React.useState(3)
  const [hour, setHour] = React.useState(15)
  const [gateway, setGateway] = React.useState<Gateway>("bkash")
  const [advanceOnly, setAdvanceOnly] = React.useState(true)
  const [ref, setRef] = React.useState<string | null>(null)

  const customer = data.customers.find((c) => c.id === customerId)
  const kids = customer
    ? data.children.filter((c) => c.guardianId === customer.id)
    : []
  const pkg = data.packages.find((p) => p.id === packageId)
  const when = addDays(demoToday(), dayOffset)
  const amount = pkg?.price ?? 0
  const payable = advanceOnly ? Math.round(amount * 0.3) : amount

  const canAdvance = [
    !!customerId,
    childIds.length > 0,
    !!packageId,
    true,
    true,
    true,
  ][step]

  function confirm() {
    const next = `LD${Math.floor(40000 + Math.random() * 9999)}`
    setRef(next)
    toast.success(t("bookings.bookingConfirmed", { ref: next }), {
      description: `${date(when)} · ${money(payable)}`,
    })
  }

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("bookings.newTitle")}
        subtitle={t("bookings.newSubtitle")}
      />

      <div className="px-5 pb-6">
        {/* Step rail */}
        <ol className="mb-3 flex items-center gap-1 overflow-x-auto">
          {STEPS.map((key, index) => {
            const state =
              index < step ? "done" : index === step ? "active" : "todo"
            return (
              <li key={key} className="flex min-w-0 items-center gap-1">
                <button
                  onClick={() => index <= step && setStep(index)}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <motion.span
                    animate={{
                      backgroundColor:
                        state === "active"
                          ? "var(--primary)"
                          : state === "done"
                            ? "color-mix(in oklch, var(--success) 18%, transparent)"
                            : "var(--muted)",
                      color:
                        state === "active"
                          ? "var(--primary-foreground)"
                          : state === "done"
                            ? "var(--success)"
                            : "var(--muted-foreground)",
                      scale: state === "active" ? 1.06 : 1,
                    }}
                    transition={{ duration: 0.22 }}
                    className="nums flex size-[22px] shrink-0 items-center justify-center rounded-md text-[0.5625rem] font-medium"
                  >
                    {state === "done" ? (
                      <Check className="size-3" />
                    ) : (
                      num(index + 1)
                    )}
                  </motion.span>
                  <span
                    className={cn(
                      "truncate text-[0.625rem] whitespace-nowrap",
                      state === "active"
                        ? "font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {t(`bookings.${key}`)}
                  </span>
                </button>
                {index < STEPS.length - 1 ? (
                  <span className="mx-1 h-px w-4 shrink-0 bg-[var(--hairline)]" />
                ) : null}
              </li>
            )
          })}
        </ol>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <Panel title={t(`bookings.${STEPS[step]}`)} delay={0}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 ? (
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {data.customers.slice(0, 10).map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => {
                            setCustomerId(c.id)
                            setChildIds([])
                          }}
                          className={cn(
                            "w-full rounded-lg bg-surface p-2.5 text-left ring-1 transition-colors",
                            customerId === c.id
                              ? "ring-primary/50"
                              : "ring-foreground/[0.06] hover:bg-muted/50"
                          )}
                        >
                          <p className="truncate text-[0.6875rem] font-medium">
                            {c.name[locale]}
                          </p>
                          <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                            {c.phone} · {c.area[locale]}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : step === 1 ? (
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {kids.map((child) => {
                      const on = childIds.includes(child.id)
                      return (
                        <li key={child.id}>
                          <button
                            onClick={() =>
                              setChildIds((state) =>
                                on
                                  ? state.filter((id) => id !== child.id)
                                  : [...state, child.id]
                              )
                            }
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg bg-surface p-2.5 text-left ring-1 transition-colors",
                              on
                                ? "ring-primary/50"
                                : "ring-foreground/[0.06] hover:bg-muted/50"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[0.6875rem] font-medium">
                                {child.name[locale]}
                              </p>
                              <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                                {t("customers.ageYears", {
                                  count: num(child.age),
                                })}
                              </p>
                            </div>
                            {on ? (
                              <Check className="size-3 shrink-0 text-primary" />
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : step === 2 ? (
                  <ul className="grid gap-2">
                    {data.packages.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => setPackageId(p.id)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg bg-surface p-3 text-left ring-1 transition-colors",
                            packageId === p.id
                              ? "ring-primary/50"
                              : "ring-foreground/[0.06] hover:bg-muted/50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.6875rem] font-medium">
                              {p.name[locale]}
                            </p>
                            <p className="nums text-[0.5625rem] text-muted-foreground">
                              {t("bookings.upToHeads", { count: num(p.heads) })}{" "}
                              ·{" "}
                              {t("bookings.forHours", { count: num(p.hours) })}
                            </p>
                            <p className="mt-1 text-[0.5625rem] text-muted-foreground">
                              {p.includes.map((i) => i[locale]).join(" · ")}
                            </p>
                          </div>
                          <StatusTag hue={p.hue}>{money(p.price)}</StatusTag>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : step === 3 ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="micro mb-1.5">{t("common.date")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (offset) => {
                            const d = addDays(demoToday(), offset)
                            return (
                              <button
                                key={offset}
                                onClick={() => setDayOffset(offset)}
                                className={cn(
                                  "nums h-7 rounded-lg border px-2.5 text-[0.625rem] transition-colors",
                                  dayOffset === offset
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:bg-muted/60"
                                )}
                              >
                                {date(d)}
                              </button>
                            )
                          }
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="micro mb-1.5">{t("common.time")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[11, 13, 15, 17, 19].map((h) => (
                          <button
                            key={h}
                            onClick={() => setHour(h)}
                            className={cn(
                              "nums h-7 rounded-lg border px-2.5 text-[0.625rem] transition-colors",
                              hour === h
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted/60"
                            )}
                          >
                            {num(h)}:{num(0, { minimumIntegerDigits: 2 })}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : step === 4 ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="micro mb-1.5">{t("payments.gateway")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {GATEWAYS.map((g) => (
                          <button
                            key={g}
                            onClick={() => setGateway(g)}
                            className={cn(
                              "tag cursor-pointer transition-opacity",
                              `tag-${GATEWAY_HUE[g]}`,
                              gateway === g
                                ? "ring-1 ring-current"
                                : "opacity-55"
                            )}
                          >
                            {GATEWAY_LABEL[g][locale]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {[true, false].map((advance) => (
                        <button
                          key={String(advance)}
                          onClick={() => setAdvanceOnly(advance)}
                          className={cn(
                            "flex-1 rounded-lg border p-2.5 text-left transition-colors",
                            advanceOnly === advance
                              ? "border-primary bg-primary/[0.06]"
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <p className="text-[0.6875rem] font-medium">
                            {advance
                              ? `${pct(30, 0)} ${t("finance.due")}`
                              : t("common.total")}
                          </p>
                          <p className="nums text-[0.625rem] text-muted-foreground">
                            {money(advance ? Math.round(amount * 0.3) : amount)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <dl className="flex flex-col gap-1.5 text-[0.6875rem]">
                    <Row
                      label={t("common.guardian")}
                      value={customer?.name[locale] ?? "—"}
                    />
                    <Row
                      label={t("common.children")}
                      value={childIds
                        .map(
                          (id) =>
                            data.children.find((c) => c.id === id)?.name[locale]
                        )
                        .join(", ")}
                    />
                    <Row
                      label={t("bookings.stepPackage")}
                      value={pkg?.name[locale] ?? "—"}
                    />
                    <Row
                      label={t("common.date")}
                      value={`${date(when)} · ${num(hour)}:${num(0, {
                        minimumIntegerDigits: 2,
                      })}`}
                    />
                    <Row
                      label={t("payments.gateway")}
                      value={GATEWAY_LABEL[gateway][locale]}
                    />
                    <Row label={t("common.total")} value={money(amount)} />
                    <Row label={t("gate.payable")} value={money(payable)} />
                  </dl>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft />
                {t("common.back")}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  size="sm"
                  className="ml-auto"
                  disabled={!canAdvance}
                  onClick={() => setStep((s) => s + 1)}
                >
                  {t("common.next")}
                  <ArrowRight />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={confirm}
                  disabled={!!ref}
                >
                  <PartyPopper />
                  {t("bookings.confirmBooking")}
                </Button>
              )}
            </div>
          </Panel>

          <Panel title={t("bookings.stepReview")} delay={0.05}>
            <dl className="flex flex-col gap-1.5 text-[0.6875rem]">
              <Row
                label={t("common.branch")}
                value={data.branch.name[locale]}
              />
              <Row
                label={t("common.guardian")}
                value={customer?.name[locale] ?? "—"}
              />
              <Row
                label={t("bookings.heads")}
                value={pkg ? num(pkg.heads) : num(childIds.length)}
              />
              <Row label={t("common.date")} value={date(when)} />
            </dl>

            <div className="mt-3 rounded-lg bg-surface p-2.5 ring-1 ring-foreground/[0.06]">
              <div className="flex items-baseline justify-between text-[0.6875rem]">
                <span className="text-muted-foreground">
                  {t("common.total")}
                </span>
                <span className="nums font-medium">{money(amount)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-[var(--hairline)] pt-2">
                <span className="text-[0.6875rem] font-medium">
                  {t("gate.payable")}
                </span>
                <span className="figure text-lg leading-none">
                  {money(payable)}
                </span>
              </div>
            </div>

            {ref ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-lg p-2.5 text-center text-[0.6875rem]"
                style={{
                  background:
                    "color-mix(in oklch, var(--success) 11%, transparent)",
                  color: "var(--success)",
                }}
              >
                {t("bookings.bookingConfirmed", { ref })}
              </motion.div>
            ) : null}

            <p className="nums mt-3 text-[0.5625rem] text-muted-foreground">
              {isoDay(when)}
            </p>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="nums min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  )
}
