"use client"

import * as React from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import {
  HueWash,
  Price,
  SectionTitle,
  ShopButton,
  ShopCard,
} from "@/components/shop/ui"
import { useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { useLive } from "@/lib/live"
import { cn } from "@/lib/utils"

export default function StorePage() {
  const { t, locale, num } = useLocale()
  const data = useDataset()
  const addLine = useLive((s) => s.addLine)

  const [outletId, setOutletId] = React.useState("all")
  const [query, setQuery] = React.useState("")

  const products = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.products.filter((p) => {
      if (outletId !== "all" && p.outletId !== outletId) return false
      if (!needle) return true
      return (
        p.name.en.toLowerCase().includes(needle) ||
        p.name.bn.includes(query.trim()) ||
        p.sku.toLowerCase().includes(needle)
      )
    })
  }, [data.products, outletId, query])

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      <SectionTitle
        title={t("shop.storeTitle")}
        subtitle={t("shop.storeSubtitle")}
      />

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("common.search")}
            className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-[0.8125rem] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setOutletId("all")}
            className={cn(
              "h-8 shrink-0 rounded-full border px-3.5 text-[0.75rem] transition-colors",
              outletId === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/60"
            )}
          >
            {t("shop.allOutlets")}
          </button>
          {data.outlets.map((outlet) => (
            <button
              key={outlet.id}
              onClick={() => setOutletId(outlet.id)}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3.5 text-[0.75rem] transition-colors",
                outletId === outlet.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/60"
              )}
            >
              {outlet.name[locale]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 @sm:grid-cols-2 @3xl:grid-cols-4">
        {products.map((product, index) => {
          const soldOut = product.stock === 0
          return (
            <ShopCard
              key={product.id}
              delay={Math.min(index, 12) * 0.03}
              className={cn("flex flex-col", soldOut && "opacity-60")}
            >
              <HueWash
                hue={HUE_VAR[product.hue]}
                className="flex h-24 items-end justify-between p-3"
              >
                <span className="rounded-full bg-card/80 px-2 py-0.5 text-[0.5625rem] backdrop-blur">
                  {product.category[locale]}
                </span>
                {soldOut ? (
                  <span className="rounded-full bg-destructive/90 px-2 py-0.5 text-[0.5625rem] text-white">
                    {t("shop.outOfStock")}
                  </span>
                ) : null}
              </HueWash>

              <div className="flex flex-1 flex-col gap-2 p-3.5">
                <p className="line-clamp-2 text-[0.8125rem] font-medium">
                  {product.name[locale]}
                </p>
                <p className="text-[0.625rem] text-muted-foreground">
                  {soldOut
                    ? t("shop.outOfStock")
                    : t("shop.inStock", { count: num(product.stock) })}
                </p>
                <div className="mt-auto flex items-center gap-2 pt-1">
                  <Price amount={product.price} className="flex-1 text-sm" />
                  <ShopButton
                    size="sm"
                    disabled={soldOut}
                    onClick={() => {
                      addLine({
                        kind: "product",
                        refId: product.id,
                        qty: 1,
                        unitPrice: product.price,
                      })
                      toast.success(t("shop.added"), {
                        description: product.name[locale],
                      })
                    }}
                    className="w-9 px-0"
                  >
                    <Plus />
                  </ShopButton>
                </div>
              </div>
            </ShopCard>
          )
        })}
      </div>
    </div>
  )
}
