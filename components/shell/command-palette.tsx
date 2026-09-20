"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Languages, LayoutGrid, Moon } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { BRANCHES } from "@/lib/branches"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { NAV_INDEX } from "@/lib/nav"
import { useUi } from "@/lib/store"
import { bn, en, lookup, type TranslationKey } from "@/lib/i18n"

/**
 * Headless — rendered once in the app layout. It also owns the global
 * shortcuts, so there is exactly one keydown listener for the whole shell.
 */
export function CommandPalette() {
  const router = useRouter()
  const { t, locale, toggleLocale } = useLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const open = useUi((s) => s.commandOpen)
  const setOpen = useUi((s) => s.setCommandOpen)
  const toggleSidebar = useUi((s) => s.toggleSidebar)
  const setBranchId = useUi((s) => s.setBranchId)

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      if (meta && key === "k") {
        event.preventDefault()
        setOpen(!open)
      } else if (meta && key === "b") {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, setOpen, toggleSidebar])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof NAV_INDEX>()
    for (const entry of NAV_INDEX) {
      const label = t(entry.groupKey)
      const bucket = map.get(label) ?? []
      bucket.push(entry)
      map.set(label, bucket)
    }
    return [...map.entries()]
  }, [t])

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="max-w-[35rem]"
      title={t("shell.commandTitle")}
    >
      <CommandInput placeholder={t("shell.commandPlaceholder")} />
      <CommandList>
        <CommandEmpty>{t("common.noResults")}</CommandEmpty>

        <CommandGroup heading={t("shell.actions")}>
          <CommandItem
            value="theme dark light থিম ডার্ক"
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
              setOpen(false)
            }}
          >
            <Moon className="size-3" />
            {t("shell.toggleTheme")}
          </CommandItem>
          <CommandItem
            value="language bangla english ভাষা বাংলা"
            onSelect={() => {
              toggleLocale()
              setOpen(false)
            }}
          >
            <Languages className="size-3" />
            {t("shell.switchLanguage")}
          </CommandItem>
          <CommandItem
            value="all branches master roll-up সব শাখা"
            onSelect={() => go("/branches")}
          >
            <LayoutGrid className="size-3" />
            {t("shell.allBranches")}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("shell.switchBranch")}>
          {BRANCHES.map((branch) => (
            <CommandItem
              key={branch.id}
              // Both languages go into the value so search works either way.
              value={`branch ${branch.name.en} ${branch.name.bn} ${branch.area.en} ${branch.area.bn}`}
              onSelect={() => {
                setBranchId(branch.id)
                go("/dashboard")
              }}
            >
              <span
                className="flex size-4 items-center justify-center rounded text-[0.5rem] font-semibold"
                style={{
                  background: `color-mix(in oklch, ${HUE_VAR[branch.hue]} 18%, transparent)`,
                  color: HUE_VAR[branch.hue],
                }}
              >
                {branch.initials}
              </span>
              {branch.name[locale]}
              <span className="ml-auto text-[0.5625rem] text-muted-foreground">
                {branch.area[locale]}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {groups.map(([heading, entries]) => (
          <CommandGroup key={heading} heading={heading}>
            {entries.map((entry) => (
              <CommandItem
                key={entry.href}
                value={`${entry.href} ${bilingualLabel(entry.labelKey)}`}
                onSelect={() => go(entry.href)}
              >
                <entry.icon className="size-3" />
                {t(entry.labelKey)}
                <span className="ml-auto font-mono text-[0.5625rem] text-muted-foreground/70">
                  {entry.href}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

/** Both dictionaries in the search value, so ⌘K finds a screen in either language. */
function bilingualLabel(key: TranslationKey) {
  return `${lookup(en, key)} ${lookup(bn, key)}`
}
