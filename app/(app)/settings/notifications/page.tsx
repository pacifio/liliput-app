"use client"

import * as React from "react"
import { Bell, Mail, MessageSquare } from "lucide-react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { Switch } from "@/components/ui/switch"
import { useLocale } from "@/lib/i18n/provider"
import type { TranslationKey } from "@/lib/i18n"

const ALERTS: { id: string; labelKey: TranslationKey; defaults: string[] }[] = [
  { id: "capacity", labelKey: "settings.alertCapacity", defaults: ["inApp"] },
  {
    id: "overstay",
    labelKey: "settings.alertOverstay",
    defaults: ["inApp", "sms"],
  },
  {
    id: "lowStock",
    labelKey: "settings.alertLowStock",
    defaults: ["inApp", "email"],
  },
  { id: "expiring", labelKey: "settings.alertExpiring", defaults: ["email"] },
  { id: "device", labelKey: "settings.alertDevice", defaults: ["inApp"] },
  {
    id: "settlement",
    labelKey: "settings.alertSettlement",
    defaults: ["inApp", "email"],
  },
]

const CHANNELS = [
  { id: "inApp", labelKey: "settings.inApp" as TranslationKey, icon: Bell },
  {
    id: "email",
    labelKey: "settings.emailChannel" as TranslationKey,
    icon: Mail,
  },
  {
    id: "sms",
    labelKey: "settings.smsChannel" as TranslationKey,
    icon: MessageSquare,
  },
]

export default function NotificationSettingsPage() {
  const { t } = useLocale()
  const [state, setState] = React.useState<Record<string, string[]>>(() =>
    Object.fromEntries(ALERTS.map((a) => [a.id, a.defaults]))
  )

  const toggle = (alertId: string, channelId: string) =>
    setState((current) => {
      const on = current[alertId] ?? []
      return {
        ...current,
        [alertId]: on.includes(channelId)
          ? on.filter((c) => c !== channelId)
          : [...on, channelId],
      }
    })

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("settings.notificationsTitle")}
        subtitle={t("settings.notificationsSubtitle")}
      />

      <div className="px-5 pb-6">
        <Panel title={t("settings.channels")} delay={0}>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th className="micro px-2 py-2 text-left">
                    {t("dashboard.alerts")}
                  </th>
                  {CHANNELS.map((channel) => (
                    <th
                      key={channel.id}
                      className="micro px-2 py-2 text-center whitespace-nowrap"
                    >
                      <span className="inline-flex items-center gap-1">
                        <channel.icon className="size-2.5" />
                        {t(channel.labelKey)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALERTS.map((alert) => (
                  <tr key={alert.id}>
                    <td className="border-b border-[var(--hairline)] px-2 py-2 text-[0.6875rem]">
                      {t(alert.labelKey)}
                    </td>
                    {CHANNELS.map((channel) => (
                      <td
                        key={channel.id}
                        className="border-b border-[var(--hairline)] px-2 py-2 text-center"
                      >
                        <Switch
                          checked={(state[alert.id] ?? []).includes(channel.id)}
                          onCheckedChange={() => toggle(alert.id, channel.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </ScrollFade>
  )
}
