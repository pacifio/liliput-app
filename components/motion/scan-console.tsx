"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

export type ScanStage = "idle" | "detect" | "verify" | "resolved"

const STAGE_MS: Record<Exclude<ScanStage, "idle" | "resolved">, number> = {
  detect: 620,
  verify: 780,
}

/**
 * The shared read interaction behind every scanner in the app — QR wristbands,
 * NFC membership cards and the day-care desk. Keeping all three on one
 * primitive is what makes them read as the same system rather than three
 * separately-built screens.
 */
export function useScan<T>(resolve: (code: string) => T | undefined) {
  const [stage, setStage] = React.useState<ScanStage>("idle")
  const [code, setCode] = React.useState("")
  const [result, setResult] = React.useState<T | undefined>()
  const [missed, setMissed] = React.useState(false)
  const timers = React.useRef<number[]>([])

  const clear = React.useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  React.useEffect(() => clear, [clear])

  const scan = React.useCallback(
    (next: string) => {
      clear()
      setCode(next)
      setMissed(false)
      setResult(undefined)
      setStage("detect")
      timers.current.push(
        window.setTimeout(() => setStage("verify"), STAGE_MS.detect),
        window.setTimeout(() => {
          const hit = resolve(next)
          setResult(hit)
          setMissed(!hit)
          setStage("resolved")
        }, STAGE_MS.detect + STAGE_MS.verify)
      )
    },
    [clear, resolve]
  )

  const reset = React.useCallback(() => {
    clear()
    setStage("idle")
    setCode("")
    setResult(undefined)
    setMissed(false)
  }, [clear])

  return {
    stage,
    code,
    result,
    missed,
    scan,
    reset,
    busy: stage === "detect" || stage === "verify",
  }
}

export function ScanTarget({
  icon: Icon,
  stage,
  title,
  hint,
  detectLabel,
  verifyLabel,
  className,
}: {
  icon: LucideIcon
  stage: ScanStage
  title: string
  hint: string
  detectLabel: string
  verifyLabel: string
  className?: string
}) {
  const busy = stage === "detect" || stage === "verify"
  const done = stage === "resolved"

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl bg-surface px-5 py-7 ring-1 ring-foreground/[0.06]",
        className
      )}
    >
      <div className="relative flex size-20 items-center justify-center">
        {busy ? (
          <>
            <span className="animate-pulse-ring absolute inset-0 rounded-full border border-primary/40" />
            <span
              className="animate-pulse-ring absolute inset-0 rounded-full border border-primary/40"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        ) : null}
        <motion.span
          animate={{
            backgroundColor: done
              ? "color-mix(in oklch, var(--success) 16%, transparent)"
              : busy
                ? "var(--primary)"
                : "var(--muted)",
            color: done
              ? "var(--success)"
              : busy
                ? "var(--primary-foreground)"
                : "var(--muted-foreground)",
            scale: busy ? 1.05 : 1,
          }}
          transition={{ duration: 0.24 }}
          className="flex size-12 items-center justify-center rounded-2xl"
        >
          {done ? <Check className="size-5" /> : <Icon className="size-5" />}
        </motion.span>
      </div>

      <div className="text-center">
        <p className="text-xs font-medium">{title}</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.16 }}
            className="mt-1 max-w-[34ch] text-[0.6875rem] text-muted-foreground"
          >
            {stage === "detect"
              ? detectLabel
              : stage === "verify"
                ? verifyLabel
                : hint}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function ScanInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  action,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
  action: string
  disabled?: boolean
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="flex items-center gap-1.5"
    >
      <input
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        placeholder={placeholder}
        className="nums h-7 min-w-0 flex-1 rounded-full border border-border bg-card px-3 text-[0.6875rem] tracking-wider outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      />
      <Button size="sm" type="submit" disabled={disabled || !value.trim()}>
        {action}
      </Button>
    </form>
  )
}

/** A click-to-pick rail of plausible codes, so the demo never needs a real scanner. */
export function ScanPicker({
  label,
  items,
  onPick,
  /**
   * Hexadecimal codes (NFC card UIDs) must stay in Latin digits — localizing
   * them turns "F0 4B" into "F০ ৪B", which is no longer the value on the card.
   */
  localizeCode = true,
}: {
  label: string
  items: { code: string; primary: string; secondary?: string }[]
  onPick: (code: string) => void
  localizeCode?: boolean
}) {
  const { digits } = useLocale()
  return (
    <div className="min-w-0">
      <p className="micro mb-1.5">{label}</p>
      <ul className="flex flex-col gap-1">
        {items.map((item, index) => (
          <motion.li
            key={item.code}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.03 }}
          >
            <button
              onClick={() => onPick(item.code)}
              className="flex w-full items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 text-left ring-1 ring-foreground/[0.06] transition-colors hover:bg-muted/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.6875rem]">
                  {item.primary}
                </span>
                {item.secondary ? (
                  <span className="block truncate text-[0.5625rem] text-muted-foreground">
                    {item.secondary}
                  </span>
                ) : null}
              </span>
              <span className="nums shrink-0 font-mono text-[0.5625rem] text-muted-foreground">
                {localizeCode ? digits(item.code) : item.code}
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
