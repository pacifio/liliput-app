"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Loader2,
  LogOut,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"

import { StatusTag } from "@/components/motion/status-tag"
import {
  Price,
  SectionTitle,
  ShopButton,
  ShopCard,
  ShopField,
} from "@/components/shop/ui"
import { useMounted } from "@/hooks/use-mounted"
import { findSeededCustomer, useAccount } from "@/lib/account"
import { datasetFor, useBranch, useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { ordersForBranch, useLive } from "@/lib/live"
import { deriveShopCustomerId } from "@/lib/shop"
import type { Bilingual, BookingKind, Membership, TagHue } from "@/lib/types"
import { cn } from "@/lib/utils"

type Stage = "phone" | "otp" | "register"

const BOOKING_KIND_LABEL: Record<BookingKind, Bilingual> = {
  ticket: { en: "Play ticket", bn: "প্লে টিকিট" },
  party: { en: "Birthday party", bn: "জন্মদিনের পার্টি" },
  daycare: { en: "Day-care", bn: "ডে-কেয়ার" },
  membership: { en: "Membership", bn: "সদস্যপদ" },
}

const STATUS_HUE: Record<Membership["status"], TagHue> = {
  active: "green",
  expiring: "amber",
  expired: "rose",
  suspended: "slate",
}

const STATUS_LABEL: Record<Membership["status"], Bilingual> = {
  active: { en: "Active", bn: "সক্রিয়" },
  expiring: { en: "Expiring soon", bn: "শীঘ্রই মেয়াদ শেষ" },
  expired: { en: "Expired", bn: "মেয়াদ শেষ" },
  suspended: { en: "Suspended", bn: "স্থগিত" },
}

export default function AccountPage() {
  const { t, locale, money, date, num } = useLocale()
  const branch = useBranch()
  const data = useDataset()
  const mounted = useMounted()

  const rawSession = useAccount((s) => s.session)
  const session = mounted ? rawSession : null
  const login = useAccount((s) => s.login)
  const logout = useAccount((s) => s.logout)
  const updateProfile = useAccount((s) => s.updateProfile)
  const setProfile = useLive((s) => s.setProfile)
  const orders = useLive((s) => s.orders)

  const [stage, setStage] = React.useState<Stage>("phone")
  const [phone, setPhone] = React.useState("")
  const [digits, setDigits] = React.useState<string[]>(Array(6).fill(""))
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState({ name: "", phone: "", email: "" })
  const refs = React.useRef<(HTMLInputElement | null)[]>([])

  const complete = digits.every((d) => d !== "")

  function sendCode() {
    if (phone.replace(/\D/g, "").length < 8) return
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      setStage("otp")
    }, 700)
  }

  function verify() {
    if (!complete) return
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      const seeded = findSeededCustomer(phone, data)
      if (seeded) {
        const account = {
          customerId: seeded.id,
          name: seeded.name[locale],
          phone: seeded.phone,
          email: seeded.email,
        }
        login(account)
        setProfile(account)
        toast.success(t("account.welcomeBack", { name: account.name }))
      } else {
        setStage("register")
      }
    }, 700)
  }

  function completeRegistration() {
    if (name.trim().length < 2) return
    const account = {
      customerId: deriveShopCustomerId(phone),
      name: name.trim(),
      phone,
      email: email.trim(),
    }
    login(account)
    setProfile(account)
  }

  function handleSignOut() {
    logout()
    setStage("phone")
    setPhone("")
    setDigits(Array(6).fill(""))
    setName("")
    setEmail("")
    setEditing(false)
  }

  function startEdit() {
    if (!session) return
    setDraft({ name: session.name, phone: session.phone, email: session.email })
    setEditing(true)
  }

  function saveEdit() {
    updateProfile(draft)
    setProfile(draft)
    setEditing(false)
  }

  // The seeded baseline for this branch, kept separate from useDataset()'s
  // live-overlaid view — a live order's embedded customer snapshot would
  // otherwise shadow the seeded one in a plain array search (withLiveOrders
  // prepends live rows), undercounting a returning member's real history.
  const seeded = session ? datasetFor(branch) : undefined
  const seededCustomer = seeded?.customers.find((c) => c.id === session?.customerId)
  const seededBookings =
    seeded?.bookings.filter((b) => b.customerId === session?.customerId) ?? []
  const seededSales =
    seeded?.sales.filter((s) => s.customerId === session?.customerId) ?? []
  const seededMemberships =
    seeded?.memberships.filter((m) => m.customerId === session?.customerId) ?? []

  const liveOrders = session
    ? ordersForBranch(orders, branch.id).filter(
        (o) => o.customer.id === session.customerId
      )
    : []
  const liveBookings = liveOrders.flatMap((o) => o.bookings)
  const liveSales = liveOrders.flatMap((o) => o.sales)
  const liveMemberships = liveOrders.flatMap((o) => o.memberships)

  const memberships = [...liveMemberships, ...seededMemberships]
  const activeMembership = memberships
    .slice()
    .sort((a, b) => b.startedAt - a.startedAt)[0]
  const plan = activeMembership
    ? data.plans.find((p) => p.id === activeMembership.planId)
    : undefined

  const totalVisits = (seededCustomer?.visits ?? 0) + liveOrders.length
  const lifetimeSpend =
    (seededCustomer?.spend ?? 0) +
    liveOrders.reduce((sum, o) => sum + o.total, 0)
  const loyaltyPoints =
    (seededCustomer?.points ?? 0) +
    liveOrders.reduce((sum, o) => sum + Math.round(o.total / 50), 0)
  const memberSinceAt =
    seededCustomer?.joinedAt ??
    (liveOrders.length ? liveOrders[liveOrders.length - 1].at : undefined)

  type ActivityRow = { id: string; at: number; label: string; amount: number }
  const activity: ActivityRow[] = [
    ...liveBookings.map((b) => ({
      id: b.id,
      at: b.startAt,
      label: BOOKING_KIND_LABEL[b.kind][locale],
      amount: b.amount,
    })),
    ...seededBookings.map((b) => ({
      id: b.id,
      at: b.startAt,
      label: BOOKING_KIND_LABEL[b.kind][locale],
      amount: b.amount,
    })),
    ...liveSales.map((s) => ({
      id: s.id,
      at: s.at,
      label:
        data.outlets.find((o) => o.id === s.outletId)?.name[locale] ??
        t("shop.store"),
      amount: s.total,
    })),
    ...seededSales.map((s) => ({
      id: s.id,
      at: s.at,
      label:
        data.outlets.find((o) => o.id === s.outletId)?.name[locale] ??
        t("shop.store"),
      amount: s.total,
    })),
  ].sort((a, b) => b.at - a.at)

  if (!session) {
    return (
      <div className="flex flex-col gap-5 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
        <SectionTitle title={t("account.title")} />

        <div className="mx-auto w-full max-w-[26rem]">
          {stage === "phone" ? (
            <ShopCard className="p-6">
              <p className="micro mb-1">{t("account.signInTitle")}</p>
              <p className="mb-4 text-[0.8125rem] text-muted-foreground">
                {t("account.signInSubtitle")}
              </p>
              <ShopField
                label={t("shop.phone")}
                value={phone}
                onChange={setPhone}
                placeholder="01712345678"
                inputMode="tel"
              />
              <ShopButton
                className="mt-4 w-full"
                disabled={busy}
                onClick={sendCode}
              >
                {busy ? <Loader2 className="animate-spin" /> : null}
                {t("account.sendCode")}
              </ShopButton>
              <p className="mt-3 text-center text-[0.6875rem] text-muted-foreground">
                {t("account.demoHint")}
              </p>
            </ShopCard>
          ) : null}

          {stage === "otp" ? (
            <ShopCard className="p-6">
              <p className="micro mb-1">{t("account.otpTitle")}</p>
              <p className="mb-4 text-[0.8125rem] text-muted-foreground">
                {t("account.otpSubtitle", { phone })}
              </p>
              <div className="flex gap-1.5">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      refs.current[index] = el
                    }}
                    value={digit}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 1)
                      setDigits((state) =>
                        state.map((d, i) => (i === index ? value : d))
                      )
                      if (value && index < 5) refs.current[index + 1]?.focus()
                    }}
                    className={cn(
                      "nums h-11 w-0 min-w-0 flex-1 rounded-xl border bg-surface text-center text-base transition-colors outline-none",
                      digit ? "border-primary" : "border-border",
                      "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    )}
                  />
                ))}
              </div>
              <ShopButton
                className="mt-4 w-full"
                disabled={busy || !complete}
                onClick={verify}
              >
                {busy ? <Loader2 className="animate-spin" /> : null}
                {t("account.verify")}
              </ShopButton>
              <button
                type="button"
                onClick={() => setDigits(Array(6).fill(""))}
                className="mt-2 w-full text-center text-[0.6875rem] text-muted-foreground hover:text-foreground"
              >
                {t("account.resend")}
              </button>
            </ShopCard>
          ) : null}

          {stage === "register" ? (
            <ShopCard className="p-6">
              <p className="micro mb-1">{t("account.registerTitle")}</p>
              <p className="mb-4 text-[0.8125rem] text-muted-foreground">
                {t("account.registerSubtitle")}
              </p>
              <div className="flex flex-col gap-3">
                <ShopField
                  label={t("shop.fullName")}
                  value={name}
                  onChange={setName}
                  placeholder="নুসরাত জাহান"
                />
                <ShopField
                  label={`${t("shop.email")} · ${t("common.optional")}`}
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  inputMode="email"
                />
              </div>
              <ShopButton
                className="mt-4 w-full"
                disabled={name.trim().length < 2}
                onClick={completeRegistration}
              >
                {t("account.continue")}
              </ShopButton>
            </ShopCard>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-10 @lg:px-6 @lg:pt-8">
      <SectionTitle
        title={t("account.welcomeBack", { name: session.name })}
        subtitle={
          memberSinceAt
            ? t("account.memberSince", { date: date(memberSinceAt) })
            : undefined
        }
        action={
          <ShopButton size="sm" variant="ghost" onClick={handleSignOut}>
            <LogOut />
            {t("account.signOut")}
          </ShopButton>
        }
      />

      <div className="grid gap-3 @sm:grid-cols-3">
        <ShopCard className="p-4">
          <p className="micro">{t("account.totalVisits")}</p>
          <p className="nums mt-1 text-xl font-medium">{num(totalVisits)}</p>
        </ShopCard>
        <ShopCard className="p-4" delay={0.05}>
          <p className="micro">{t("account.lifetimeSpend")}</p>
          <Price amount={lifetimeSpend} className="mt-1 block text-xl" />
        </ShopCard>
        <ShopCard className="p-4" delay={0.1}>
          <p className="micro">{t("account.loyaltyPoints")}</p>
          <p className="nums mt-1 text-xl font-medium">{num(loyaltyPoints)}</p>
        </ShopCard>
      </div>

      <ShopCard className="p-5">
        <div className="flex items-center justify-between">
          <p className="micro">{t("account.profileTitle")}</p>
          {editing ? (
            <ShopButton size="sm" variant="ghost" onClick={saveEdit}>
              {t("common.save")}
            </ShopButton>
          ) : (
            <ShopButton size="sm" variant="ghost" onClick={startEdit}>
              {t("common.edit")}
            </ShopButton>
          )}
        </div>
        {editing ? (
          <div className="mt-3 flex flex-col gap-3">
            <ShopField
              label={t("shop.fullName")}
              value={draft.name}
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
            />
            <ShopField
              label={t("shop.phone")}
              value={draft.phone}
              onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
              inputMode="tel"
            />
            <ShopField
              label={t("shop.email")}
              value={draft.email}
              onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
              inputMode="email"
            />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-1.5 text-[0.8125rem]">
            <p>{session.name}</p>
            <p className="text-muted-foreground">{session.phone}</p>
            {session.email ? (
              <p className="text-muted-foreground">{session.email}</p>
            ) : null}
          </div>
        )}
      </ShopCard>

      <ShopCard className="p-5">
        <p className="micro mb-3">{t("account.membershipTitle")}</p>
        {activeMembership && plan ? (
          <div
            className="flex flex-wrap items-center gap-4 rounded-2xl p-4 text-white"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklch, ${HUE_VAR[plan.hue]} 44%, oklch(0.17 0.015 40)), oklch(0.15 0.012 40))`,
            }}
          >
            <BadgeCheck className="size-6 shrink-0 opacity-85" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.8125rem] font-medium">
                  {plan.name[locale]}
                </p>
                <StatusTag hue={STATUS_HUE[activeMembership.status]} dot>
                  {STATUS_LABEL[activeMembership.status][locale]}
                </StatusTag>
              </div>
              <p className="mt-1 text-[0.6875rem] opacity-80">
                {t("membership.validUntil", {
                  date: date(activeMembership.expiresAt),
                })}{" "}
                ·{" "}
                {t("membership.visitsUsed", {
                  used: num(activeMembership.visitsUsed),
                  total: num(plan.visits),
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <p className="text-[0.8125rem] text-muted-foreground">
              {t("account.noMembership")}
            </p>
            <p className="text-[0.75rem] text-muted-foreground">
              {t("account.noMembershipHint")}
            </p>
            <Link href="/shop/membership" className="mt-1">
              <ShopButton size="sm" variant="outline">
                {t("account.getMembership")}
                <ArrowUpRight />
              </ShopButton>
            </Link>
          </div>
        )}
      </ShopCard>

      <ShopCard className="p-5">
        <SectionTitle
          title={t("account.activityTitle")}
          subtitle={t("account.activitySubtitle")}
          className="mb-3"
        />
        {activity.length ? (
          <ul className="flex flex-col gap-2">
            {activity.map((row) => (
              <li
                key={row.id}
                className="flex items-baseline justify-between gap-2 border-t border-[var(--hairline)] py-2 text-[0.8125rem] first:border-t-0 first:pt-0"
              >
                <span className="min-w-0 truncate">
                  {row.label}
                  <span className="ml-2 text-[0.6875rem] text-muted-foreground">
                    {date(row.at)}
                  </span>
                </span>
                <Price amount={row.amount} className="shrink-0" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-1 py-4 text-center text-[0.8125rem] text-muted-foreground">
            <Receipt className="size-4" />
            {t("account.activityEmpty")}
            <span className="text-[0.6875rem]">
              {t("account.activityEmptyHint")}
            </span>
          </div>
        )}
      </ShopCard>
    </div>
  )
}
