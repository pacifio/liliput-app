"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { AlertTriangle, Check, HeartHandshake, RotateCcw } from "lucide-react"
import { toast } from "sonner"

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
import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

const LIMITS = [120, 180, 240, 360]

export default function DaycareCheckinPage() {
  const { t, locale, num, money, time } = useLocale()
  const data = useDataset()
  const lookups = useLookups()

  const [typed, setTyped] = React.useState("")
  const [limit, setLimit] = React.useState(180)
  const [carerId, setCarerId] = React.useState<string | null>(null)
  const [checked, setChecked] = React.useState<string[]>([])

  const carers = data.staff.filter(
    (s) => s.department === "daycare" && s.status === "active"
  )

  // Children are looked up by their guardian's phone at the day-care desk —
  // the guardian is the one standing there, not the child.
  const resolve = React.useCallback(
    (code: string) => {
      const needle = code.replace(/\D/g, "")
      const customer = data.customers.find((c) =>
        c.phone.replace(/\D/g, "").endsWith(needle.slice(-6))
      )
      if (!customer) return undefined
      const kids = data.children.filter((c) => c.guardianId === customer.id)
      return kids.length ? { customer, kids } : undefined
    },
    [data.customers, data.children]
  )

  const scanner = useScan(resolve)
  const found = scanner.result
  const rate = 260

  function commit(childId: string) {
    const child = lookups.child.get(childId)
    setChecked((state) => [...state, childId])
    toast.success(t("daycare.checkIn"), {
      description: `${child?.name[locale]} · ${num(limit)} ${t("common.minutes")}`,
    })
  }

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("daycare.checkinTitle")}
        subtitle={t("daycare.checkinSubtitle")}
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            scanner.reset()
            setTyped("")
            setChecked([])
          }}
        >
          <RotateCcw />
          {t("common.reset")}
        </Button>
      </PageHeader>

      <div className="grid items-start gap-3 px-5 pb-6 lg:grid-cols-[1fr_1fr]">
        <Panel title={t("common.guardian")} delay={0}>
          <ScanTarget
            icon={HeartHandshake}
            stage={scanner.stage}
            title={t("daycare.checkinTitle")}
            hint={t("daycare.checkinSubtitle")}
            detectLabel={t("gate.scanning")}
            verifyLabel={t("gate.verifying")}
          />
          <div className="mt-3">
            <ScanInput
              value={typed}
              onChange={setTyped}
              onSubmit={() => scanner.scan(typed)}
              placeholder="01XXXXXXXXX"
              action={t("common.search")}
              disabled={scanner.busy}
            />
          </div>
          <div className="mt-4">
            <ScanPicker
              label={t("common.guardian")}
              items={data.customers.slice(0, 6).map((c) => ({
                code: c.phone,
                primary: c.name[locale],
                secondary: c.area[locale],
              }))}
              onPick={(code) => {
                setTyped(code)
                scanner.scan(code)
              }}
            />
          </div>
        </Panel>

        <Panel title={t("common.children")} delay={0.05}>
          <AnimatePresence mode="wait">
            {scanner.stage !== "resolved" ? (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-[0.6875rem] text-muted-foreground"
              >
                {t("daycare.checkinSubtitle")}
              </motion.p>
            ) : found ? (
              <motion.div
                key={found.customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24 }}
              >
                <div className="rounded-lg bg-surface p-3 ring-1 ring-foreground/[0.06]">
                  <p className="text-xs font-medium">
                    {found.customer.name[locale]}
                  </p>
                  <p className="nums text-[0.625rem] text-muted-foreground">
                    {found.customer.phone} · {found.customer.area[locale]}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="micro mb-1.5">{t("daycare.limit")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LIMITS.map((value) => (
                      <button
                        key={value}
                        onClick={() => setLimit(value)}
                        className={cn(
                          "nums h-6 rounded-full border px-2.5 text-[0.625rem] transition-colors",
                          limit === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/60"
                        )}
                      >
                        {num(value)} {t("common.minutes")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="micro mb-1.5">{t("daycare.caregiver")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {carers.slice(0, 6).map((carer) => (
                      <button
                        key={carer.id}
                        onClick={() => setCarerId(carer.id)}
                        className={cn(
                          "h-6 rounded-full border px-2.5 text-[0.625rem] transition-colors",
                          carerId === carer.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/60"
                        )}
                      >
                        {carer.name[locale]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="micro mb-1.5">{t("common.children")}</p>
                  <ul className="flex flex-col gap-1.5">
                    {found.kids.map((child) => {
                      const done = checked.includes(child.id)
                      return (
                        <li
                          key={child.id}
                          className="flex items-center gap-2 rounded-lg bg-card p-2.5 ring-1 ring-foreground/[0.06]"
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
                            {child.allergies.length ? (
                              <p className="mt-0.5 flex items-center gap-1 text-[0.5625rem] text-[var(--warning)]">
                                <AlertTriangle className="size-2.5" />
                                {t("daycare.allergyAlert", {
                                  list: child.allergies
                                    .map((a) => a[locale])
                                    .join(", "),
                                })}
                              </p>
                            ) : null}
                          </div>
                          {done ? (
                            <StatusTag hue="green" dot>
                              {t("daycare.inCare")}
                            </StatusTag>
                          ) : (
                            <Button
                              size="xs"
                              disabled={!carerId}
                              onClick={() => commit(child.id)}
                            >
                              <Check />
                              {t("daycare.checkIn")}
                            </Button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="mt-3 rounded-lg bg-surface p-2.5 text-[0.6875rem] ring-1 ring-foreground/[0.06]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">
                      {t("daycare.rate")}
                    </span>
                    <span className="nums font-medium">
                      {money(rate)} {t("common.perHour")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-muted-foreground">
                      {t("daycare.pickupDue", { minutes: num(limit) })}
                    </span>
                    <span className="nums font-medium">
                      {time(demoNow() + limit * 60_000)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="miss"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center text-[0.6875rem] text-muted-foreground"
              >
                {t("gate.notFound")}
              </motion.p>
            )}
          </AnimatePresence>
        </Panel>
      </div>
    </ScrollFade>
  )
}
