"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Check,
  CreditCard,
  Minus,
  Plus,
  Printer,
  Receipt,
  Trash2,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { demoNow } from "@/lib/demo-time"
import { DEVICE_LABEL, GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"
import type { Gateway, Product } from "@/lib/types"
import { cn } from "@/lib/utils"

const TENDERS: Gateway[] = ["cash", "bkash", "nagad", "card", "sslcommerz"]

export default function PosPage() {
  const { t, locale, num, money, time, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const offline = useUi((s) => s.offlineMode)
  const enqueueSync = useUi((s) => s.enqueueSync)

  const [outletId, setOutletId] = React.useState(data.outlets[0].id)
  const [category, setCategory] = React.useState<string>("all")
  const [cart, setCart] = React.useState<Record<string, number>>({})
  const [memberCode, setMemberCode] = React.useState("")
  const [splits, setSplits] = React.useState<Partial<Record<Gateway, number>>>(
    {}
  )
  const [done, setDone] = React.useState<{
    ref: string
    at: number
    total: number
    queued: boolean
  } | null>(null)

  React.useEffect(() => {
    setCategory("all")
  }, [outletId])

  const outlet = lookups.outlet.get(outletId) ?? data.outlets[0]
  const products = data.products.filter((p) => p.outletId === outletId)
  const categories = [
    ...new Map(products.map((p) => [p.category.en, p.category])).values(),
  ]
  const visible =
    category === "all"
      ? products
      : products.filter((p) => p.category.en === category)

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: lookups.product.get(id), qty }))
    .filter(
      (l): l is { product: Product; qty: number } => !!l.product && l.qty > 0
    )

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)

  const membership = memberCode.trim()
    ? data.memberships.find(
        (m) =>
          m.cardUid.replace(/\s/g, "").toUpperCase() ===
          memberCode.replace(/\s/g, "").toUpperCase()
      )
    : undefined
  const plan = membership
    ? data.plans.find((p) => p.id === membership.planId)
    : undefined
  const customer = membership
    ? lookups.customer.get(membership.customerId)
    : undefined

  const discount = plan ? Math.round((subtotal * plan.discountPct) / 100) : 0
  const vat = Math.round((subtotal - discount) * 0.06)
  const total = subtotal - discount + vat
  const tendered = Object.values(splits).reduce((sum, v) => sum + (v ?? 0), 0)
  const change = Math.max(0, tendered - total)

  const bump = (id: string, delta: number) =>
    setCart((state) => {
      const next = Math.max(0, (state[id] ?? 0) + delta)
      const copy = { ...state }
      if (next === 0) delete copy[id]
      else copy[id] = next
      return copy
    })

  function complete() {
    if (!lines.length) return
    const ref = `${data.branch.initials}${Math.floor(90000 + Math.random() * 9999)}`
    setDone({ ref, at: demoNow(), total, queued: offline })
    setCart({})
    setSplits({})
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

  // One chip per kind — the operator needs to see the printer, the drawer and
  // the scanner, not the first three printers in the register.
  const devices = (["printer", "drawer", "scanner"] as const)
    .map((kind) => data.devices.find((d) => d.kind === kind))
    .filter((d): d is NonNullable<typeof d> => !!d)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("pos.title")}
        subtitle={t("pos.subtitle", {
          outlet: outlet.name[locale],
          terminal: outlet.terminalId,
        })}
      >
        <div className="flex items-center gap-1.5">
          {devices.map((device) => (
            <span
              key={device.id}
              title={`${DEVICE_LABEL[device.kind][locale]} · ${device.model}`}
              className={cn(
                "flex h-6 items-center gap-1 rounded-full px-2 text-[0.5625rem]",
                device.state === "online"
                  ? "bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-[var(--success)]"
                  : device.state === "degraded"
                    ? "bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-[var(--warning)]"
                    : "bg-destructive/10 text-destructive"
              )}
            >
              <span className="size-1 rounded-full bg-current" />
              {DEVICE_LABEL[device.kind][locale]}
            </span>
          ))}
        </div>
      </PageHeader>

      <div className="grid min-h-0 flex-1 gap-3 px-5 pb-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Products */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="flex shrink-0 items-center gap-1.5 border-b border-[var(--hairline)] px-3 py-2">
            {data.outlets.map((o) => (
              <button
                key={o.id}
                onClick={() => setOutletId(o.id)}
                className={cn(
                  "h-6 rounded-full px-2.5 text-[0.625rem] transition-colors",
                  o.id === outletId
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {o.name[locale]}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--hairline)] px-3 py-2">
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "h-5 rounded-full border px-2 text-[0.5625rem] transition-colors",
                category === "all"
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {t("common.all")}
            </button>
            {categories.map((c) => (
              <button
                key={c.en}
                onClick={() => setCategory(c.en)}
                className={cn(
                  "h-5 rounded-full border px-2 text-[0.5625rem] transition-colors",
                  category === c.en
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {c[locale]}
              </button>
            ))}
          </div>

          <ScrollFade className="min-h-0 flex-1 p-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product, index) => (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index, 14) * 0.02,
                  }}
                  onClick={() => bump(product.id, 1)}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg bg-surface p-2.5 text-left ring-1 transition-colors",
                    cart[product.id]
                      ? "ring-primary/40"
                      : "ring-foreground/[0.06] hover:bg-muted/50",
                    product.stock === 0 && "opacity-40"
                  )}
                >
                  <p className="line-clamp-2 text-[0.6875rem] font-medium">
                    {product.name[locale]}
                  </p>
                  <p className="nums font-mono text-[0.5rem] text-muted-foreground">
                    {digits(product.sku)}
                  </p>
                  <div className="mt-auto flex items-baseline justify-between pt-1">
                    <span className="nums text-[0.6875rem] font-medium">
                      {money(product.price)}
                    </span>
                    {cart[product.id] ? (
                      <span className="nums rounded-full bg-primary px-1.5 text-[0.5625rem] text-primary-foreground">
                        {num(cart[product.id])}
                      </span>
                    ) : (
                      <span className="nums text-[0.5rem] text-muted-foreground">
                        {num(product.stock)}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollFade>
        </div>

        {/* Cart */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3">
            <span className="text-xs font-medium">{t("pos.cart")}</span>
            {lines.length ? (
              <span className="nums rounded-full bg-primary/12 px-1.5 text-[0.5625rem] text-primary">
                {num(lines.reduce((s, l) => s + l.qty, 0))}
              </span>
            ) : null}
            <Button
              size="icon-xs"
              variant="ghost"
              className="ml-auto"
              onClick={() => setCart({})}
              disabled={!lines.length}
            >
              <Trash2 />
            </Button>
          </div>

          <ScrollFade className="min-h-0 flex-1 px-3">
            <div className="py-2.5">
              <input
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
                placeholder={t("pos.attachMember")}
                className="nums h-7 w-full rounded-full border border-border bg-surface px-3 text-[0.6875rem] tracking-wider outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <AnimatePresence>
                {plan && customer ? (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-[0.625rem] text-[var(--success)]"
                  >
                    <Check className="size-3 shrink-0" />
                    {t("pos.memberAttached", {
                      name: customer.name[locale],
                      pct: num(plan.discountPct),
                    })}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            {lines.length ? (
              <ul className="flex flex-col">
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <motion.li
                      key={line.product.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.6875rem]">
                          {line.product.name[locale]}
                        </p>
                        <p className="nums text-[0.5625rem] text-muted-foreground">
                          {money(line.product.price)}
                        </p>
                      </div>
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => bump(line.product.id, -1)}
                      >
                        <Minus />
                      </Button>
                      <span className="nums w-6 text-center text-[0.6875rem]">
                        {num(line.qty)}
                      </span>
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => bump(line.product.id, 1)}
                      >
                        <Plus />
                      </Button>
                      <span className="nums w-16 shrink-0 text-right text-[0.6875rem] font-medium">
                        {money(line.product.price * line.qty)}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="py-10 text-center">
                <p className="text-[0.6875rem] font-medium">
                  {t("pos.cartEmpty")}
                </p>
                <p className="mt-1 text-[0.625rem] text-muted-foreground">
                  {t("pos.cartEmptyHint")}
                </p>
              </div>
            )}

            {done ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="my-3 rounded-lg border border-dashed border-border p-3"
              >
                <p className="micro mb-1.5">{t("pos.receiptPreview")}</p>
                <div className="font-mono text-[0.5625rem] leading-relaxed">
                  <p className="font-medium">{data.branch.name[locale]}</p>
                  <p className="text-muted-foreground">
                    {outlet.name[locale]} · {outlet.terminalId}
                  </p>
                  <p className="nums mt-1">
                    {digits(done.ref)} · {time(done.at)}
                  </p>
                  <p className="nums mt-1 text-sm">{money(done.total)}</p>
                  {done.queued ? (
                    <p className="mt-1 text-[var(--warning)]">
                      {t("pos.saleQueued")}
                    </p>
                  ) : null}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button size="xs" variant="outline">
                    <Printer />
                    {t("gate.printReceipt")}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setDone(null)}
                  >
                    <Receipt />
                    {t("pos.newSale")}
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </ScrollFade>

          <div className="shrink-0 border-t border-[var(--hairline)] p-3">
            <Row label={t("common.subtotal")} value={money(subtotal)} />
            {discount ? (
              <Row
                label={t("gate.memberDiscount")}
                value={`− ${money(discount)}`}
                tone="var(--success)"
              />
            ) : null}
            <Row label={t("common.vat")} value={money(vat)} />
            <div className="mt-2 flex items-baseline justify-between border-t border-[var(--hairline)] pt-2">
              <span className="text-[0.6875rem] font-medium">
                {t("common.total")}
              </span>
              <span className="figure text-xl leading-none">
                {money(total)}
              </span>
            </div>

            <p className="micro mt-3 mb-1.5">{t("pos.splitPayment")}</p>
            <div className="flex flex-wrap gap-1.5">
              {TENDERS.map((g) => {
                const on = splits[g] !== undefined
                return (
                  <button
                    key={g}
                    onClick={() =>
                      setSplits((state) => {
                        const copy = { ...state }
                        if (on) delete copy[g]
                        else {
                          const rest = Math.max(
                            0,
                            total -
                              Object.values(copy).reduce(
                                (s, v) => s + (v ?? 0),
                                0
                              )
                          )
                          copy[g] = rest
                        }
                        return copy
                      })
                    }
                    className={cn(
                      "tag cursor-pointer transition-opacity",
                      `tag-${GATEWAY_HUE[g]}`,
                      on ? "ring-1 ring-current" : "opacity-55"
                    )}
                  >
                    {GATEWAY_LABEL[g][locale]}
                    {on ? (
                      <span className="nums ml-1">{money(splits[g] ?? 0)}</span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            {tendered > 0 ? (
              <div className="mt-2">
                <Row label={t("pos.tendered")} value={money(tendered)} />
                {change > 0 ? (
                  <Row label={t("pos.change")} value={money(change)} />
                ) : null}
              </div>
            ) : null}

            <Button
              size="sm"
              className="mt-3 w-full"
              onClick={complete}
              disabled={!lines.length}
            >
              {tendered >= total && tendered > 0 ? <Wallet /> : <CreditCard />}
              {t("pos.charge", { amount: money(total) })}
            </Button>
          </div>
        </div>
      </div>
    </div>
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
