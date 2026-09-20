"use client"

import { ShopShell } from "@/components/shop/shop-shell"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ShopShell>{children}</ShopShell>
}
