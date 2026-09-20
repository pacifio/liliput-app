"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, Check, ChevronsUpDown, LayoutGrid } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { BRANCHES } from "@/lib/branches"
import { useBranch } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"
import { cn } from "@/lib/utils"

export function BranchSwitcher({ collapsed }: { collapsed: boolean }) {
  const { t, locale, num } = useLocale()
  const branch = useBranch()
  const setBranchId = useUi((state) => state.setBranchId)
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-sidebar-accent",
              collapsed && "justify-center px-0"
            )}
          />
        }
      >
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-[0.5625rem] font-semibold"
          style={{
            background: `color-mix(in oklch, ${HUE_VAR[branch.hue]} 18%, transparent)`,
            color: HUE_VAR[branch.hue],
          }}
        >
          {branch.initials}
        </span>
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.6875rem] font-medium">
                {branch.name[locale]}
              </span>
              <span className="block truncate text-[0.5625rem] text-muted-foreground">
                {branch.area[locale]} · {num(branch.capacity)}
              </span>
            </span>
            <ChevronsUpDown className="size-3 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[16rem] p-0">
        {/* The label and the branches it names have to sit in one group —
            GroupLabel is what points the group's aria-labelledby at it. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 pt-2 pb-1">
            <span className="micro">{t("shell.switchBranch")}</span>
          </DropdownMenuLabel>
          <ScrollFade className="max-h-[18rem] px-1" fade={18}>
            {BRANCHES.map((b) => (
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
                    {b.area[locale]}
                  </span>
                </span>
                {b.id === branch.id ? (
                  <Check className="size-3 shrink-0 text-primary" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </ScrollFade>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-1">
          <DropdownMenuItem
            onClick={() => router.push("/branches")}
            className="gap-2"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/12 text-primary">
              <LayoutGrid className="size-2.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.6875rem]">
                {t("shell.allBranches")}
              </span>
              <span className="block truncate text-[0.5625rem] text-muted-foreground">
                {t("shell.allBranchesHint")}
              </span>
            </span>
            <Building2 className="size-3 shrink-0 text-muted-foreground" />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
