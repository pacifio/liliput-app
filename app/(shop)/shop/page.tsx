"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowRight,
  BadgeCheck,
  PartyPopper,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Timer,
} from "lucide-react"

import {
  HueWash,
  Price,
  SectionTitle,
  ShopButton,
  ShopCard,
} from "@/components/shop/ui"
import { BRANCHES } from "@/lib/branches"
import { useBranch, useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

export default function ShopHomePage() {
  const { t, locale, num } = useLocale()
  const data = useDataset()
  const branch = useBranch()

  const cheapestSlab = [...data.slabs].sort(
    (a, b) => a.basePrice - b.basePrice
  )[0]
  const cheapestPlan = [...data.plans].sort((a, b) => a.price - b.price)[0]
  const cheapestParty = [...data.packages].sort((a, b) => a.price - b.price)[0]

  const tiles = [
    {
      href: "/shop/tickets",
      icon: Ticket,
      title: t("shop.tickets"),
      from: cheapestSlab.basePrice,
      hue: HUE_VAR.teal,
    },
    {
      href: "/shop/membership",
      icon: BadgeCheck,
      title: t("shop.membership"),
      from: cheapestPlan.price,
      hue: HUE_VAR.amber,
    },
    {
      href: "/shop/parties",
      icon: PartyPopper,
      title: t("shop.parties"),
      from: cheapestParty.price,
      hue: HUE_VAR.magenta,
    },
    {
      href: "/shop/store",
      icon: ShoppingBag,
      title: t("shop.store"),
      from: Math.min(...data.products.map((p) => p.price)),
      hue: HUE_VAR.purple,
    },
  ]

  const reasons = [
    {
      icon: ShieldCheck,
      title: t("shop.whySafe"),
      hint: t("shop.whySafeHint"),
    },
    { icon: Timer, title: t("shop.whyClean"), hint: t("shop.whyCleanHint") },
    { icon: BadgeCheck, title: t("shop.whyCard"), hint: t("shop.whyCardHint") },
  ]

  const popular = data.products.slice(0, 8)

  return (
    <div className="flex flex-col gap-8 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      {/* Hero */}
      <HueWash
        hue={HUE_VAR[branch.hue]}
        className="rounded-3xl p-6 ring-1 ring-foreground/10 @lg:p-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[46ch]"
        >
          <p className="text-[0.6875rem] font-medium tracking-wide text-primary uppercase">
            {branch.name[locale]} · {branch.area[locale]}
          </p>
          <h1 className="mt-2 text-2xl leading-tight font-medium tracking-tight @lg:text-4xl">
            {t("shop.tagline")}
          </h1>
          <p className="mt-3 text-[0.8125rem] text-muted-foreground @lg:text-sm">
            {t("shop.intro", { count: num(BRANCHES.length) })}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/shop/tickets">
              <ShopButton>
                <Ticket />
                {t("shop.ticketsTitle")}
              </ShopButton>
            </Link>
            <Link href="/shop/membership">
              <ShopButton variant="outline">
                <BadgeCheck />
                {t("shop.membership")}
              </ShopButton>
            </Link>
          </div>
        </motion.div>
      </HueWash>

      {/* Category tiles */}
      <div className="grid gap-3 @sm:grid-cols-2 @3xl:grid-cols-4">
        {tiles.map((tile, index) => (
          <ShopCard key={tile.href} delay={index * 0.05}>
            <Link href={tile.href} className="block">
              <HueWash hue={tile.hue} className="flex h-20 items-center px-5">
                <tile.icon className="size-7" style={{ color: tile.hue }} />
              </HueWash>
              <div className="flex items-center gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tile.title}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                    {t("shop.from")} <Price amount={tile.from} />
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          </ShopCard>
        ))}
      </div>

      {/* Why us */}
      <div>
        <SectionTitle title={t("shop.whyUs")} />
        <div className="mt-4 grid gap-3 @lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <ShopCard key={reason.title} delay={index * 0.05} className="p-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <reason.icon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-medium">{reason.title}</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {reason.hint}
              </p>
            </ShopCard>
          ))}
        </div>
      </div>

      {/* Popular products */}
      <div>
        <SectionTitle
          title={t("shop.popular")}
          action={
            <Link
              href="/shop/store"
              className="flex shrink-0 items-center gap-1 text-[0.8125rem] font-medium text-primary"
            >
              {t("common.more")}
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="mt-4 grid gap-3 @sm:grid-cols-2 @3xl:grid-cols-4">
          {popular.map((product, index) => {
            const outlet = data.outlets.find((o) => o.id === product.outletId)
            return (
              <ShopCard key={product.id} delay={index * 0.04}>
                <Link href="/shop/store" className="block">
                  <HueWash
                    hue={HUE_VAR[product.hue]}
                    className="flex h-24 items-end p-3"
                  >
                    <span className="rounded-full bg-card/80 px-2 py-0.5 text-[0.5625rem] backdrop-blur">
                      {outlet?.name[locale]}
                    </span>
                  </HueWash>
                  <div className="p-3">
                    <p className="line-clamp-2 text-[0.8125rem] font-medium">
                      {product.name[locale]}
                    </p>
                    <Price
                      amount={product.price}
                      className="mt-1 block text-sm"
                    />
                  </div>
                </Link>
              </ShopCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
