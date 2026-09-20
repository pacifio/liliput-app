"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Download, FileText, Play } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { DAY_MS, demoNow } from "@/lib/demo-time"
import { useLocale } from "@/lib/i18n/provider"
import type { Bilingual, TagHue } from "@/lib/types"

type Report = {
  id: string
  name: Bilingual
  category: Bilingual
  frequency: "daily" | "weekly" | "monthly" | "onDemand"
  hue: TagHue
}

const REPORTS: Report[] = [
  {
    id: "r1",
    name: { en: "Daily sales summary", bn: "দৈনিক বিক্রয় সারসংক্ষেপ" },
    category: { en: "Finance", bn: "অর্থ" },
    frequency: "daily",
    hue: "blue",
  },
  {
    id: "r2",
    name: { en: "Footfall by zone", bn: "জোনভিত্তিক ফুটফল" },
    category: { en: "Access", bn: "প্রবেশ" },
    frequency: "daily",
    hue: "teal",
  },
  {
    id: "r3",
    name: {
      en: "Wristband dwell analysis",
      bn: "রিস্টব্যান্ড অবস্থান বিশ্লেষণ",
    },
    category: { en: "Access", bn: "প্রবেশ" },
    frequency: "weekly",
    hue: "teal",
  },
  {
    id: "r4",
    name: { en: "Membership renewals due", bn: "নবায়নযোগ্য সদস্যপদ" },
    category: { en: "Membership", bn: "সদস্যপদ" },
    frequency: "weekly",
    hue: "amber",
  },
  {
    id: "r5",
    name: { en: "Outlet stock valuation", bn: "আউটলেট স্টক মূল্যায়ন" },
    category: { en: "Inventory", bn: "ইনভেন্টরি" },
    frequency: "monthly",
    hue: "green",
  },
  {
    id: "r6",
    name: { en: "Low stock reorder list", bn: "রিঅর্ডার তালিকা" },
    category: { en: "Inventory", bn: "ইনভেন্টরি" },
    frequency: "daily",
    hue: "green",
  },
  {
    id: "r7",
    name: {
      en: "Gateway settlement register",
      bn: "গেটওয়ে সেটেলমেন্ট রেজিস্টার",
    },
    category: { en: "Finance", bn: "অর্থ" },
    frequency: "daily",
    hue: "magenta",
  },
  {
    id: "r8",
    name: { en: "Branch performance league", bn: "শাখা পারফরম্যান্স লিগ" },
    category: { en: "Network", bn: "নেটওয়ার্ক" },
    frequency: "weekly",
    hue: "purple",
  },
  {
    id: "r9",
    name: {
      en: "Day-care occupancy & billing",
      bn: "ডে-কেয়ার অকুপেন্সি ও বিলিং",
    },
    category: { en: "Day-care", bn: "ডে-কেয়ার" },
    frequency: "daily",
    hue: "rose",
  },
  {
    id: "r10",
    name: { en: "Staff attendance register", bn: "স্টাফ উপস্থিতি রেজিস্টার" },
    category: { en: "Staff", bn: "স্টাফ" },
    frequency: "monthly",
    hue: "slate",
  },
  {
    id: "r11",
    name: { en: "Payroll disbursement sheet", bn: "পেরোল বিতরণ শিট" },
    category: { en: "Staff", bn: "স্টাফ" },
    frequency: "monthly",
    hue: "slate",
  },
  {
    id: "r12",
    name: { en: "Campaign attribution", bn: "ক্যাম্পেইন অ্যাট্রিবিউশন" },
    category: { en: "Marketing", bn: "মার্কেটিং" },
    frequency: "weekly",
    hue: "magenta",
  },
  {
    id: "r13",
    name: { en: "VAT return workings", bn: "ভ্যাট রিটার্ন হিসাব" },
    category: { en: "Finance", bn: "অর্থ" },
    frequency: "monthly",
    hue: "blue",
  },
  {
    id: "r14",
    name: { en: "Party booking pipeline", bn: "পার্টি বুকিং পাইপলাইন" },
    category: { en: "Bookings", bn: "বুকিং" },
    frequency: "weekly",
    hue: "amber",
  },
  {
    id: "r15",
    name: { en: "Corporate office P&L", bn: "কর্পোরেট অফিস লাভ-ক্ষতি" },
    category: { en: "Finance", bn: "অর্থ" },
    frequency: "monthly",
    hue: "purple",
  },
  {
    id: "r16",
    name: { en: "Device uptime log", bn: "ডিভাইস আপটাইম লগ" },
    category: { en: "Platform", bn: "প্ল্যাটফর্ম" },
    frequency: "onDemand",
    hue: "rose",
  },
]

const FREQUENCIES = ["all", "daily", "weekly", "monthly", "onDemand"] as const

export default function ReportsPage() {
  const { t, locale, relative } = useLocale()
  const data = useDataset()
  const [filter, setFilter] =
    React.useState<(typeof FREQUENCIES)[number]>("all")

  const rows =
    filter === "all" ? REPORTS : REPORTS.filter((r) => r.frequency === filter)

  const freqLabel = (frequency: Report["frequency"]) =>
    ({
      daily: t("reports.daily"),
      weekly: t("reports.weekly"),
      monthly: t("reports.monthly"),
      onDemand: t("reports.onDemand"),
    })[frequency]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")}>
        <SegmentedPills
          size="sm"
          value={filter}
          onChange={setFilter}
          options={FREQUENCIES.map((f) => ({
            value: f,
            label:
              f === "all"
                ? t("common.all")
                : freqLabel(f as Report["frequency"]),
          }))}
        />
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((report, index) => (
          <motion.article
            key={report.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: Math.min(index, 12) * 0.04 }}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="flex items-start gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.6875rem] font-medium">
                  {report.name[locale]}
                </p>
                <p className="truncate text-[0.5625rem] text-muted-foreground">
                  {report.category[locale]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <StatusTag hue={report.hue}>
                {freqLabel(report.frequency)}
              </StatusTag>
              <span className="ml-auto text-[0.5625rem] text-muted-foreground">
                {relative(demoNow() - (index + 1) * 0.4 * DAY_MS)}
              </span>
            </div>

            <div className="mt-auto flex gap-1.5 border-t border-[var(--hairline)] pt-2">
              <Button
                size="xs"
                className="flex-1"
                onClick={() =>
                  toast.success(report.name[locale], {
                    description: data.branch.name[locale],
                  })
                }
              >
                <Play />
                {t("reports.run")}
              </Button>
              <Button size="xs" variant="outline">
                <Download />
                {t("common.export")}
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </ScrollFade>
  )
}
