"use client"

import { useRouter } from "next/navigation"
import { Check, Sparkles } from "lucide-react"
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

export default function MembershipPage() {
  const { t, locale, num } = useLocale()
  const data = useDataset()
  const router = useRouter()
  const addLine = useLive((s) => s.addLine)

  function buy(planId: string, price: number, name: string) {
    addLine({ kind: "membership", refId: planId, qty: 1, unitPrice: price })
    toast.success(t("shop.added"), { description: name })
    router.push("/shop/cart")
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      <SectionTitle
        title={t("shop.membershipTitle")}
        subtitle={t("shop.membershipSubtitle")}
      />

      <div className="grid gap-4 @3xl:grid-cols-3">
        {data.plans.map((plan, index) => {
          // The monthly plan is the one the business wants to sell.
          const featured = plan.id === "monthly"
          return (
            <ShopCard
              key={plan.id}
              delay={index * 0.06}
              className={cn("flex flex-col", featured && "ring-2 ring-primary")}
            >
              <HueWash
                hue={HUE_VAR[plan.hue]}
                className="flex h-16 items-center justify-between px-5"
              >
                <span className="text-sm font-medium">{plan.name[locale]}</span>
                {featured ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[0.5625rem] font-medium text-primary-foreground">
                    <Sparkles className="size-2.5" />
                    {t("shop.mostPopular")}
                  </span>
                ) : null}
              </HueWash>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <Price amount={plan.price} className="text-3xl" />
                  <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                    {t("shop.planDays", { count: num(plan.days) })} ·{" "}
                    {t("shop.planVisits", { count: num(plan.visits) })}
                  </p>
                </div>

                <ul className="flex flex-col gap-2">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk.en}
                      className="flex items-start gap-2 text-[0.8125rem]"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
                      {perk[locale]}
                    </li>
                  ))}
                </ul>

                <ShopButton
                  variant={featured ? "primary" : "outline"}
                  className="mt-auto w-full"
                  onClick={() => buy(plan.id, plan.price, plan.name[locale])}
                >
                  {t("shop.buyPlan")}
                </ShopButton>
              </div>
            </ShopCard>
          )
        })}
      </div>
    </div>
  )
}
