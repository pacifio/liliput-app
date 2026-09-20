"use client"

import * as React from "react"
import { motion } from "motion/react"

import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

/**
 * The shop runs at consumer scale — larger type, rounder corners, bigger tap
 * targets — while drawing on exactly the same tokens as the operator console.
 * These wrappers keep that difference in one place instead of scattering size
 * overrides through every screen.
 */

export function ShopButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md"
}) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        size === "md" ? "h-11 px-4 text-sm" : "h-9 px-3 text-[0.8125rem]",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" &&
          "border border-border bg-card hover:bg-muted/60",
        variant === "ghost" && "text-muted-foreground hover:bg-muted/60",
        className
      )}
      {...props}
    />
  )
}

export function ShopCard({
  className,
  delay = 0,
  ...props
}: React.ComponentProps<typeof motion.div> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10",
        className
      )}
      {...props}
    />
  )
}

export function SectionTitle({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-medium tracking-tight @lg:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-[52ch] text-[0.8125rem] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

/** Prices are the one number a customer actually reads, so they get room. */
export function Price({
  amount,
  suffix,
  className,
}: {
  amount: number
  suffix?: string
  className?: string
}) {
  const { money } = useLocale()
  return (
    <span className={cn("nums font-medium", className)}>
      {money(amount)}
      {suffix ? (
        <span className="ml-1 text-[0.6875rem] font-normal text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </span>
  )
}

/** A soft tinted wash used behind hero art and category tiles. */
export function HueWash({
  hue,
  className,
  children,
}: {
  hue: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(140deg, color-mix(in oklch, ${hue} 24%, var(--card)), color-mix(in oklch, ${hue} 6%, var(--card)))`,
      }}
    >
      {children}
    </div>
  )
}
