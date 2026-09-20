"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
  Bell,
  ChevronRight,
  CloudOff,
  LogOut,
  RefreshCw,
  Settings,
  Store,
  User,
  Wifi,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRangePicker } from "@/components/shell/date-range-picker"
import { UiScaleControl } from "@/components/shell/ui-scale"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { NAV, NAV_INDEX } from "@/lib/nav"
import { useUi } from "@/lib/store"
import { cn } from "@/lib/utils"

const SEVERITY_COLOR = {
  critical: "var(--destructive)",
  warning: "var(--warning)",
  info: "var(--info)",
} as const

export function Topbar() {
  const pathname = usePathname()
  const { t, locale, num, relative } = useLocale()
  const data = useDataset()
  const offline = useUi((s) => s.offlineMode)
  const setOffline = useUi((s) => s.setOfflineMode)
  const syncQueue = useUi((s) => s.syncQueue)
  const enqueueSync = useUi((s) => s.enqueueSync)
  const drainSync = useUi((s) => s.drainSync)

  // Going offline seeds the queue from the branch's pending items so the
  // banner has something concrete to count down.
  const toggleOffline = () => {
    if (offline) {
      drainSync()
      setOffline(false)
    } else {
      setOffline(true)
      enqueueSync(data.syncQueue.length)
    }
  }

  const crumbs = React.useMemo(() => {
    const exact = NAV_INDEX.find((entry) => entry.href === pathname)
    if (exact) return [t(exact.groupKey), t(exact.labelKey)]
    for (const group of NAV) {
      for (const item of group.items) {
        const child = item.children?.find((c) => pathname.startsWith(c.href))
        if (child) return [t(group.labelKey), t(child.labelKey)]
        if (pathname.startsWith(item.href))
          return [t(group.labelKey), t(item.labelKey)]
      }
    }
    return [t("brand.name")]
  }, [pathname, t])

  const alerts = data.alerts.slice(0, 8)
  const unread = alerts.filter((a) => a.severity !== "info").length

  return (
    <>
      <header className="glass sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-4">
        <nav className="flex min-w-0 items-center gap-1 text-[0.6875rem]">
          {crumbs.map((crumb, index) => (
            <React.Fragment key={crumb}>
              {index > 0 ? (
                <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
              ) : null}
              <span
                className={cn(
                  "truncate",
                  index === crumbs.length - 1
                    ? "font-medium"
                    : "text-muted-foreground"
                )}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {/* The customer shop that feeds this console. */}
          <Link
            href="/shop"
            title={t("shop.storeTitle")}
            className="flex h-6 items-center gap-1 rounded-full px-2 text-[0.625rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Store className="size-3" />
            <span className="hidden sm:inline">{t("shop.storeTitle")}</span>
          </Link>

          <DateRangePicker />

          <button
            onClick={toggleOffline}
            title={t("shell.offline")}
            className={cn(
              "flex h-6 items-center gap-1 rounded-full px-2 text-[0.625rem] transition-colors",
              offline
                ? "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[var(--warning)]"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {offline ? (
              <CloudOff className="size-3" />
            ) : (
              <Wifi className="size-3" />
            )}
            {offline ? <span className="nums">{num(syncQueue)}</span> : null}
          </button>

          <Popover>
            <PopoverTrigger
              render={
                <button className="relative flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
              }
            >
              <Bell className="size-3.5" />
              {unread > 0 ? (
                <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-destructive" />
              ) : null}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[20rem] p-0">
              <div className="micro border-b border-[var(--hairline)] px-3 py-2">
                {t("shell.notifications")}
              </div>
              <ul className="max-h-[20rem] overflow-y-auto">
                {alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex gap-2 border-b border-[var(--hairline)] px-3 py-2 last:border-0"
                  >
                    <span
                      className="mt-1 size-1.5 shrink-0 rounded-full"
                      style={{ background: SEVERITY_COLOR[alert.severity] }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[0.6875rem] font-medium">
                        {alert.title[locale]}
                      </p>
                      <p className="text-[0.625rem] text-muted-foreground">
                        {alert.detail[locale]}
                      </p>
                      <p className="mt-0.5 text-[0.5625rem] text-muted-foreground/70">
                        {alert.module[locale]} · {relative(alert.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <UiScaleControl />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex size-6 items-center justify-center rounded-full bg-primary/12 text-[0.5625rem] font-semibold text-primary" />
              }
            >
              AM
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[12rem]">
              <div className="px-2 py-1.5">
                <p className="text-[0.6875rem] font-medium">Adib Mohsin</p>
                <p className="text-[0.625rem] text-muted-foreground">
                  {t("admin.scopeAll")}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="size-3" />
                {t("shell.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/settings/general" />}
                className="gap-2"
              >
                <Settings className="size-3" />
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/login" />}
                className="gap-2"
              >
                <LogOut className="size-3" />
                {t("shell.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {offline ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden bg-[color-mix(in_oklch,var(--warning)_14%,transparent)]"
          >
            <div className="flex items-center gap-2 px-4 py-1.5 text-[0.625rem] text-[var(--warning)]">
              <CloudOff className="size-3 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {t("shell.offlineBanner", { count: num(syncQueue) })}
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={toggleOffline}
                className="text-[var(--warning)] hover:bg-[color-mix(in_oklch,var(--warning)_18%,transparent)]"
              >
                <RefreshCw className="size-2.5" />
                {t("shell.syncNow")}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
