"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { Price, SectionTitle, ShopButton, ShopCard } from "@/components/shop/ui"
import { useMounted } from "@/hooks/use-mounted"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { useLive } from "@/lib/live"
import { cartTotals, lineLabel, linePayable } from "@/lib/shop"

export default function CartPage() {
  const { t, locale, num, money, date } = useLocale()
  const data = useDataset()
  const cart = useLive((s) => s.cart)
  const setQty = useLive((s) => s.setQty)
  const removeLine = useLive((s) => s.removeLine)
  const mounted = useMounted()

  const lines = mounted ? cart : []
  const totals = cartTotals(lines)

  if (!lines.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShoppingCart className="size-5" />
        </span>
        <p className="text-sm font-medium">{t("shop.cartEmpty")}</p>
        <p className="max-w-[34ch] text-[0.8125rem] text-muted-foreground">
          {t("shop.cartEmptyHint")}
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
      <SectionTitle title={t("shop.cart")} />

      <ShopCard>
        <ul className="divide-y divide-[var(--hairline)]">
          <AnimatePresence initial={false}>
            {lines.map((line) => {
              const label = lineLabel(line, data)
              const gross = line.unitPrice * line.qty
              const payable = linePayable(line)
              return (
                <motion.li
                  key={line.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-medium">
                      {label[locale]}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                      <Price amount={line.unitPrice} suffix={t("shop.each")} />
                      {line.date ? (
                        <>
                          {" · "}
                          {date(new Date(`${line.date}T00:00:00.000Z`))}
                        </>
                      ) : null}
                      {line.startHour !== undefined ? (
                        <>
                          {" · "}
                          <span className="nums">
                            {num(line.startHour)}:
                            {num(0, { minimumIntegerDigits: 2 })}
                          </span>
                        </>
                      ) : null}
                    </p>
                    {payable < gross ? (
                      <p className="mt-0.5 text-[0.625rem] text-[var(--warning)]">
                        {t("shop.advanceNote")}
                      </p>
                    ) : null}
                  </div>

                  {line.kind === "party" ||
                  line.kind === "membership" ? null : (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <ShopButton
                        size="sm"
                        variant="outline"
                        className="w-8 px-0"
                        onClick={() => setQty(line.id, line.qty - 1)}
                      >
                        <Minus />
                      </ShopButton>
                      <span className="nums w-6 text-center text-[0.8125rem]">
                        {num(line.qty)}
                      </span>
                      <ShopButton
                        size="sm"
                        variant="outline"
                        className="w-8 px-0"
                        onClick={() => setQty(line.id, line.qty + 1)}
                      >
                        <Plus />
                      </ShopButton>
                    </div>
                  )}

                  <Price
                    amount={payable}
                    className="w-20 shrink-0 text-right text-[0.8125rem]"
                  />

                  <button
                    onClick={() => removeLine(line.id)}
                    aria-label={t("shop.remove")}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </ShopCard>

      <ShopCard className="p-5" delay={0.05}>
        <div className="flex items-baseline justify-between text-[0.8125rem]">
          <span className="text-muted-foreground">{t("shop.subtotal")}</span>
          <span className="nums">{money(totals.gross)}</span>
        </div>
        {totals.vat > 0 ? (
          <div className="mt-1.5 flex items-baseline justify-between text-[0.8125rem]">
            <span className="text-muted-foreground">{t("common.vat")}</span>
            <span className="nums">{money(totals.vat)}</span>
          </div>
        ) : null}
        {totals.deposit > 0 ? (
          <div className="mt-1.5 flex items-baseline justify-between text-[0.8125rem]">
            <span className="text-muted-foreground">
              {t("shop.advanceNote")}
            </span>
            <span className="nums text-[var(--warning)]">
              − {money(totals.deposit)}
            </span>
          </div>
        ) : null}
        <div className="mt-3 flex items-baseline justify-between border-t border-[var(--hairline)] pt-3">
          <span className="text-sm font-medium">{t("shop.total")}</span>
          <span className="figure text-2xl leading-none">
            {money(totals.payable)}
          </span>
        </div>
        <Link href="/shop/checkout" className="mt-4 block">
          <ShopButton className="w-full">{t("shop.checkout")}</ShopButton>
        </Link>
      </ShopCard>
    </div>
  )
}
