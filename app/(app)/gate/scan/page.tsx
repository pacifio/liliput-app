"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRight,
  LogIn,
  LogOut,
  MessageSquare,
  Printer,
  QrCode,
  RotateCcw,
  Ticket,
} from "lucide-react"
import { toast } from "sonner"

import { CapacityMeter } from "@/components/motion/capacity-meter"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { DwellTimer } from "@/components/motion/dwell-timer"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import {
  ScanInput,
  ScanPicker,
  ScanTarget,
  useScan,
} from "@/components/motion/scan-console"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import {
  liveMinutes,
  onFloor,
  sessionCharge,
  zoneHeadcount,
} from "@/lib/derive"
import { demoNow } from "@/lib/demo-time"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"
import type { Wristband } from "@/lib/types"

type Closed = {
  band: Wristband
  charge: ReturnType<typeof sessionCharge>
  exitAt: number
}

export default function ScanConsolePage() {
  const { t, locale, num, money, time, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const offline = useUi((s) => s.offlineMode)
  const enqueueSync = useUi((s) => s.enqueueSync)

  // Local overlay on top of the generated dataset — the demo mutates this,
  // never the dataset itself, so switching branch and back resets cleanly.
  const [closed, setClosed] = React.useState<Record<string, Closed>>({})
  const [issued, setIssued] = React.useState<Wristband[]>([])
  const [receipt, setReceipt] = React.useState<Closed | null>(null)

  const floor = React.useMemo(
    () => [...onFloor(data), ...issued].filter((b) => !closed[b.id]),
    [data, issued, closed]
  )

  const resolve = React.useCallback(
    (code: string) =>
      [...data.wristbands, ...issued].find(
        (b) => b.code.toUpperCase() === code.trim().toUpperCase()
      ),
    [data.wristbands, issued]
  )

  const scanner = useScan(resolve)
  const [typed, setTyped] = React.useState("")

  const band = scanner.result

  /**
   * A code the reader does not recognise as a band may still be an online
   * booking: the shop prints its reference on the customer's QR, and the desk
   * issues a band against it. Only bookings that have not been checked in yet
   * are offered.
   */
  const pendingBooking = React.useMemo(() => {
    if (band || scanner.stage !== "resolved") return undefined
    const code = scanner.code.trim().toUpperCase()
    if (!code) return undefined
    return data.bookings.find(
      (b) =>
        b.ref.toUpperCase() === code &&
        b.kind === "ticket" &&
        (b.status === "confirmed" || b.status === "pending")
    )
  }, [band, scanner.stage, scanner.code, data.bookings])
  const alreadyClosed = band ? closed[band.id] : undefined
  const isOnFloor =
    band &&
    !alreadyClosed &&
    (band.status === "active" || band.status === "overstay")

  const preview = band
    ? sessionCharge(
        band,
        data,
        alreadyClosed?.charge.minutes ?? liveMinutes(band)
      )
    : null

  const heads = zoneHeadcount(data)

  function closeBand() {
    if (!band || !preview) return
    const record: Closed = { band, charge: preview, exitAt: demoNow() }
    setClosed((state) => ({ ...state, [band.id]: record }))
    setReceipt(record)
    if (offline) {
      enqueueSync(1)
      toast.success(t("gate.exitRecorded"), {
        description: t("pos.saleQueued"),
      })
    } else {
      toast.success(t("gate.exitRecorded"), {
        description: money(preview.total),
      })
    }
    scanner.reset()
    setTyped("")
  }

  function issueBand() {
    const code = (typed || scanner.code).trim().toUpperCase()
    if (!code) return

    const guardian = pendingBooking
      ? data.customers.find((c) => c.id === pendingBooking.customerId)
      : undefined
    const child =
      (guardian
        ? data.children.find((c) => c.guardianId === guardian.id)
        : undefined) ??
      data.children[Math.floor(Math.random() * data.children.length)]
    const zone =
      data.zones.find((z) => child.age >= z.minAge && child.age <= z.maxAge) ??
      data.zones[0]

    // A band issued against a booking carries a fresh printed code; the
    // booking reference stays on the booking.
    const bandCode = pendingBooking
      ? `LD-${String(Math.floor(100000 + Math.random() * 899999))}`
      : code

    const next: Wristband = {
      id: `bnd_live_${bandCode}`,
      code: bandCode,
      childId: child.id,
      guardianId: guardian?.id ?? child.guardianId,
      zoneId: zone.id,
      slabId: data.slabs[1].id,
      entryAt: demoNow(),
      minutes: 0,
      status: "active",
      gate: { en: "Main Gate", bn: "মূল ফটক" },
      operatorId: data.staff[0].id,
    }
    setIssued((state) => [next, ...state])
    if (offline) enqueueSync(1)
    toast.success(t("gate.entryRecorded"), {
      description: `${child.name[locale]} · ${zone.name[locale]}`,
    })
    scanner.reset()
    setTyped("")
  }

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader title={t("gate.scanTitle")} subtitle={t("gate.scanSubtitle")}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            scanner.reset()
            setTyped("")
            setReceipt(null)
          }}
        >
          <RotateCcw />
          {t("common.reset")}
        </Button>
      </PageHeader>

      <div className="grid items-start gap-3 px-5 pb-6 lg:grid-cols-[1.1fr_1fr]">
        <Panel title={t("gate.scanPrompt")} delay={0}>
          <ScanTarget
            icon={QrCode}
            stage={scanner.stage}
            title={t("gate.scanPrompt")}
            hint={t("gate.scanHint")}
            detectLabel={t("gate.scanning")}
            verifyLabel={t("gate.verifying")}
          />

          <div className="mt-3">
            <ScanInput
              value={typed}
              onChange={setTyped}
              onSubmit={() => scanner.scan(typed)}
              placeholder="LD-______"
              action={t("common.search")}
              disabled={scanner.busy}
            />
          </div>

          <AnimatePresence mode="wait">
            {scanner.stage === "resolved" ? (
              <motion.div
                key={band?.id ?? "miss"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 rounded-lg bg-card p-3 ring-1 ring-foreground/10"
              >
                {band && preview ? (
                  <>
                    <div className="flex items-start gap-3">
                      <DwellTimer
                        entryAt={band.entryAt}
                        frozenMinutes={isOnFloor ? undefined : preview.minutes}
                        includedMinutes={preview.slab.includedMinutes}
                        size={44}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {lookups.child.get(band.childId)?.name[locale]}
                        </p>
                        <p className="truncate text-[0.625rem] text-muted-foreground">
                          {lookups.customer.get(band.guardianId)?.name[locale]}
                          {" · "}
                          {lookups.zone.get(band.zoneId)?.name[locale]}
                        </p>
                        <p className="nums mt-0.5 font-mono text-[0.5625rem] text-muted-foreground">
                          {digits(band.code)}
                        </p>
                      </div>
                      <StatusTag
                        hue={
                          isOnFloor
                            ? band.status === "overstay"
                              ? "rose"
                              : "green"
                            : "slate"
                        }
                        dot
                      >
                        {isOnFloor
                          ? band.status === "overstay"
                            ? t("gate.statusOverstay")
                            : t("gate.statusActive")
                          : t("gate.statusExited")}
                      </StatusTag>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.6875rem]">
                      <Row
                        label={t("gate.entryTime")}
                        value={time(band.entryAt)}
                      />
                      <Row
                        label={t("gate.slab")}
                        value={preview.slab.name[locale]}
                      />
                      <Row
                        label={t("gate.dwell")}
                        value={`${num(preview.minutes)} ${t("common.minutes")}`}
                      />
                      <Row
                        label={t("gate.included")}
                        value={`${num(preview.slab.includedMinutes)} ${t("common.minutes")}`}
                      />
                    </dl>

                    <div className="mt-3 rounded-lg bg-surface p-2.5 ring-1 ring-foreground/[0.06]">
                      <Line
                        label={preview.slab.name[locale]}
                        value={money(preview.slab.basePrice)}
                      />
                      {preview.over > 0 ? (
                        <Line
                          label={t("gate.overtimeBlocks", {
                            blocks: num(preview.blocks),
                            minutes: num(preview.slab.overtimeBlock),
                          })}
                          value={money(preview.overtime)}
                          tone="var(--warning)"
                        />
                      ) : null}
                      {preview.discount > 0 ? (
                        <Line
                          label={t("gate.memberDiscount")}
                          value={`− ${money(preview.discount)}`}
                          tone="var(--success)"
                        />
                      ) : null}
                      <div className="mt-2 flex items-baseline justify-between border-t border-[var(--hairline)] pt-2">
                        <span className="text-[0.6875rem] font-medium">
                          {t("gate.payable")}
                        </span>
                        <span className="figure text-lg leading-none">
                          {money(preview.total)}
                        </span>
                      </div>
                    </div>

                    {isOnFloor ? (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={closeBand}
                      >
                        <LogOut />
                        {t("gate.closeBand")}
                      </Button>
                    ) : (
                      <p className="mt-3 text-center text-[0.625rem] text-muted-foreground">
                        {t("gate.exitRecorded")} ·{" "}
                        {time(alreadyClosed?.exitAt ?? band.exitAt ?? 0)}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    {pendingBooking ? (
                      <>
                        <p className="text-xs font-medium">
                          {t("gate.bookingFound")}
                        </p>
                        <p className="mt-1 text-[0.625rem] text-muted-foreground">
                          {
                            lookups.customer.get(pendingBooking.customerId)
                              ?.name[locale]
                          }
                          {" · "}
                          {t("gate.bookingHeads", {
                            count: num(pendingBooking.heads),
                          })}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                          <StatusTag hue="teal">
                            {t("bookings.channelApp")}
                          </StatusTag>
                          <span className="nums font-mono text-[0.5625rem] text-muted-foreground">
                            {digits(pendingBooking.ref)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium">
                          {t("gate.notFound")}
                        </p>
                        <p className="mt-1 text-[0.625rem] text-muted-foreground">
                          {t("gate.issueTitle")} · {digits(scanner.code)}
                        </p>
                      </>
                    )}
                    <Button size="sm" className="mt-3" onClick={issueBand}>
                      <LogIn />
                      {t("gate.issue")}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {receipt ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-lg border border-dashed border-border p-3"
            >
              <p className="micro mb-2">{t("gate.receipt")}</p>
              <div className="font-mono text-[0.625rem] leading-relaxed">
                <p>{data.branch.name[locale]}</p>
                <p className="text-muted-foreground">
                  {digits(receipt.band.code)} · {time(receipt.exitAt)}
                </p>
                <p className="mt-1">
                  {num(receipt.charge.minutes)} {t("common.minutes")} —{" "}
                  {money(receipt.charge.total)}
                </p>
              </div>
              <div className="mt-2 flex gap-1.5">
                <Button size="xs" variant="outline">
                  <Printer />
                  {t("gate.printReceipt")}
                </Button>
                <Button size="xs" variant="outline">
                  <MessageSquare />
                  {t("gate.smsGuardian")}
                </Button>
              </div>
            </motion.div>
          ) : null}
        </Panel>

        <div className="flex flex-col gap-3">
          <Panel
            title={t("gate.capacityTitle")}
            subtitle={t("gate.capacitySubtitle")}
            delay={0.05}
            bodyClassName="flex flex-col gap-2.5"
          >
            {data.zones.map((zone, index) => (
              <CapacityMeter
                key={zone.id}
                value={heads.get(zone.id) ?? 0}
                capacity={zone.capacity}
                hue={zone.hue}
                label={zone.name[locale]}
                delay={index * 0.04}
              />
            ))}
          </Panel>

          <Panel title={t("gate.pickBand")} delay={0.1}>
            <ScanPicker
              label={t("gate.pickBand")}
              items={floor.slice(0, 9).map((b) => ({
                code: b.code,
                primary: lookups.child.get(b.childId)?.name[locale] ?? b.code,
                secondary: `${lookups.zone.get(b.zoneId)?.name[locale]} · ${time(b.entryAt)}`,
              }))}
              onPick={(code) => {
                setTyped(code)
                scanner.scan(code)
              }}
            />
            <button
              onClick={() => {
                const code = `LD-${String(Math.floor(100000 + Math.random() * 899999))}`
                setTyped(code)
                scanner.scan(code)
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-[0.625rem] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <Ticket className="size-3" />
              {t("gate.issueTitle")}
              <ArrowRight className="size-3" />
            </button>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="nums truncate font-medium">{value}</dd>
    </div>
  )
}

function Line({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 text-[0.6875rem]">
      <span className="min-w-0 truncate text-muted-foreground">{label}</span>
      <span className="nums shrink-0 font-medium" style={{ color: tone }}>
        {value}
      </span>
    </div>
  )
}
