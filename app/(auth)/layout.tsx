"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { CombChart } from "@/components/motion/comb-chart"
import { NumberTicker } from "@/components/motion/number-ticker"
import { useMounted } from "@/hooks/use-mounted"
import { useDataset } from "@/lib/data"
import { onFloor } from "@/lib/derive"
import { HUE_VAR } from "@/lib/hue"
import { LOCALE_META } from "@/lib/i18n/config"
import { useLocale } from "@/lib/i18n/provider"
import { SERIES_TODAY_INDEX } from "@/lib/mock/generate"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t, locale, setLocale } = useLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const data = useDataset()
  const today = data.series[SERIES_TODAY_INDEX]
  const spark = data.series
    .slice(SERIES_TODAY_INDEX - 29, SERIES_TODAY_INDEX + 1)
    .map((p) => p.footfall)

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-5">
          <span
            className="flex size-6 items-center justify-center rounded-md text-[0.5625rem] font-semibold"
            style={{
              background: `color-mix(in oklch, ${HUE_VAR[data.branch.hue]} 18%, transparent)`,
              color: HUE_VAR[data.branch.hue],
            }}
          >
            {data.branch.initials}
          </span>
          <span className="text-[0.6875rem] font-medium">
            {t("brand.name")}
          </span>
          <button
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="ml-auto flex h-6 items-center rounded-md px-2 text-[0.625rem] font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            {LOCALE_META[locale].short}
          </button>
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
          </button>
        </header>

        <main className="flex min-h-0 flex-1 items-center justify-center px-5 pb-12">
          <div className="w-full max-w-[21.25rem]">{children}</div>
        </main>

        <footer className="shrink-0 px-5 pb-4 text-center text-[0.5625rem] text-muted-foreground">
          {t("brand.vendor")} · {t("shell.demoNotice")}
        </footer>
      </div>

      {/* The live panel: real generated data, so the demo starts warm. */}
      <aside
        className="relative hidden w-[46%] max-w-[38.75rem] shrink-0 overflow-hidden lg:block"
        style={{
          background: `radial-gradient(120% 90% at 70% 10%, color-mix(in oklch, ${HUE_VAR[data.branch.hue]} 16%, transparent), transparent 70%), var(--surface)`,
        }}
      >
        <div className="grid-lines absolute inset-0 opacity-40" />
        <div className="relative flex h-full flex-col justify-center gap-3 px-10">
          <p className="text-xl font-medium tracking-tight">
            {t("brand.console")}
          </p>
          <p className="max-w-[36ch] text-[0.6875rem] text-muted-foreground">
            {t("brand.tagline")}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="text-[0.625rem] text-muted-foreground">
                {t("auth.todayFootfall")}
              </p>
              <p className="figure mt-1 text-[1.75rem] leading-none">
                <NumberTicker value={today.footfall} />
              </p>
              <CombChart
                values={spark}
                height={28}
                color="var(--chart-1)"
                className="mt-2"
              />
            </div>
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="text-[0.625rem] text-muted-foreground">
                {t("auth.onFloorNow")}
              </p>
              <p className="figure mt-1 text-[1.75rem] leading-none">
                <NumberTicker value={onFloor(data).length} />
              </p>
              <CombChart
                values={data.zones.map(
                  (zone) =>
                    onFloor(data).filter((b) => b.zoneId === zone.id).length
                )}
                height={28}
                color="var(--chart-2)"
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
