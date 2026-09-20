"use client"

import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLocale()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
        <TriangleAlert className="size-4" />
      </span>
      <p className="text-xs font-medium">{t("errors.crashTitle")}</p>
      <p className="max-w-[40ch] text-center font-mono text-[0.625rem] text-muted-foreground">
        {error.message}
      </p>
      <Button size="sm" onClick={reset}>
        {t("errors.retry")}
      </Button>
    </div>
  )
}
