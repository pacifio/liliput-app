"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"

export default function LoginPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setBusy(true)
        // No auth in a prototype — the delay just makes the flow feel real.
        setTimeout(() => router.push("/select-branch"), 700)
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-xl font-medium tracking-tight">
          {t("auth.signIn")}
        </h1>
        <p className="mt-1 text-[0.6875rem] text-muted-foreground">
          {t("auth.signInSubtitle")}
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="micro">{t("auth.emailLabel")}</span>
        <input
          type="email"
          defaultValue="fahim@liliputerdunia.com.bd"
          className="h-8 rounded-md border border-border bg-card px-2.5 text-[0.6875rem] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="micro">{t("auth.passwordLabel")}</span>
        <input
          type="password"
          defaultValue="liliputer"
          className="h-8 rounded-md border border-border bg-card px-2.5 text-[0.6875rem] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </label>

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        {t("auth.signIn")}
      </Button>

      <div className="flex items-center justify-between text-[0.625rem]">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-foreground"
        >
          {t("auth.forgot")}
        </Link>
        <Link href="/signup" className="text-primary">
          {t("auth.signUp")}
        </Link>
      </div>

      <p className="text-center text-[0.5625rem] text-muted-foreground">
        {t("auth.demoHint")}
      </p>
    </form>
  )
}
