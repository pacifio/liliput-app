import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter, Noto_Sans_Bengali } from "next/font/google"

import "./globals.css"
import { AppProviders } from "@/components/providers"
import { cn } from "@/lib/utils"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const fontBangla = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-bangla",
  display: "swap",
})

export const metadata: Metadata = {
  title: "লিলিপুটার দুনিয়া — অপারেশনস কনসোল",
  description:
    "Central operations console for the Liliputer Dunia indoor playground network — ticketing, wristband access, NFC membership, POS, day-care and a 30-branch cloud CRM.",
  applicationName: "Liliputer Dunia Console",
  authors: [{ name: "ReachSavvy Solution Ltd." }],
  creator: "ReachSavvy Solution Ltd.",
  publisher: "ReachSavvy Solution Ltd.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `font-sans` is applied in the base layer rather than as a utility here:
    // a utility class would outrank the html[lang="bn"] Bangla face rule.
    <html
      lang="bn"
      suppressHydrationWarning
      className={cn(fontSans.variable, fontMono.variable, fontBangla.variable)}
    >
      <body className="bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
