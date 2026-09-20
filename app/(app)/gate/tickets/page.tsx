"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check, Minus, Plus, Printer, Ticket } from "lucide-react"
import { toast } from "sonner"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"
import type { Gateway } from "@/lib/types"
import { cn } from "@/lib/utils"

const COUNTER_GATEWAYS: Gateway[] = ["cash", "bkash", "nagad", "card"]

export default function TicketCounterPage() {
  const { t, locale, num, money, digits } = useLocale()
  const data = useDataset()
  const offline = useUi((s) => s.offlineMode)
  const enqueueSync = useUi((s) => s.enqueueSync)

  const [qty, setQty] = React.useState<Record<string, number>>({})
  const [gateway, setGateway] = React.useState<Gateway>("cash")
  const [memberCode, setMemberCode] = React.useState("")
  const [lastRef, setLastRef] = React.useState<string | null>(null)

  const member = React.useMemo(
    () =>
      memberCode.trim()
        ? data.memberships.find(
            (m) =>
              m.cardUid.replace(/\s/g, "").toUpperCase() ===
              memberCode.replace(/\s/g, "").toUpperCase()
          )
        : undefined,
    [memberCode, data.memberships]
  )
  const plan = member
    ? data.plans.find((p) => p.id === member.planId)
    : undefined

  const lines = data.slabs
    .map((slab) => ({ slab, qty: qty[slab.id] ?? 0 }))
    .filter((line) => line.qty > 0)

  const subtotal = lines.reduce(
    (sum, line) => sum + line.slab.basePrice * line.qty,
    0
  )
  const discount = plan ? Math.round((subtotal * plan.discountPct) / 100) : 0
  const total = subtotal - discount

  const bump = (id: string, delta: number) =>
    setQty((state) => ({
      ...state,
      [id]: Math.max(0, (state[id] ?? 0) + delta),
    }))

  function complete() {
    if (!lines.length) return
    const ref = `${data.branch.initials}${Math.floor(10000 + Math.random() * 89999)}`
    setLastRef(ref)
    setQty({})
    setMemberCode("")
    if (offline) {
      enqueueSync(1)
      toast.success(t("pos.saleComplete", { ref }), {
        description: t("pos.saleQueued"),
      })
    } else {
      toast.success(t("pos.saleComplete", { ref }), {
        description: money(total),
      })
    }
  }

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("gate.ticketsTitle")}
        subtitle={t("gate.ticketsSubtitle")}
      />

      <div className="grid gap-3 px-5 pb-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title={t("membership.plansTitle")} delay={0}>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.slabs.map((slab, index) => {
              const count = qty[slab.id] ?? 0
              return (
                <motion.div
                  key={slab.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: index * 0.04 }}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg bg-surface p-3 ring-1 transition-colors",
                    count > 0 ? "ring-primary/40" : "ring-foreground/[0.06]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[0.6875rem] font-medium">
                        {slab.name[locale]}
                      </p>
                      <p className="nums text-[0.5625rem] text-muted-foreground">
                        {num(slab.includedMinutes)} {t("common.minutes")} ·{" "}
                        {money(slab.overtimePrice)}/{num(slab.overtimeBlock)}
                      </p>
                    </div>
                    <StatusTag hue={slab.hue}>
                      {money(slab.basePrice)}
                    </StatusTag>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon-xs"
                      variant="outline"
                      onClick={() => bump(slab.id, -1)}
                      disabled={count === 0}
                    >
                      <Minus />
                    </Button>
                    <span className="nums w-7 text-center text-[0.6875rem] font-medium">
                      {num(count)}
                    </span>
                    <Button
                      size="icon-xs"
                      variant="outline"
                      onClick={() => bump(slab.id, 1)}
                    >
                      <Plus />
                    </Button>
                    <span className="nums ml-auto text-[0.6875rem] font-medium">
                      {money(slab.basePrice * count)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Panel>

        <Panel title={t("pos.cart")} delay={0.05}>
          <div className="mb-3">
            <p className="micro mb-1.5">{t("pos.attachMember")}</p>
            <input
              value={memberCode}
              onChange={(event) =>
                setMemberCode(event.target.value.toUpperCase())
              }
              placeholder="04 A2 7F 3B"
              className="nums h-7 w-full rounded-full border border-border bg-card px-3 text-[0.6875rem] tracking-wider outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            {plan ? (
              <p className="mt-1.5 flex items-center gap-1 text-[0.625rem] text-[var(--success)]">
                <Check className="size-3" />
                {t("membership.discountOnOutlets", {
                  pct: num(plan.discountPct),
                })}
              </p>
            ) : null}
          </div>

          {lines.length ? (
            <ul className="flex flex-col">
              {lines.map((line) => (
                <li
                  key={line.slab.id}
                  className="flex items-baseline justify-between gap-2 border-b border-[var(--hairline)] py-1.5 text-[0.6875rem] last:border-0"
                >
                  <span className="min-w-0 truncate">
                    {line.slab.name[locale]}
                    <span className="nums ml-1 text-muted-foreground">
                      ×{num(line.qty)}
                    </span>
                  </span>
                  <span className="nums shrink-0 font-medium">
                    {money(line.slab.basePrice * line.qty)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[0.625rem] text-muted-foreground">
              {t("pos.cartEmptyHint")}
            </p>
          )}

          <div className="mt-3 rounded-lg bg-surface p-2.5 ring-1 ring-foreground/[0.06]">
            <Row label={t("common.subtotal")} value={money(subtotal)} />
            {discount ? (
              <Row
                label={t("gate.memberDiscount")}
                value={`− ${money(discount)}`}
                tone="var(--success)"
              />
            ) : null}
            <div className="mt-2 flex items-baseline justify-between border-t border-[var(--hairline)] pt-2">
              <span className="text-[0.6875rem] font-medium">
                {t("gate.payable")}
              </span>
              <span className="figure text-lg leading-none">
                {money(total)}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="micro mb-1.5">{t("payments.gateway")}</p>
            <div className="flex flex-wrap gap-1.5">
              {COUNTER_GATEWAYS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGateway(g)}
                  className={cn(
                    "tag",
                    `tag-${GATEWAY_HUE[g]}`,
                    "cursor-pointer transition-opacity",
                    gateway === g ? "ring-1 ring-current" : "opacity-60"
                  )}
                >
                  {GATEWAY_LABEL[g][locale]}
                </button>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            className="mt-3 w-full"
            onClick={complete}
            disabled={!lines.length}
          >
            <Ticket />
            {t("pos.charge", { amount: money(total) })}
          </Button>

          {lastRef ? (
            <div className="mt-3 rounded-lg border border-dashed border-border p-2.5">
              <p className="micro mb-1">{t("gate.receipt")}</p>
              <p className="nums font-mono text-[0.625rem]">
                {digits(lastRef)}
              </p>
              <Button size="xs" variant="outline" className="mt-2">
                <Printer />
                {t("gate.printReceipt")}
              </Button>
            </div>
          ) : null}
        </Panel>
      </div>
    </ScrollFade>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 text-[0.6875rem]">
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="nums shrink-0 font-medium" style={{ color: tone }}>
        {value}
      </span>
    </div>
  )
}
