import type {
  Bilingual,
  DeviceKind,
  Gateway,
  OutletKind,
  TagHue,
} from "@/lib/types"

/**
 * Enum labels that are proper nouns or brands. These stay out of the i18n
 * dictionaries, which are about interface language — "bKash" is spelled
 * "bKash" in both locales.
 */

export const GATEWAY_LABEL: Record<Gateway, Bilingual> = {
  sslcommerz: { en: "SSLCommerz", bn: "SSLCommerz" },
  reddot: { en: "RedDot Digital", bn: "RedDot Digital" },
  bkash: { en: "bKash", bn: "বিকাশ" },
  nagad: { en: "Nagad", bn: "নগদ" },
  rocket: { en: "Rocket", bn: "রকেট" },
  card: { en: "Card", bn: "কার্ড" },
  cash: { en: "Cash", bn: "ক্যাশ" },
}

export const GATEWAY_HUE: Record<Gateway, TagHue> = {
  sslcommerz: "blue",
  reddot: "rose",
  bkash: "magenta",
  nagad: "amber",
  rocket: "purple",
  card: "teal",
  cash: "green",
}

export const OUTLET_LABEL: Record<OutletKind, Bilingual> = {
  toys: { en: "Toy Shop", bn: "টয় শপ" },
  food: { en: "Food Court", bn: "ফুড কোর্ট" },
  books: { en: "Books & Gifts", bn: "বই ও উপহার" },
  cosmetics: { en: "Kids Care", bn: "কিডস কেয়ার" },
}

export const DEVICE_LABEL: Record<DeviceKind, Bilingual> = {
  pos: { en: "POS terminal", bn: "POS টার্মিনাল" },
  printer: { en: "Receipt printer", bn: "রিসিট প্রিন্টার" },
  drawer: { en: "Cash drawer", bn: "ক্যাশ ড্রয়ার" },
  scanner: { en: "QR scanner", bn: "কিউআর স্ক্যানার" },
  nfc: { en: "NFC reader", bn: "এনএফসি রিডার" },
  turnstile: { en: "Turnstile", bn: "টার্নস্টাইল" },
  tablet: { en: "Floor tablet", bn: "ফ্লোর ট্যাবলেট" },
}

export const DEVICE_HUE: Record<DeviceKind, TagHue> = {
  pos: "blue",
  printer: "teal",
  drawer: "amber",
  scanner: "purple",
  nfc: "magenta",
  turnstile: "rose",
  tablet: "green",
}
