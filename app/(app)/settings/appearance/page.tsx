"use client"

import { Check, Minus, Moon, Plus, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/use-mounted"
import { useLocale } from "@/lib/i18n/provider"
import {
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_PRESETS,
  UI_SCALE_STEP,
  useUi,
} from "@/lib/store"
import { cn } from "@/lib/utils"

export default function AppearanceSettingsPage() {
  const { t, num, pct } = useLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const uiScale = useUi((s) => s.uiScale)
  const setUiScale = useUi((s) => s.setUiScale)

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("settings.appearanceTitle")}
        subtitle={t("settings.appearanceSubtitle")}
      />

      <div className="grid gap-3 px-5 pb-6 lg:grid-cols-2">
        <Panel title={t("settings.theme")} delay={0}>
          <div className="grid grid-cols-2 gap-2">
            {(["light", "dark"] as const).map((value) => {
              const active = mounted && resolvedTheme === value
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg p-3 text-left ring-1 transition-colors",
                    active
                      ? "ring-primary/50"
                      : "ring-foreground/[0.06] hover:bg-muted/40"
                  )}
                >
                  <div
                    className="flex h-16 flex-col justify-end gap-1 rounded-md p-2"
                    style={{
                      background:
                        value === "light"
                          ? "oklch(0.987 0.002 40)"
                          : "oklch(0.145 0 0)",
                    }}
                  >
                    <span
                      className="h-1.5 w-3/4 rounded-full"
                      style={{
                        background:
                          value === "light"
                            ? "oklch(0.63 0.17 33)"
                            : "oklch(0.66 0.17 33)",
                      }}
                    />
                    <span
                      className="h-1.5 w-1/2 rounded-full"
                      style={{
                        background:
                          value === "light"
                            ? "oklch(0.86 0.01 40)"
                            : "oklch(0.3 0 0)",
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {value === "light" ? (
                      <Sun className="size-3" />
                    ) : (
                      <Moon className="size-3" />
                    )}
                    <span className="text-[0.6875rem] font-medium">
                      {value === "light"
                        ? t("settings.themeLight")
                        : t("settings.themeDark")}
                    </span>
                    {active ? (
                      <Check className="ml-auto size-3 text-primary" />
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[0.625rem] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 text-[0.5625rem]">
              D
            </kbd>{" "}
            {t("shell.toggleTheme")}
          </p>
        </Panel>

        <Panel
          title={t("settings.density")}
          subtitle={t("settings.densityHint")}
          delay={0.05}
        >
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setUiScale(uiScale - UI_SCALE_STEP)}
              disabled={uiScale <= UI_SCALE_MIN}
            >
              <Minus />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{
                    width: `${((uiScale - UI_SCALE_MIN) / (UI_SCALE_MAX - UI_SCALE_MIN)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setUiScale(uiScale + UI_SCALE_STEP)}
              disabled={uiScale >= UI_SCALE_MAX}
            >
              <Plus />
            </Button>
            <span className="nums w-12 shrink-0 text-right text-[0.6875rem] font-medium">
              {pct(uiScale * 100, 0)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {UI_SCALE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setUiScale(preset.value)}
                style={{ fontSize: `${preset.value * 0.8}rem` }}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 transition-colors",
                  Math.abs(uiScale - preset.value) < 0.001
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/60"
                )}
              >
                {t(preset.labelKey)}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <p className="micro mb-1.5">{t("settings.preview")}</p>
            <KpiStrip
              cells={[
                {
                  id: "a",
                  label: t("dashboard.footfall"),
                  value: 12480,
                  delta: 8.4,
                  color: "var(--chart-1)",
                },
                {
                  id: "b",
                  label: t("dashboard.revenue"),
                  value: 684000,
                  prefix: "৳",
                  delta: -2.1,
                  color: "var(--chart-2)",
                },
              ]}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusTag hue="green" dot>
                {t("gate.statusActive")}
              </StatusTag>
              <StatusTag hue="amber" dot>
                {t("gate.statusOverstay")}
              </StatusTag>
              <StatusTag hue="blue">{num(42)}</StatusTag>
            </div>
          </div>

          <p className="mt-3 text-[0.625rem] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 text-[0.5625rem]">
              ⌘⌥+
            </kbd>{" "}
            /{" "}
            <kbd className="rounded border border-border bg-muted px-1 text-[0.5625rem]">
              ⌘⌥−
            </kbd>{" "}
            /{" "}
            <kbd className="rounded border border-border bg-muted px-1 text-[0.5625rem]">
              ⌘⌥0
            </kbd>
          </p>
        </Panel>
      </div>
    </ScrollFade>
  )
}
