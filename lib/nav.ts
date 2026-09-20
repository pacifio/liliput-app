import {
  Activity,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  Blocks,
  Boxes,
  Building2,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Gauge,
  Gift,
  Globe,
  HeartHandshake,
  Home,
  Inbox,
  Languages,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Monitor,
  Nfc,
  Package,
  PartyPopper,
  Percent,
  Plug,
  QrCode,
  Receipt,
  ScanLine,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
  Ticket,
  Timer,
  Truck,
  Users,
  UsersRound,
  Wallet,
  Watch,
  type LucideIcon,
} from "lucide-react"

import type { TranslationKey } from "@/lib/i18n"

/** Live counts a nav row can badge itself with, derived from the dataset. */
export type NavCount =
  | "bandsOnFloor"
  | "childrenInCare"
  | "openBookings"
  | "expiringMemberships"
  | "lowStock"
  | "pendingExpenses"
  | "offlineQueue"

export type NavItem = {
  href: string
  labelKey: TranslationKey
  icon: LucideIcon
  /** One level of disclosure only — deeper trees stop being scannable. */
  children?: NavItem[]
  countOf?: NavCount
}

export type NavGroup = {
  id: string
  labelKey: TranslationKey
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    id: "overview",
    labelKey: "nav.overview",
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/activity", labelKey: "nav.activity", icon: Activity },
    ],
  },
  {
    id: "access",
    labelKey: "nav.access",
    items: [
      {
        href: "/gate",
        labelKey: "nav.gate",
        icon: ScanLine,
        countOf: "bandsOnFloor",
        children: [
          { href: "/gate", labelKey: "nav.gate", icon: Home },
          { href: "/gate/scan", labelKey: "nav.gateScan", icon: QrCode },
          { href: "/gate/tickets", labelKey: "nav.tickets", icon: Ticket },
          {
            href: "/gate/wristbands",
            labelKey: "nav.wristbands",
            icon: Watch,
            countOf: "bandsOnFloor",
          },
          { href: "/gate/sessions", labelKey: "nav.sessions", icon: Timer },
          { href: "/gate/capacity", labelKey: "nav.capacity", icon: Gauge },
        ],
      },
      {
        href: "/memberships",
        labelKey: "nav.membership",
        icon: BadgeCheck,
        countOf: "expiringMemberships",
        children: [
          { href: "/memberships", labelKey: "nav.members", icon: UsersRound },
          { href: "/memberships/cards", labelKey: "nav.cards", icon: Nfc },
          { href: "/memberships/plans", labelKey: "nav.plans", icon: Blocks },
          {
            href: "/memberships/vouchers",
            labelKey: "nav.vouchers",
            icon: Percent,
          },
        ],
      },
      {
        href: "/daycare",
        labelKey: "nav.daycare",
        icon: HeartHandshake,
        countOf: "childrenInCare",
        children: [
          {
            href: "/daycare",
            labelKey: "nav.daycareBoard",
            icon: ListChecks,
            countOf: "childrenInCare",
          },
          {
            href: "/daycare/checkin",
            labelKey: "nav.daycareCheckin",
            icon: ScanLine,
          },
          {
            href: "/daycare/billing",
            labelKey: "nav.daycareBilling",
            icon: Receipt,
          },
        ],
      },
      {
        href: "/bookings",
        labelKey: "nav.bookings",
        icon: CalendarDays,
        countOf: "openBookings",
        children: [
          {
            href: "/bookings",
            labelKey: "nav.bookingList",
            icon: ClipboardList,
            countOf: "openBookings",
          },
          { href: "/bookings/new", labelKey: "nav.bookingNew", icon: Sparkles },
          {
            href: "/bookings/calendar",
            labelKey: "nav.bookingCalendar",
            icon: CalendarRange,
          },
          {
            href: "/bookings/parties",
            labelKey: "nav.parties",
            icon: PartyPopper,
          },
        ],
      },
    ],
  },
  {
    id: "commerce",
    labelKey: "nav.commerce",
    items: [
      { href: "/pos", labelKey: "nav.pos", icon: ShoppingCart },
      {
        href: "/outlets",
        labelKey: "nav.outlets",
        icon: Store,
        children: [
          { href: "/outlets", labelKey: "nav.outlets", icon: Store },
          { href: "/outlets/menu", labelKey: "nav.menu", icon: ShoppingBag },
        ],
      },
      {
        href: "/inventory/stock",
        labelKey: "nav.inventory",
        icon: Boxes,
        countOf: "lowStock",
        children: [
          {
            href: "/inventory/stock",
            labelKey: "nav.stock",
            icon: Package,
            countOf: "lowStock",
          },
          {
            href: "/inventory/purchase-orders",
            labelKey: "nav.purchaseOrders",
            icon: ClipboardList,
          },
          {
            href: "/inventory/suppliers",
            labelKey: "nav.suppliers",
            icon: Truck,
          },
          {
            href: "/inventory/transfers",
            labelKey: "nav.transfers",
            icon: Globe,
          },
        ],
      },
    ],
  },
  {
    id: "customers",
    labelKey: "nav.customers",
    items: [
      {
        href: "/customers",
        labelKey: "nav.customerList",
        icon: Users,
        children: [
          { href: "/customers", labelKey: "nav.customerList", icon: Users },
          {
            href: "/customers/children",
            labelKey: "nav.childProfiles",
            icon: HeartHandshake,
          },
          {
            href: "/customers/segments",
            labelKey: "nav.segments",
            icon: BarChart3,
          },
          {
            href: "/customers/campaigns",
            labelKey: "nav.campaigns",
            icon: Megaphone,
          },
          { href: "/customers/loyalty", labelKey: "nav.loyalty", icon: Gift },
        ],
      },
      {
        href: "/messaging/sms",
        labelKey: "nav.messaging",
        icon: MessageSquare,
        children: [
          { href: "/messaging/sms", labelKey: "nav.sms", icon: MessageSquare },
          { href: "/messaging/email", labelKey: "nav.emailPortal", icon: Mail },
          {
            href: "/messaging/templates",
            labelKey: "nav.templates",
            icon: Inbox,
          },
        ],
      },
    ],
  },
  {
    id: "network",
    labelKey: "nav.network",
    items: [
      {
        href: "/branches",
        labelKey: "nav.branchRollup",
        icon: Building2,
        children: [
          {
            href: "/branches",
            labelKey: "nav.branchRollup",
            icon: Building2,
          },
          {
            href: "/branches/compare",
            labelKey: "nav.branchCompare",
            icon: BarChart3,
          },
          { href: "/branches/live", labelKey: "nav.branchLive", icon: MapPin },
          {
            href: "/branches/targets",
            labelKey: "nav.branchTargets",
            icon: Target,
          },
        ],
      },
    ],
  },
  {
    id: "money",
    labelKey: "nav.money",
    items: [
      {
        href: "/payments",
        labelKey: "nav.payments",
        icon: CreditCard,
        children: [
          { href: "/payments", labelKey: "nav.payments", icon: CreditCard },
          { href: "/payments/gateways", labelKey: "nav.gateways", icon: Plug },
          { href: "/payments/refunds", labelKey: "nav.refunds", icon: Receipt },
          {
            href: "/payments/settlements",
            labelKey: "nav.settlements",
            icon: Wallet,
          },
        ],
      },
      {
        href: "/finance/revenue",
        labelKey: "nav.money",
        icon: CircleDollarSign,
        countOf: "pendingExpenses",
        children: [
          {
            href: "/finance/revenue",
            labelKey: "nav.revenue",
            icon: CircleDollarSign,
          },
          {
            href: "/finance/expenses",
            labelKey: "nav.expenses",
            icon: Banknote,
            countOf: "pendingExpenses",
          },
          {
            href: "/finance/invoices",
            labelKey: "nav.invoices",
            icon: Receipt,
          },
          {
            href: "/finance/daybook",
            labelKey: "nav.daybook",
            icon: ClipboardList,
          },
        ],
      },
      {
        href: "/staff/directory",
        labelKey: "nav.staff",
        icon: UsersRound,
        children: [
          {
            href: "/staff/directory",
            labelKey: "nav.directory",
            icon: UsersRound,
          },
          {
            href: "/staff/roster",
            labelKey: "nav.roster",
            icon: CalendarRange,
          },
          {
            href: "/staff/attendance",
            labelKey: "nav.attendance",
            icon: ListChecks,
          },
          { href: "/staff/payroll", labelKey: "nav.payroll", icon: Banknote },
        ],
      },
      { href: "/reports", labelKey: "nav.reports", icon: BarChart3 },
    ],
  },
  {
    id: "administration",
    labelKey: "nav.administration",
    items: [
      {
        href: "/admin/users",
        labelKey: "nav.administration",
        icon: ShieldCheck,
        countOf: "offlineQueue",
        children: [
          { href: "/admin/users", labelKey: "nav.users", icon: Users },
          { href: "/admin/roles", labelKey: "nav.roles", icon: ShieldCheck },
          { href: "/admin/devices", labelKey: "nav.devices", icon: Monitor },
          {
            href: "/admin/integrations",
            labelKey: "nav.integrations",
            icon: Plug,
          },
          {
            href: "/admin/audit-log",
            labelKey: "nav.auditLog",
            icon: ClipboardList,
          },
          {
            href: "/admin/health",
            labelKey: "nav.health",
            icon: Gauge,
            countOf: "offlineQueue",
          },
        ],
      },
      {
        href: "/settings/general",
        labelKey: "nav.settings",
        icon: Settings,
        children: [
          {
            href: "/settings/general",
            labelKey: "nav.general",
            icon: Settings,
          },
          {
            href: "/settings/localization",
            labelKey: "nav.localization",
            icon: Languages,
          },
          {
            href: "/settings/appearance",
            labelKey: "nav.appearance",
            icon: Sparkles,
          },
          {
            href: "/settings/notifications",
            labelKey: "nav.notifications",
            icon: Bell,
          },
        ],
      },
    ],
  },
]

/** Flat list of every leaf route — the command palette and breadcrumbs read this. */
export const NAV_INDEX: {
  href: string
  labelKey: TranslationKey
  groupKey: TranslationKey
  icon: LucideIcon
}[] = NAV.flatMap((group) =>
  group.items.flatMap((item) =>
    item.children
      ? item.children.map((child) => ({
          href: child.href,
          labelKey: child.labelKey,
          groupKey: group.labelKey,
          icon: child.icon,
        }))
      : [
          {
            href: item.href,
            labelKey: item.labelKey,
            groupKey: group.labelKey,
            icon: item.icon,
          },
        ]
  )
)
