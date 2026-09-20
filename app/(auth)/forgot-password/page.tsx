"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"

export default function ForgotPasswordPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setBusy(true)
        setTimeout(() => router.push("/verify-otp"), 700)
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-xl font-medium tracking-tight">
          {t("auth.forgotTitle")}
        </h1>
        <p className="mt-1 text-[0.6875rem] text-muted-foreground">
          {t("auth.forgotSubtitle")}
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

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        {t("auth.sendCode")}
      </Button>

      <p className="text-center text-[0.625rem] text-muted-foreground">
        <Link href="/login" className="text-primary">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  )
}
