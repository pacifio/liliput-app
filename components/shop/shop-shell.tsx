"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Gauge,
  Home,
  Monitor,
  Moon,
  PartyPopper,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sun,
  Ticket,
  User,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

import { ScrollFade } from "@/components/motion/scroll-fade"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMounted } from "@/hooks/use-mounted"
import { useAccount } from "@/lib/account"
import { BRANCHES } from "@/lib/branches"
import { useBranch } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { LOCALE_META } from "@/lib/i18n/config"
import { useLocale } from "@/lib/i18n/provider"
import { useLive } from "@/lib/live"
import { useUi } from "@/lib/store"
import type { TranslationKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type ShopTab = { href: string; labelKey: TranslationKey; icon: LucideIcon }

const HOME: ShopTab = { href: "/shop", labelKey: "shop.home", icon: Home }
const TICKETS: ShopTab = {
  href: "/shop/tickets",
  labelKey: "shop.tickets",
  icon: Ticket,
}
const MEMBERSHIP: ShopTab = {
  href: "/shop/membership",
  labelKey: "shop.membership",
  icon: BadgeCheck,
}
const PARTIES: ShopTab = {
  href: "/shop/parties",
  labelKey: "shop.parties",
  icon: PartyPopper,
}
const STORE: ShopTab = {
  href: "/shop/store",
  labelKey: "shop.store",
  icon: ShoppingBag,
}
const ORDERS: ShopTab = {
  href: "/shop/orders",
  labelKey: "shop.orders",
  icon: Receipt,
}

/** The website has room for every section in one row. */
const NAV_TABS: ShopTab[] = [TICKETS, MEMBERSHIP, PARTIES, STORE, ORDERS]

/**
 * A phone tab bar holds five comfortably. Membership is the one that gives way
 * — it is one tap from the home screen, and orders is not.
 */
const PHONE_TABS: ShopTab[] = [HOME, TICKETS, PARTIES, STORE, ORDERS]

export function ShopShell({ children }: { children: React.ReactNode }) {
  const view = useUi((s) => s.shopView)
  const mounted = useMounted()
  // Until the persisted view mode rehydrates, render the website layout so the
  // server and the client agree on the first frame.
  const phone = mounted && view === "phone"

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-surface">
      <ViewBar />
      {phone ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          <PhoneFrame>
            <ShopChrome>{children}</ShopChrome>
          </PhoneFrame>
        </div>
      ) : (
        <div className="min-h-0 flex-1 bg-background">
          <ShopChrome>{children}</ShopChrome>
        </div>
      )}
    </div>
  )
}

/** The demo control strip. It sits outside the shop, not inside the product. */
function ViewBar() {
  const { t } = useLocale()
  const view = useUi((s) => s.shopView)
  const setShopView = useUi((s) => s.setShopView)
  const mounted = useMounted()

  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-4">
      <span className="text-[0.6875rem] font-medium">{t("brand.name")}</span>
      <span className="text-[0.625rem] text-muted-foreground">
        {t("brand.tagline")}
      </span>

      <div className="ml-auto flex items-center gap-1 rounded-full bg-muted p-0.5">
        {(["web", "phone"] as const).map((value) => {
          const active = mounted && view === value
          const Icon = value === "web" ? Monitor : Smartphone
          return (
            <button
              key={value}
              onClick={() => setShopView(value)}
              className={cn(
                "flex h-6 items-center gap-1 rounded-full px-2.5 text-[0.625rem] transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-3" />
              {value === "web" ? t("shop.viewDesktop") : t("shop.viewPhone")}
            </button>
          )
        })}
      </div>

      <Link
        href="/dashboard"
        className="flex h-6 items-center gap-1 rounded-full bg-primary/12 px-2.5 text-[0.625rem] font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <Gauge className="size-3" />
        {t("shop.openConsole")}
      </Link>
    </div>
  )
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[52rem] max-h-full w-[24.375rem] max-w-full shrink-0 rounded-[2.75rem] border-[0.6rem] border-neutral-900 bg-background shadow-2xl ring-1 ring-black/20">
      <span className="absolute top-0 left-1/2 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-neutral-900" />
      <div className="h-full overflow-hidden rounded-[2.1rem] pt-6">
        {children}
      </div>
    </div>
  )
}

/**
 * The shop itself. Everything inside sizes against the container rather than
 * the viewport, so the same markup works full-width and inside the phone.
 */
function ShopChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container flex h-full min-h-0 flex-col">
      <ShopHeader />
      <ScrollFade className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-[76rem]">{children}</div>
      </ScrollFade>
      <ShopTabs />
    </div>
  )
}

function ShopHeader() {
  const { t, locale, setLocale, num } = useLocale()
  const branch = useBranch()
  const setBranchId = useUi((s) => s.setBranchId)
  const cart = useLive((s) => s.cart)
  const session = useAccount((s) => s.session)
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const count = mounted ? cart.reduce((sum, l) => sum + l.qty, 0) : 0
  const signedIn = mounted && !!session

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-4 @lg:h-16 @lg:px-6">
      <Link href="/shop" className="flex shrink-0 items-center gap-2">
        <span
          className="flex size-8 items-center justify-center rounded-xl text-[0.625rem] font-bold"
          style={{
            background: `color-mix(in oklch, ${HUE_VAR[branch.hue]} 20%, transparent)`,
            color: HUE_VAR[branch.hue],
          }}
        >
          {branch.initials}
        </span>
        <span className="hidden text-sm font-medium @sm:block">
          {t("brand.name")}
        </span>
      </Link>

      {/* Full nav on the website; the phone gets the bottom tab bar instead. */}
      <nav className="mx-3 hidden min-w-0 flex-1 items-center gap-1 @3xl:flex">
        {NAV_TABS.map((tab) => (
          <NavLink key={tab.href} href={tab.href} label={t(tab.labelKey)} />
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex h-8 items-center gap-1 rounded-full border border-border px-2.5 text-[0.6875rem] transition-colors hover:bg-muted/60" />
            }
          >
            <span className="max-w-[7rem] truncate">{branch.name[locale]}</span>
            <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[15rem] p-0">
            {/* The label and the branches it names have to sit in one group —
                GroupLabel is what points the group's aria-labelledby at it. */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 pt-2 pb-1">
                <span className="micro">{t("shop.selectBranch")}</span>
              </DropdownMenuLabel>
              <ScrollFade className="max-h-[17rem] px-1 pb-1" fade={18}>
                {BRANCHES.filter((b) => b.status !== "fit-out").map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => setBranchId(b.id)}
                    className="gap-2"
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded text-[0.5rem] font-semibold"
                      style={{
                        background: `color-mix(in oklch, ${HUE_VAR[b.hue]} 18%, transparent)`,
                        color: HUE_VAR[b.hue],
                      }}
                    >
                      {b.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.6875rem]">
                        {b.name[locale]}
                      </span>
                      <span className="block truncate text-[0.5625rem] text-muted-foreground">
                        {t("shop.branchHint", {
                          area: b.area[locale],
                          count: num(b.capacity),
                        })}
                      </span>
                    </span>
                    {b.id === branch.id ? (
                      <Check className="size-3 shrink-0 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </ScrollFade>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => setLocale(locale === "en" ? "bn" : "en")}
          className="flex size-8 items-center justify-center rounded-full text-[0.625rem] font-medium text-muted-foreground transition-colors hover:bg-muted/60"
        >
          {LOCALE_META[locale].short}
        </button>
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="size-3.5" />
          ) : (
            <Moon className="size-3.5" />
          )}
        </button>

        <Link
          href="/shop/account"
          className={cn(
            "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted/60",
            signedIn ? "text-primary" : "text-muted-foreground"
          )}
        >
          <User className="size-4" />
        </Link>

        <Link
          href="/shop/cart"
          className="relative flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60"
        >
          <ShoppingCart className="size-4" />
          <AnimatePresence>
            {count > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="nums absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.5625rem] font-medium text-primary-foreground"
              >
                {num(count)}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </Link>
      </div>
    </header>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-[0.8125rem] transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  )
}

function ShopTabs() {
  const { t } = useLocale()
  const pathname = usePathname()

  return (
    <nav className="flex h-16 shrink-0 items-stretch border-t border-[var(--hairline)] bg-card @3xl:hidden">
      {PHONE_TABS.map((tab) => {
        const active =
          tab.href === "/shop"
            ? pathname === "/shop"
            : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[0.5625rem] transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className="size-4.5" />
            <span className="max-w-full truncate px-1">{t(tab.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
