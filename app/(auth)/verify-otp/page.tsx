"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

export default function VerifyOtpPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [digits, setDigits] = React.useState<string[]>(Array(6).fill(""))
  const [busy, setBusy] = React.useState(false)
  const refs = React.useRef<(HTMLInputElement | null)[]>([])

  const complete = digits.every((d) => d !== "")

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setBusy(true)
        setTimeout(() => router.push("/select-branch"), 700)
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-xl font-medium tracking-tight">
          {t("auth.otpTitle")}
        </h1>
        <p className="mt-1 text-[0.6875rem] text-muted-foreground">
          {t("auth.otpSubtitle", { email: "fahim@liliputerdunia.com.bd" })}
        </p>
      </div>

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
              const value = event.target.value.replace(/\D/g, "").slice(0, 1)
              setDigits((state) =>
                state.map((d, i) => (i === index ? value : d))
              )
              if (value && index < 5) refs.current[index + 1]?.focus()
            }}
            className={cn(
              "nums h-10 flex-1 rounded-md border bg-card text-center text-sm transition-colors outline-none",
              digit ? "border-primary" : "border-border",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            )}
          />
        ))}
      </div>

      <Button type="submit" size="lg" disabled={busy || !complete}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        {t("auth.verify")}
      </Button>

      <button
        type="button"
        onClick={() => setDigits(Array(6).fill(""))}
        className="text-center text-[0.625rem] text-muted-foreground hover:text-foreground"
      >
        {t("auth.resend")}
      </button>
    </form>
  )
}
