"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Nfc, RotateCcw, ShieldAlert, X } from "lucide-react"
import { toast } from "sonner"

import { CapacityMeter } from "@/components/motion/capacity-meter"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import {
  ScanInput,
  ScanPicker,
  ScanTarget,
  useScan,
} from "@/components/motion/scan-console"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { demoNow } from "@/lib/demo-time"
import { DAY_MS } from "@/lib/demo-time"
import { useLocale } from "@/lib/i18n/provider"
import type { Membership, TagHue } from "@/lib/types"

const STATUS_HUE: Record<Membership["status"], TagHue> = {
  active: "green",
  expiring: "amber",
  expired: "rose",
  suspended: "slate",
}

export default function NfcCardsPage() {
  const { t, locale, num, money, date, relative } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [decision, setDecision] = React.useState<
    "accepted" | "declined" | null
  >(null)
  const [typed, setTyped] = React.useState("")

  const normalise = (value: string) => value.replace(/\s/g, "").toUpperCase()

  const resolve = React.useCallback(
    (code: string) =>
      data.memberships.find((m) => normalise(m.cardUid) === normalise(code)),
    [data.memberships]
  )

  const scanner = useScan(resolve)
  const membership = scanner.result
  const plan = membership
    ? data.plans.find((p) => p.id === membership.planId)
    : undefined
  const customer = membership
    ? lookups.customer.get(membership.customerId)
    : undefined

  const daysLeft = membership
    ? Math.round((membership.expiresAt - demoNow()) / DAY_MS)
    : 0
  const overLimit =
    membership && plan ? membership.visitsUsed >= plan.visits : false
  const blocked =
    membership &&
    (membership.status === "expired" || membership.status === "suspended")

  // A deliberate spread of outcomes in the picker: the failure paths have to
  // be demonstrable, not just the happy one.
  const sample = React.useMemo(() => {
    const pick = (status: Membership["status"]) =>
      data.memberships.filter((m) => m.status === status).slice(0, 2)
    return [
      ...pick("active"),
      ...pick("expiring"),
      ...pick("expired"),
      ...pick("suspended"),
    ]
  }, [data.memberships])

  function decide(next: "accepted" | "declined") {
    setDecision(next)
    toast[next === "accepted" ? "success" : "error"](
      next === "accepted" ? t("membership.accepted") : t("membership.declined"),
      { description: customer?.name[locale] }
    )
  }

  function reset() {
    scanner.reset()
    setTyped("")
    setDecision(null)
  }

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("membership.cardsTitle")}
        subtitle={t("membership.cardsSubtitle")}
      >
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw />
          {t("common.reset")}
        </Button>
      </PageHeader>

      <div className="grid items-start gap-3 px-5 pb-6 lg:grid-cols-[1fr_1fr]">
        <Panel title={t("membership.tapPrompt")} delay={0}>
          <ScanTarget
            icon={Nfc}
            stage={scanner.stage}
            title={t("membership.tapPrompt")}
            hint={t("membership.tapHint")}
            detectLabel={t("membership.reading")}
            verifyLabel={t("gate.verifying")}
          />
          <div className="mt-3">
            <ScanInput
              value={typed}
              onChange={setTyped}
              onSubmit={() => {
                setDecision(null)
                scanner.scan(typed)
              }}
              placeholder="04 A2 7F 3B"
              action={t("common.search")}
              disabled={scanner.busy}
            />
          </div>
          <div className="mt-4">
            <ScanPicker
              label={t("membership.cardUid")}
              localizeCode={false}
              items={sample.map((m) => ({
                code: m.cardUid,
                primary:
                  lookups.customer.get(m.customerId)?.name[locale] ?? m.cardUid,
                secondary: `${data.plans.find((p) => p.id === m.planId)?.name[locale]} · ${
                  m.status === "active"
                    ? t("membership.statusActive")
                    : m.status === "expiring"
                      ? t("membership.statusExpiring")
                      : m.status === "expired"
                        ? t("membership.statusExpired")
                        : t("membership.statusSuspended")
                }`,
              }))}
              onPick={(code) => {
                setDecision(null)
                setTyped(code)
                scanner.scan(code)
              }}
            />
          </div>
        </Panel>

        <Panel title={t("common.details")} delay={0.05}>
          <AnimatePresence mode="wait">
            {scanner.stage !== "resolved" ? (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-[0.6875rem] text-muted-foreground"
              >
                {t("membership.tapHint")}
              </motion.p>
            ) : membership && plan ? (
              <motion.div
                key={membership.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* The card itself — the object the operator is holding. */}
                <div
                  className="relative overflow-hidden rounded-xl p-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in oklch, var(--chart-1) 88%, black), color-mix(in oklch, var(--chart-3) 78%, black))`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {customer?.name[locale]}
                      </p>
                      <p className="nums mt-0.5 font-mono text-[0.625rem] opacity-75">
                        {membership.cardUid}
                      </p>
                    </div>
                    <Nfc className="size-5 shrink-0 opacity-80" />
                  </div>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-[0.5625rem] uppercase opacity-70">
                        {t("membership.plan")}
                      </p>
                      <p className="text-xs font-medium">{plan.name[locale]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.5625rem] uppercase opacity-70">
                        {t("membership.tier")}
                      </p>
                      <p className="text-xs font-medium capitalize">
                        {membership.tier}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <StatusTag hue={STATUS_HUE[membership.status]} dot>
                    {membership.status === "active"
                      ? t("membership.statusActive")
                      : membership.status === "expiring"
                        ? t("membership.statusExpiring")
                        : membership.status === "expired"
                          ? t("membership.statusExpired")
                          : t("membership.statusSuspended")}
                  </StatusTag>
                  {membership.autoRenew ? (
                    <StatusTag hue="teal">
                      {t("membership.autoRenew")}
                    </StatusTag>
                  ) : null}
                  <span className="nums ml-auto text-[0.625rem] text-muted-foreground">
                    {t("membership.validUntil", {
                      date: date(membership.expiresAt),
                    })}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="micro mb-1.5">{t("membership.validity")}</p>
                    <CapacityMeter
                      value={Math.max(
                        0,
                        Math.min(plan.days, plan.days - daysLeft)
                      )}
                      capacity={plan.days}
                      hue={
                        daysLeft <= 0
                          ? "rose"
                          : daysLeft <= 7
                            ? "amber"
                            : "teal"
                      }
                      sublabel={
                        daysLeft > 0
                          ? t("membership.daysLeft", { count: num(daysLeft) })
                          : t("membership.statusExpired")
                      }
                    />
                  </div>
                  <div>
                    <p className="micro mb-1.5">{t("membership.visits")}</p>
                    <CapacityMeter
                      value={Math.min(membership.visitsUsed, plan.visits)}
                      capacity={plan.visits}
                      hue={overLimit ? "rose" : "blue"}
                      sublabel={t("membership.visitsUsed", {
                        used: num(membership.visitsUsed),
                        total: num(plan.visits),
                      })}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="micro mb-1.5">{t("membership.entitlements")}</p>
                  <ul className="flex flex-col gap-1">
                    {plan.perks.map((perk) => (
                      <li
                        key={perk.en}
                        className="flex items-center gap-1.5 text-[0.6875rem]"
                      >
                        <Check className="size-3 shrink-0 text-[var(--success)]" />
                        {perk[locale]}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="mt-3 flex items-start gap-2 rounded-lg p-2.5 text-[0.625rem]"
                  style={{
                    background: blocked
                      ? "color-mix(in oklch, var(--destructive) 10%, transparent)"
                      : overLimit
                        ? "color-mix(in oklch, var(--warning) 12%, transparent)"
                        : "color-mix(in oklch, var(--success) 11%, transparent)",
                    color: blocked
                      ? "var(--destructive)"
                      : overLimit
                        ? "var(--warning)"
                        : "var(--success)",
                  }}
                >
                  <ShieldAlert className="mt-px size-3 shrink-0" />
                  <span>
                    {membership.status === "expired"
                      ? t("membership.expiredWarning", {
                          time: relative(membership.expiresAt),
                        })
                      : membership.status === "suspended"
                        ? t("membership.suspendedWarning")
                        : overLimit
                          ? t("membership.limitWarning")
                          : t("membership.validOk")}
                  </span>
                </div>

                {decision ? (
                  <p
                    className="mt-3 text-center text-[0.6875rem] font-medium"
                    style={{
                      color:
                        decision === "accepted"
                          ? "var(--success)"
                          : "var(--destructive)",
                    }}
                  >
                    {decision === "accepted"
                      ? t("membership.accepted")
                      : t("membership.declined")}
                  </p>
                ) : (
                  <div className="mt-3 flex gap-1.5">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={blocked}
                      onClick={() => decide("accepted")}
                    >
                      <Check />
                      {t("membership.accept")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => decide("declined")}
                    >
                      <X />
                      {t("membership.decline")}
                    </Button>
                  </div>
                )}

                <p className="nums mt-2 text-center text-[0.5625rem] text-muted-foreground">
                  {plan.name[locale]} · {money(plan.price)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="miss"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-14 text-center"
              >
                <p className="text-xs font-medium">{t("gate.notFound")}</p>
                <p className="nums mt-1 font-mono text-[0.625rem] text-muted-foreground">
                  {scanner.code}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      </div>
    </ScrollFade>
  )
}
