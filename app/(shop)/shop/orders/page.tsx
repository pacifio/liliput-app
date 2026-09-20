"use client"

import Link from "next/link"
import { ArrowUpRight, Nfc, Receipt, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { QrCode } from "@/components/shop/qr-code"
import { Price, SectionTitle, ShopButton, ShopCard } from "@/components/shop/ui"
import { StatusTag } from "@/components/motion/status-tag"
import { useMounted } from "@/hooks/use-mounted"
import { useBranch, useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { GATEWAY_LABEL } from "@/lib/labels"
import { useLocale } from "@/lib/i18n/provider"
import { ordersForBranch, useLive } from "@/lib/live"
import { lineLabel, linePayable } from "@/lib/shop"

export default function OrdersPage() {
  const { t, locale, num, relative } = useLocale()
  const data = useDataset()
  const branch = useBranch()
  const orders = useLive((s) => s.orders)
  const reset = useLive((s) => s.reset)
  const mounted = useMounted()

  const rows = mounted ? ordersForBranch(orders, branch.id) : []

  if (!rows.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Receipt className="size-5" />
        </span>
        <p className="text-sm font-medium">{t("shop.ordersEmpty")}</p>
        <p className="max-w-[36ch] text-[0.8125rem] text-muted-foreground">
          {t("shop.ordersEmptyHint")}
        </p>
        <Link href="/shop" className="mt-1">
          <ShopButton variant="outline">
            {t("shop.continueShopping")}
          </ShopButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      <SectionTitle
        title={t("shop.ordersTitle")}
        subtitle={t("shop.ordersSubtitle")}
        action={
          <ShopButton
            size="sm"
            variant="ghost"
            onClick={() => {
              reset()
              toast.success(t("shop.resetDone"), {
                description: t("shop.resetDemoHint"),
              })
            }}
          >
            <RotateCcw />
            {t("shop.resetDemo")}
          </ShopButton>
        }
      />

      {rows.map((order, index) => {
        const ticketBooking = order.bookings.find((b) => b.kind === "ticket")
        return (
          <ShopCard key={order.id} delay={index * 0.05} className="p-5">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="nums font-mono text-[0.8125rem] font-medium">
                    {order.ref}
                  </span>
                  <StatusTag hue="green" dot>
                    {t("common.paid")}
                  </StatusTag>
                </div>
                <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                  {t("shop.placedAt", { time: relative(order.at) })} ·{" "}
                  {GATEWAY_LABEL[order.gateway][locale]}
                </p>
              </div>
              <Price amount={order.total} className="text-lg" />
            </div>

            <ul className="mt-4 flex flex-col gap-1.5 border-t border-[var(--hairline)] pt-3">
              {order.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-baseline justify-between gap-2 text-[0.8125rem]"
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {lineLabel(line, data)[locale]}
                    {line.qty > 1 ? ` ×${num(line.qty)}` : ""}
                  </span>
                  <Price amount={linePayable(line)} className="shrink-0" />
                </li>
              ))}
            </ul>

            {/* The two artefacts that carry over to the operator console. */}
            {ticketBooking ? (
              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-foreground/[0.06]">
                <QrCode value={ticketBooking.ref} size={120} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8125rem] font-medium">
                    {t("shop.showAtGate")}
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                    {t("shop.gateHint")}
                  </p>
                  <p className="nums mt-2 font-mono text-sm font-medium tracking-wider">
                    {ticketBooking.ref}
                  </p>
                  <Link href="/gate/scan" className="mt-3 inline-block">
                    <ShopButton size="sm" variant="outline">
                      {t("shop.seeInConsole")}
                      <ArrowUpRight />
                    </ShopButton>
                  </Link>
                </div>
              </div>
            ) : null}

            {order.memberships.map((membership) => {
              const plan = data.plans.find((p) => p.id === membership.planId)
              const tint = plan ? HUE_VAR[plan.hue] : "var(--primary)"
              return (
                <div
                  key={membership.id}
                  className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl p-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in oklch, ${tint} 44%, oklch(0.17 0.015 40)), oklch(0.15 0.012 40))`,
                  }}
                >
                  <Nfc className="size-6 shrink-0 opacity-85" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8125rem] font-medium">
                      {t("shop.cardIssued")} · {plan?.name[locale]}
                    </p>
                    <p className="mt-1 text-[0.6875rem] opacity-80">
                      {t("shop.cardHint")}
                    </p>
                    <p className="nums mt-2 font-mono text-base tracking-widest">
                      {membership.cardUid}
                    </p>
                  </div>
                  <Link href="/memberships/cards">
                    <ShopButton
                      size="sm"
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                    >
                      {t("shop.seeInConsole")}
                      <ArrowUpRight />
                    </ShopButton>
                  </Link>
                </div>
              )
            })}
          </ShopCard>
        )
      })}
    </div>
  )
}
