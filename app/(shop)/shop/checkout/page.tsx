"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import {
  Price,
  SectionTitle,
  ShopButton,
  ShopCard,
  ShopField,
} from "@/components/shop/ui"
import { useMounted } from "@/hooks/use-mounted"
import { useAccount } from "@/lib/account"
import { useDataset } from "@/lib/data"
import { GATEWAY_HUE, GATEWAY_LABEL } from "@/lib/labels"
import { useLocale } from "@/lib/i18n/provider"
import { useLive } from "@/lib/live"
import { buildOrder, cartTotals, lineLabel, linePayable } from "@/lib/shop"
import type { Gateway } from "@/lib/types"
import { cn } from "@/lib/utils"

const GATEWAYS: Gateway[] = ["bkash", "nagad", "rocket", "card", "sslcommerz"]

export default function CheckoutPage() {
  const { t, locale, money } = useLocale()
  const data = useDataset()
  const router = useRouter()
  const mounted = useMounted()

  const cart = useLive((s) => s.cart)
  const profile = useLive((s) => s.profile)
  const setProfile = useLive((s) => s.setProfile)
  const placeOrder = useLive((s) => s.placeOrder)
  const session = useAccount((s) => s.session)

  const [gateway, setGateway] = React.useState<Gateway>("bkash")
  const [busy, setBusy] = React.useState(false)

  const lines = mounted ? cart : []
  const totals = cartTotals(lines)
  const ready =
    profile.name.trim().length > 1 && profile.phone.trim().length > 8

  React.useEffect(() => {
    if (mounted && !cart.length && !busy) router.replace("/shop/cart")
  }, [mounted, cart.length, busy, router])

  function pay() {
    if (!ready || !lines.length) return
    setBusy(true)
    // A short delay so the gateway hand-off reads as a real redirect.
    window.setTimeout(() => {
      const order = buildOrder({
        cart: lines,
        data,
        profile,
        gateway,
        customerId: session?.customerId,
      })
      placeOrder(order)
      toast.success(t("shop.orderPlaced", { ref: order.ref }), {
        description: t("shop.orderPlacedHint"),
      })
      router.push("/shop/orders")
    }, 1100)
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      <SectionTitle title={t("shop.checkoutTitle")} />

      <div className="grid gap-5 @3xl:grid-cols-[1.2fr_1fr] @3xl:items-start">
        <div className="flex flex-col gap-5">
          <ShopCard className="p-5">
            <p className="micro mb-3">{t("shop.yourDetails")}</p>
            <div className="flex flex-col gap-3">
              <ShopField
                label={t("shop.fullName")}
                value={profile.name}
                onChange={(name) => setProfile({ name })}
                placeholder="নুসরাত জাহান"
              />
              <ShopField
                label={t("shop.phone")}
                value={profile.phone}
                onChange={(phone) => setProfile({ phone })}
                placeholder="01712345678"
                inputMode="tel"
              />
              <ShopField
                label={`${t("shop.email")} · ${t("common.optional")}`}
                value={profile.email}
                onChange={(email) => setProfile({ email })}
                placeholder="you@example.com"
                inputMode="email"
              />
            </div>
          </ShopCard>

          <ShopCard className="p-5" delay={0.05}>
            <p className="micro mb-3">{t("shop.payWith")}</p>
            <div className="grid gap-2 @sm:grid-cols-2">
              {GATEWAYS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGateway(g)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors",
                    gateway === g
                      ? "border-primary bg-primary/[0.06]"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: `var(--hue-${GATEWAY_HUE[g]})` }}
                  />
                  <span className="text-[0.8125rem] font-medium">
                    {GATEWAY_LABEL[g][locale]}
                  </span>
                </button>
              ))}
            </div>
          </ShopCard>
        </div>

        <ShopCard className="p-5" delay={0.1}>
          <p className="micro mb-3">{t("shop.cart")}</p>
          {lines.length ? (
            <ul className="flex flex-col gap-2">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-baseline justify-between gap-2 text-[0.8125rem]"
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {lineLabel(line, data)[locale]}
                    {line.qty > 1 ? ` ×${line.qty}` : ""}
                  </span>
                  <Price amount={linePayable(line)} className="shrink-0" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 py-6 text-[0.8125rem] text-muted-foreground">
              <ShoppingCart className="size-4" />
              {t("shop.cartEmpty")}
            </p>
          )}

          {totals.vat > 0 ? (
            <div className="mt-3 flex items-baseline justify-between text-[0.8125rem]">
              <span className="text-muted-foreground">{t("common.vat")}</span>
              <span className="nums">{money(totals.vat)}</span>
            </div>
          ) : null}

          <div className="mt-4 flex items-baseline justify-between border-t border-[var(--hairline)] pt-3">
            <span className="text-sm font-medium">{t("shop.total")}</span>
            <span className="figure text-2xl leading-none">
              {money(totals.payable)}
            </span>
          </div>

          <ShopButton
            className="mt-4 w-full"
            disabled={!ready || busy || !lines.length}
            onClick={pay}
          >
            {busy ? <Loader2 className="animate-spin" /> : null}
            {busy
              ? t("shop.paying")
              : t("shop.payNow", { amount: money(totals.payable) })}
          </ShopButton>

          <p className="mt-2 text-center text-[0.625rem] text-muted-foreground">
            {t("shell.demoNotice")}
          </p>
        </ShopCard>
      </div>
    </div>
  )
}
