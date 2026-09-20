"use client"

import { motion } from "motion/react"

/**
 * The page transition lives in a template rather than the layout on purpose:
 * a template remounts with a fresh key on every navigation, so the enter
 * animation runs without `AnimatePresence mode="wait"` — which intermittently
 * stranded pages at opacity 0.
 */
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="flex h-full min-h-0 flex-col"
    >
      {children}
    </motion.div>
  )
}
