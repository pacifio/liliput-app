"use client"

import * as React from "react"

import { hashSeed } from "@/lib/mock/rng"
import { cn } from "@/lib/utils"

/**
 * A deterministic QR-style block rendered from the booking reference.
 *
 * It is decorative: nothing in this prototype reads a camera, and the code a
 * gate operator actually types is printed beneath it. It is generated from a
 * hash of the value so the same booking always draws the same pattern, and so
 * the server render and the client hydrate agree.
 */
export function QrCode({
  value,
  size = 148,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const modules = 25

  const cells = React.useMemo(() => {
    const seed = hashSeed(value)
    const out: boolean[] = []
    for (let i = 0; i < modules * modules; i++) {
      // A cheap integer hash per cell — stable, and dense enough to read as a
      // real code at a glance.
      const h = Math.imul(seed ^ (i * 2654435761), 2246822519) >>> 0
      out.push(((h >>> 13) & 3) !== 0)
    }
    return out
  }, [value])

  const isFinder = (row: number, col: number) => {
    const inBox = (r0: number, c0: number) =>
      row >= r0 && row < r0 + 7 && col >= c0 && col < c0 + 7
    return inBox(0, 0) || inBox(0, modules - 7) || inBox(modules - 7, 0)
  }

  const finderOn = (row: number, col: number) => {
    const local = (r0: number, c0: number) => {
      const r = row - r0
      const c = col - c0
      const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3))
      return ring !== 2
    }
    if (row < 7 && col < 7) return local(0, 0)
    if (row < 7 && col >= modules - 7) return local(0, modules - 7)
    return local(modules - 7, 0)
  }

  return (
    <div
      className={cn("shrink-0 rounded-xl bg-white p-3", className)}
      style={{ width: size + 24, height: size + 24 }}
      aria-label={value}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${modules} ${modules}`}
        className="block"
      >
        {Array.from({ length: modules * modules }, (_, i) => {
          const row = Math.floor(i / modules)
          const col = i % modules
          const on = isFinder(row, col) ? finderOn(row, col) : cells[i]
          if (!on) return null
          // Quiet zone around the finders so they stay legible.
          if (!isFinder(row, col) && row < 8 && col < 8) return null
          if (!isFinder(row, col) && row < 8 && col >= modules - 8) return null
          if (!isFinder(row, col) && row >= modules - 8 && col < 8) return null
          return (
            <rect
              key={i}
              x={col}
              y={row}
              width={1}
              height={1}
              rx={0.25}
              fill="#0a0a0a"
            />
          )
        })}
      </svg>
      <span className="sr-only">{value}</span>
    </div>
  )
}
