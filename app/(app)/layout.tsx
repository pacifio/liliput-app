"use client"

import { AppSidebar } from "@/components/shell/app-sidebar"
import { CommandPalette } from "@/components/shell/command-palette"
import { Topbar } from "@/components/shell/topbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
      <CommandPalette />
    </div>
  )
}
