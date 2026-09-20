import type { Bilingual } from "@/lib/types"

/* ---------------------------------------------------------------- *
 * NAMES — guardians and children are drawn from separate pools. The
 * demo is about children; reusing adult names for them reads wrong.
 * ---------------------------------------------------------------- */

export const ADULT_GIVEN: Bilingual[] = [
  { en: "Nusrat", bn: "নুসরাত" },
  { en: "Tanvir", bn: "তানভীর" },
  { en: "Rubaiya", bn: "রুবাইয়া" },
  { en: "Imran", bn: "ইমরান" },
  { en: "Sadia", bn: "সাদিয়া" },
  { en: "Mahfuz", bn: "মাহফুজ" },
  { en: "Farzana", bn: "ফারজানা" },
  { en: "Rakib", bn: "রাকিব" },
  { en: "Sabrina", bn: "সাবরিনা" },
  { en: "Jubayer", bn: "জুবায়ের" },
  { en: "Tahmina", bn: "তাহমিনা" },
  { en: "Shahriar", bn: "শাহরিয়ার" },
  { en: "Mouri", bn: "মৌরি" },
  { en: "Asif", bn: "আসিফ" },
  { en: "Nazia", bn: "নাজিয়া" },
  { en: "Fahim", bn: "ফাহিম" },
  { en: "Ishrat", bn: "ইশরাত" },
  { en: "Sohel", bn: "সোহেল" },
  { en: "Mitu", bn: "মিতু" },
  { en: "Arif", bn: "আরিফ" },
  { en: "Rehnuma", bn: "রেহনুমা" },
  { en: "Shakib", bn: "সাকিব" },
  { en: "Anika", bn: "আনিকা" },
  { en: "Mizanur", bn: "মিজানুর" },
  { en: "Sharmin", bn: "শারমিন" },
  { en: "Hasibul", bn: "হাসিবুল" },
  { en: "Rumana", bn: "রুমানা" },
  { en: "Kamrul", bn: "কামরুল" },
  { en: "Nadia", bn: "নাদিয়া" },
  { en: "Emran", bn: "এমরান" },
]

export const FAMILY: Bilingual[] = [
  { en: "Islam", bn: "ইসলাম" },
  { en: "Rahman", bn: "রহমান" },
  { en: "Ahmed", bn: "আহমেদ" },
  { en: "Hossain", bn: "হোসেন" },
  { en: "Chowdhury", bn: "চৌধুরী" },
  { en: "Akter", bn: "আক্তার" },
  { en: "Khan", bn: "খান" },
  { en: "Hasan", bn: "হাসান" },
  { en: "Karim", bn: "করিম" },
  { en: "Sultana", bn: "সুলতানা" },
  { en: "Mahmud", bn: "মাহমুদ" },
  { en: "Siddique", bn: "সিদ্দিক" },
  { en: "Bhuiyan", bn: "ভূঁইয়া" },
  { en: "Talukder", bn: "তালুকদার" },
  { en: "Sarker", bn: "সরকার" },
  { en: "Mollah", bn: "মোল্লা" },
]

export const CHILD_BOY: Bilingual[] = [
  { en: "Arham", bn: "আরহাম" },
  { en: "Zayan", bn: "যায়ান" },
  { en: "Rayan", bn: "রায়ান" },
  { en: "Ayaan", bn: "আয়ান" },
  { en: "Nihal", bn: "নিহাল" },
  { en: "Ridwan", bn: "রিদওয়ান" },
  { en: "Samin", bn: "সামিন" },
  { en: "Tahsin", bn: "তাহসিন" },
  { en: "Arnob", bn: "অর্ণব" },
  { en: "Adib", bn: "আদিব" },
  { en: "Nabil", bn: "নাবিল" },
  { en: "Rehan", bn: "রেহান" },
  { en: "Shafin", bn: "শাফিন" },
  { en: "Tahmid", bn: "তাহমিদ" },
  { en: "Yusuf", bn: "ইউসুফ" },
  { en: "Zarif", bn: "জারিফ" },
  { en: "Ishan", bn: "ঈশান" },
  { en: "Abrar", bn: "আবরার" },
]

export const CHILD_GIRL: Bilingual[] = [
  { en: "Arisha", bn: "আরিশা" },
  { en: "Zunairah", bn: "জুনাইরা" },
  { en: "Maliha", bn: "মালিহা" },
  { en: "Anaya", bn: "আনায়া" },
  { en: "Rufaida", bn: "রুফাইদা" },
  { en: "Nusaiba", bn: "নুসাইবা" },
  { en: "Aurin", bn: "অরিন" },
  { en: "Ritu", bn: "ঋতু" },
  { en: "Samira", bn: "সামিরা" },
  { en: "Tasnia", bn: "তাসনিয়া" },
  { en: "Mehrin", bn: "মেহরিন" },
  { en: "Ayesha", bn: "আয়েশা" },
  { en: "Nawal", bn: "নাওয়াল" },
  { en: "Prapti", bn: "প্রাপ্তি" },
  { en: "Zahra", bn: "জাহরা" },
  { en: "Oishi", bn: "ঐশী" },
  { en: "Labiba", bn: "লাবিবা" },
  { en: "Raisa", bn: "রাইসা" },
]

export function adultName(i: number, j: number): Bilingual {
  const g = ADULT_GIVEN[i % ADULT_GIVEN.length]
  const f = FAMILY[j % FAMILY.length]
  return { en: `${g.en} ${f.en}`, bn: `${g.bn} ${f.bn}` }
}

export function childName(
  i: number,
  j: number,
  gender: "boy" | "girl"
): Bilingual {
  const pool = gender === "boy" ? CHILD_BOY : CHILD_GIRL
  const g = pool[i % pool.length]
  const f = FAMILY[j % FAMILY.length]
  return { en: `${g.en} ${f.en}`, bn: `${g.bn} ${f.bn}` }
}

/* ---------------------------------------------------------------- *
 * PLAY FLOOR
 * ---------------------------------------------------------------- */

export const ZONE_SPEC = [
  {
    key: "ballpit",
    name: { en: "Ball Pit", bn: "বল পিট" },
    age: { en: "2–8 yrs", bn: "২–৮ বছর" },
    minAge: 2,
    maxAge: 8,
    share: 0.18,
    hue: "amber",
    supervised: true,
  },
  {
    key: "trampoline",
    name: { en: "Trampoline Park", bn: "ট্রাম্পোলিন পার্ক" },
    age: { en: "5–12 yrs", bn: "৫–১২ বছর" },
    minAge: 5,
    maxAge: 12,
    share: 0.2,
    hue: "rose",
    supervised: true,
  },
  {
    key: "softplay",
    name: { en: "Soft Play", bn: "সফট প্লে" },
    age: { en: "1–5 yrs", bn: "১–৫ বছর" },
    minAge: 1,
    maxAge: 5,
    share: 0.16,
    hue: "teal",
    supervised: true,
  },
  {
    key: "ropecourse",
    name: { en: "Rope Course", bn: "রোপ কোর্স" },
    age: { en: "7–14 yrs", bn: "৭–১৪ বছর" },
    minAge: 7,
    maxAge: 14,
    share: 0.12,
    hue: "green",
    supervised: true,
  },
  {
    key: "arcade",
    name: { en: "Arcade", bn: "আর্কেড" },
    age: { en: "6–14 yrs", bn: "৬–১৪ বছর" },
    minAge: 6,
    maxAge: 14,
    share: 0.14,
    hue: "purple",
    supervised: false,
  },
  {
    key: "toddler",
    name: { en: "Toddler Zone", bn: "টডলার জোন" },
    age: { en: "0–3 yrs", bn: "০–৩ বছর" },
    minAge: 0,
    maxAge: 3,
    share: 0.12,
    hue: "blue",
    supervised: true,
  },
  {
    key: "partyhall",
    name: { en: "Birthday Hall", bn: "বার্থডে হল" },
    age: { en: "All ages", bn: "সব বয়স" },
    minAge: 0,
    maxAge: 14,
    share: 0.08,
    hue: "magenta",
    supervised: true,
  },
] as const

export const GATES: Bilingual[] = [
  { en: "Main Gate", bn: "মূল ফটক" },
  { en: "Mall Entrance", bn: "মল প্রবেশপথ" },
  { en: "Party Gate", bn: "পার্টি গেট" },
]

/* ---------------------------------------------------------------- *
 * OUTLETS & PRODUCTS
 * ---------------------------------------------------------------- */

export const TOY_PRODUCTS: Bilingual[] = [
  { en: "Building Blocks Set", bn: "বিল্ডিং ব্লক সেট" },
  { en: "Remote Control Car", bn: "রিমোট কন্ট্রোল কার" },
  { en: "Plush Teddy Bear", bn: "প্লাশ টেডি বিয়ার" },
  { en: "Jigsaw Puzzle 100pc", bn: "জিগস পাজল ১০০ পিস" },
  { en: "Doll House", bn: "ডল হাউস" },
  { en: "Water Gun", bn: "ওয়াটার গান" },
  { en: "Rubik's Cube", bn: "রুবিক্স কিউব" },
  { en: "Toy Train Set", bn: "টয় ট্রেন সেট" },
  { en: "Kite", bn: "ঘুড়ি" },
  { en: "Board Game — Ludo", bn: "বোর্ড গেম — লুডু" },
  { en: "Action Figure", bn: "অ্যাকশন ফিগার" },
  { en: "Play Dough Pack", bn: "প্লে ডো প্যাক" },
]

export const FOOD_ITEMS: Bilingual[] = [
  { en: "Chicken Burger", bn: "চিকেন বার্গার" },
  { en: "French Fries", bn: "ফ্রেঞ্চ ফ্রাই" },
  { en: "Mango Lassi", bn: "ম্যাঙ্গো লাচ্ছি" },
  { en: "Cheese Pizza Slice", bn: "চিজ পিৎজা স্লাইস" },
  { en: "Chicken Nuggets", bn: "চিকেন নাগেটস" },
  { en: "Ice Cream Cone", bn: "আইসক্রিম কোন" },
  { en: "Cold Coffee", bn: "কোল্ড কফি" },
  { en: "Fruit Juice", bn: "ফলের জুস" },
  { en: "Sandwich", bn: "স্যান্ডউইচ" },
  { en: "Popcorn", bn: "পপকর্ন" },
  { en: "Chocolate Shake", bn: "চকলেট শেক" },
  { en: "Singara", bn: "সিঙ্গাড়া" },
]

export const BOOK_ITEMS: Bilingual[] = [
  { en: "Thakurmar Jhuli", bn: "ঠাকুরমার ঝুলি" },
  { en: "Colouring Book", bn: "রং করার বই" },
  { en: "Bangla Alphabet Book", bn: "বাংলা বর্ণমালা বই" },
  { en: "Sticker Activity Book", bn: "স্টিকার অ্যাক্টিভিটি বুক" },
  { en: "Story Book — Animals", bn: "গল্পের বই — প্রাণী" },
  { en: "Maths Puzzle Book", bn: "গণিত ধাঁধার বই" },
  { en: "Crayon Box 24", bn: "ক্রেয়ন বক্স ২৪" },
  { en: "Sketch Pad", bn: "স্কেচ প্যাড" },
]

export const COSMETIC_ITEMS: Bilingual[] = [
  { en: "Baby Lotion", bn: "বেবি লোশন" },
  { en: "Kids Sunscreen", bn: "কিডস সানস্ক্রিন" },
  { en: "Hair Clip Set", bn: "হেয়ার ক্লিপ সেট" },
  { en: "Face Paint Kit", bn: "ফেস পেইন্ট কিট" },
  { en: "Baby Powder", bn: "বেবি পাউডার" },
  { en: "Glitter Tattoo Pack", bn: "গ্লিটার ট্যাটু প্যাক" },
  { en: "Wet Wipes", bn: "ওয়েট ওয়াইপস" },
  { en: "Kids Perfume", bn: "কিডস পারফিউম" },
]

export const OUTLET_CATEGORIES: Record<string, Bilingual[]> = {
  toys: [
    { en: "Construction", bn: "কনস্ট্রাকশন" },
    { en: "Plush", bn: "প্লাশ" },
    { en: "Outdoor", bn: "আউটডোর" },
    { en: "Puzzles", bn: "পাজল" },
  ],
  food: [
    { en: "Snacks", bn: "স্ন্যাকস" },
    { en: "Beverages", bn: "পানীয়" },
    { en: "Meals", bn: "মিল" },
    { en: "Desserts", bn: "ডেজার্ট" },
  ],
  books: [
    { en: "Story", bn: "গল্প" },
    { en: "Activity", bn: "অ্যাক্টিভিটি" },
    { en: "Stationery", bn: "স্টেশনারি" },
  ],
  cosmetics: [
    { en: "Skin Care", bn: "ত্বকের যত্ন" },
    { en: "Accessories", bn: "অ্যাক্সেসরিজ" },
    { en: "Fun", bn: "ফান" },
  ],
}

/* ---------------------------------------------------------------- *
 * PARTY PACKAGES
 * ---------------------------------------------------------------- */

export const PARTY_SPEC = [
  {
    id: "pkg_mini",
    name: { en: "Mini Party", bn: "মিনি পার্টি" },
    heads: 10,
    hours: 2,
    price: 12000,
    hue: "teal",
    includes: [
      { en: "Decorated corner table", bn: "সাজানো কর্নার টেবিল" },
      { en: "Play access for 10", bn: "১০ জনের প্লে অ্যাক্সেস" },
      { en: "Snack platter", bn: "স্ন্যাক প্লেটার" },
    ],
  },
  {
    id: "pkg_classic",
    name: { en: "Classic Party", bn: "ক্লাসিক পার্টি" },
    heads: 20,
    hours: 3,
    price: 26000,
    hue: "amber",
    includes: [
      { en: "Private birthday hall", bn: "প্রাইভেট বার্থডে হল" },
      { en: "Cake 2 lb", bn: "২ পাউন্ড কেক" },
      { en: "Host & face painting", bn: "হোস্ট ও ফেস পেইন্টিং" },
      { en: "Return gifts", bn: "রিটার্ন গিফট" },
    ],
  },
  {
    id: "pkg_grand",
    name: { en: "Grand Party", bn: "গ্র্যান্ড পার্টি" },
    heads: 40,
    hours: 4,
    price: 52000,
    hue: "magenta",
    includes: [
      { en: "Full hall + stage", bn: "পুরো হল ও স্টেজ" },
      { en: "Cake 4 lb + buffet", bn: "৪ পাউন্ড কেক ও বুফে" },
      { en: "Magic show", bn: "ম্যাজিক শো" },
      { en: "Photographer", bn: "ফটোগ্রাফার" },
      { en: "Unlimited play access", bn: "আনলিমিটেড প্লে অ্যাক্সেস" },
    ],
  },
] as const

/* ---------------------------------------------------------------- *
 * STAFF
 * ---------------------------------------------------------------- */

export const STAFF_ROLES: Record<string, Bilingual[]> = {
  floor: [
    { en: "Play Supervisor", bn: "প্লে সুপারভাইজার" },
    { en: "Zone Marshal", bn: "জোন মার্শাল" },
    { en: "Safety Officer", bn: "সেফটি অফিসার" },
  ],
  daycare: [
    { en: "Caregiver", bn: "কেয়ারগিভার" },
    { en: "Senior Caregiver", bn: "সিনিয়র কেয়ারগিভার" },
    { en: "Child Counsellor", bn: "চাইল্ড কাউন্সেলর" },
  ],
  frontDesk: [
    { en: "Front Desk Executive", bn: "ফ্রন্ট ডেস্ক এক্সিকিউটিভ" },
    { en: "Ticketing Officer", bn: "টিকেটিং অফিসার" },
    { en: "Membership Advisor", bn: "মেম্বারশিপ অ্যাডভাইজার" },
  ],
  outlet: [
    { en: "Cashier", bn: "ক্যাশিয়ার" },
    { en: "Sales Associate", bn: "সেলস অ্যাসোসিয়েট" },
    { en: "Store Keeper", bn: "স্টোর কিপার" },
  ],
  kitchen: [
    { en: "Chef", bn: "শেফ" },
    { en: "Kitchen Helper", bn: "কিচেন হেল্পার" },
    { en: "Barista", bn: "বারিস্তা" },
  ],
  maintenance: [
    { en: "Technician", bn: "টেকনিশিয়ান" },
    { en: "Housekeeping", bn: "হাউসকিপিং" },
    { en: "Electrician", bn: "ইলেকট্রিশিয়ান" },
  ],
  admin: [
    { en: "Branch Manager", bn: "ব্রাঞ্চ ম্যানেজার" },
    { en: "Accounts Officer", bn: "অ্যাকাউন্টস অফিসার" },
    { en: "HR Executive", bn: "এইচআর এক্সিকিউটিভ" },
  ],
}

/* ---------------------------------------------------------------- *
 * SUPPLY CHAIN
 * ---------------------------------------------------------------- */

export const SUPPLIER_NAMES: Bilingual[] = [
  { en: "Rangdhanu Toys Ltd.", bn: "রংধনু টয়েজ লিঃ" },
  { en: "Dhaka Play Imports", bn: "ঢাকা প্লে ইমপোর্টস" },
  { en: "Shishu Books House", bn: "শিশু বুকস হাউস" },
  { en: "Meghna Food Supply", bn: "মেঘনা ফুড সাপ্লাই" },
  { en: "Bengal Stationery", bn: "বেঙ্গল স্টেশনারি" },
  { en: "Nirapod Safety Gear", bn: "নিরাপদ সেফটি গিয়ার" },
  { en: "Padma Beverages", bn: "পদ্মা বেভারেজেস" },
  { en: "Aroma Kids Care", bn: "অ্যারোমা কিডস কেয়ার" },
  { en: "Tarbo Equipment Co.", bn: "তার্বো ইকুইপমেন্ট কোং" },
  { en: "Sonali Packaging", bn: "সোনালী প্যাকেজিং" },
]

export const PAY_TERMS: Bilingual[] = [
  { en: "Net 15", bn: "নেট ১৫" },
  { en: "Net 30", bn: "নেট ৩০" },
  { en: "Net 45", bn: "নেট ৪৫" },
  { en: "Advance", bn: "অগ্রিম" },
]

export const UNITS: Bilingual[] = [
  { en: "pcs", bn: "পিস" },
  { en: "box", bn: "বক্স" },
  { en: "kg", bn: "কেজি" },
  { en: "pack", bn: "প্যাক" },
  { en: "litre", bn: "লিটার" },
]

/* ---------------------------------------------------------------- *
 * CUSTOMERS
 * ---------------------------------------------------------------- */

export const SEGMENTS: { label: Bilingual; hue: string; weight: number }[] = [
  { label: { en: "Regular", bn: "নিয়মিত" }, hue: "blue", weight: 34 },
  {
    label: { en: "Weekend Family", bn: "উইকএন্ড ফ্যামিলি" },
    hue: "teal",
    weight: 26,
  },
  { label: { en: "Member", bn: "সদস্য" }, hue: "amber", weight: 18 },
  {
    label: { en: "Party Host", bn: "পার্টি হোস্ট" },
    hue: "magenta",
    weight: 8,
  },
  { label: { en: "Corporate", bn: "কর্পোরেট" }, hue: "purple", weight: 5 },
  { label: { en: "Lapsed", bn: "নিষ্ক্রিয়" }, hue: "slate", weight: 9 },
]

export const ALLERGIES: Bilingual[] = [
  { en: "Peanuts", bn: "চিনাবাদাম" },
  { en: "Dairy", bn: "দুগ্ধজাত" },
  { en: "Eggs", bn: "ডিম" },
  { en: "Seafood", bn: "সামুদ্রিক খাবার" },
  { en: "Dust", bn: "ধুলা" },
  { en: "Pollen", bn: "পরাগ" },
]

export const CHILD_NOTES: Bilingual[] = [
  { en: "Needs help on the rope course", bn: "রোপ কোর্সে সাহায্য প্রয়োজন" },
  { en: "Asthma inhaler with guardian", bn: "অভিভাবকের কাছে ইনহেলার আছে" },
  { en: "Prefers the toddler zone", bn: "টডলার জোন পছন্দ করে" },
  { en: "Shy with new caregivers", bn: "নতুন কেয়ারগিভারে লাজুক" },
  { en: "Wears glasses", bn: "চশমা পরে" },
]

/* ---------------------------------------------------------------- *
 * PLATFORM
 * ---------------------------------------------------------------- */

export const DEVICE_MODELS: Record<string, string[]> = {
  pos: ["Sunmi T2 Lite", "PAX A920 Pro", "Imin D4-505"],
  printer: ["Epson TM-T82X", "Xprinter XP-Q200", "Rongta RP330"],
  drawer: ["Posiflex CR-4000", "EC-410 Steel"],
  scanner: ["Zebra DS2208", "Honeywell 1470g", "Netum NT-1228"],
  nfc: ["ACR122U", "Sunmi NFC Module", "Identiv uTrust 3700F"],
  turnstile: ["Boon Edam Speedlane", "ZKTeco TS2000"],
  tablet: ["Samsung Tab A9", "Lenovo M10"],
}

export const DEVICE_LOCATIONS: Bilingual[] = [
  { en: "Front desk 1", bn: "ফ্রন্ট ডেস্ক ১" },
  { en: "Front desk 2", bn: "ফ্রন্ট ডেস্ক ২" },
  { en: "Toy shop counter", bn: "টয় শপ কাউন্টার" },
  { en: "Food court counter", bn: "ফুড কোর্ট কাউন্টার" },
  { en: "Book & gift counter", bn: "বুক ও গিফট কাউন্টার" },
  { en: "Entry turnstile", bn: "প্রবেশ টার্নস্টাইল" },
  { en: "Exit turnstile", bn: "প্রস্থান টার্নস্টাইল" },
  { en: "Day-care desk", bn: "ডে-কেয়ার ডেস্ক" },
  { en: "Party hall", bn: "পার্টি হল" },
]

export const AUDIT_ACTIONS: { label: Bilingual; hue: string }[] = [
  { label: { en: "Issued wristband", bn: "রিস্টব্যান্ড ইস্যু" }, hue: "teal" },
  { label: { en: "Closed play session", bn: "প্লে সেশন ক্লোজ" }, hue: "blue" },
  {
    label: { en: "Verified NFC card", bn: "এনএফসি কার্ড যাচাই" },
    hue: "amber",
  },
  { label: { en: "Sold membership", bn: "মেম্বারশিপ বিক্রি" }, hue: "green" },
  { label: { en: "Voided a sale", bn: "বিক্রয় বাতিল" }, hue: "rose" },
  { label: { en: "Applied discount", bn: "ডিসকাউন্ট প্রয়োগ" }, hue: "purple" },
  { label: { en: "Adjusted stock", bn: "স্টক সমন্বয়" }, hue: "slate" },
  { label: { en: "Approved expense", bn: "খরচ অনুমোদন" }, hue: "magenta" },
  { label: { en: "Changed role", bn: "ভূমিকা পরিবর্তন" }, hue: "rose" },
  { label: { en: "Exported report", bn: "রিপোর্ট এক্সপোর্ট" }, hue: "blue" },
  { label: { en: "Day-care check-in", bn: "ডে-কেয়ার চেক-ইন" }, hue: "green" },
  {
    label: { en: "Synced offline queue", bn: "অফলাইন কিউ সিঙ্ক" },
    hue: "amber",
  },
]

export const EXPENSE_HEADS: { label: Bilingual; hue: string }[] = [
  { label: { en: "Rent", bn: "ভাড়া" }, hue: "slate" },
  { label: { en: "Utilities", bn: "ইউটিলিটি" }, hue: "amber" },
  { label: { en: "Salaries", bn: "বেতন" }, hue: "blue" },
  {
    label: { en: "Equipment maintenance", bn: "সরঞ্জাম রক্ষণাবেক্ষণ" },
    hue: "teal",
  },
  { label: { en: "Marketing", bn: "মার্কেটিং" }, hue: "magenta" },
  { label: { en: "Housekeeping", bn: "হাউসকিপিং" }, hue: "green" },
  { label: { en: "Licences & fees", bn: "লাইসেন্স ও ফি" }, hue: "purple" },
  { label: { en: "Transport", bn: "পরিবহন" }, hue: "rose" },
]

export const LEDGER_ACCOUNTS: Bilingual[] = [
  { en: "Ticket revenue", bn: "টিকিট রাজস্ব" },
  { en: "Outlet revenue", bn: "আউটলেট রাজস্ব" },
  { en: "Membership revenue", bn: "মেম্বারশিপ রাজস্ব" },
  { en: "Day-care revenue", bn: "ডে-কেয়ার রাজস্ব" },
  { en: "Cash in hand", bn: "হাতে নগদ" },
  { en: "Bank — MTB", bn: "ব্যাংক — এমটিবি" },
  { en: "Gateway receivable", bn: "গেটওয়ে প্রাপ্য" },
  { en: "Operating expense", bn: "পরিচালন ব্যয়" },
]

export const ALERT_SPEC: {
  severity: "info" | "warning" | "critical"
  title: Bilingual
  detail: Bilingual
  module: Bilingual
}[] = [
  {
    severity: "warning",
    title: { en: "Zone near capacity", bn: "জোন ধারণক্ষমতার কাছাকাছি" },
    detail: {
      en: "Trampoline Park is at 92% of its licensed capacity.",
      bn: "ট্রাম্পোলিন পার্ক অনুমোদিত ধারণক্ষমতার ৯২% পূর্ণ।",
    },
    module: { en: "Access", bn: "প্রবেশ" },
  },
  {
    severity: "critical",
    title: { en: "Overstay unresolved", bn: "অতিরিক্ত সময় অমীমাংসিত" },
    detail: {
      en: "3 wristbands have exceeded their slab by over 45 minutes.",
      bn: "৩টি রিস্টব্যান্ড স্ল্যাবের চেয়ে ৪৫ মিনিটের বেশি অতিক্রম করেছে।",
    },
    module: { en: "Access", bn: "প্রবেশ" },
  },
  {
    severity: "warning",
    title: { en: "Low stock", bn: "স্টক কম" },
    detail: {
      en: "6 SKUs in the toy shop are below their reorder level.",
      bn: "টয় শপের ৬টি এসকেইউ রিঅর্ডার লেভেলের নিচে।",
    },
    module: { en: "Inventory", bn: "ইনভেন্টরি" },
  },
  {
    severity: "info",
    title: { en: "Memberships expiring", bn: "মেয়াদ শেষ হচ্ছে" },
    detail: {
      en: "14 memberships expire within the next 7 days.",
      bn: "আগামী ৭ দিনে ১৪টি সদস্যপদের মেয়াদ শেষ হবে।",
    },
    module: { en: "Membership", bn: "সদস্যপদ" },
  },
  {
    severity: "warning",
    title: { en: "Printer degraded", bn: "প্রিন্টার দুর্বল" },
    detail: {
      en: "Food court receipt printer reported a paper jam twice today.",
      bn: "ফুড কোর্টের রিসিট প্রিন্টার আজ দুইবার পেপার জ্যাম জানিয়েছে।",
    },
    module: { en: "Devices", bn: "ডিভাইস" },
  },
  {
    severity: "info",
    title: { en: "Caregiver ratio healthy", bn: "কেয়ারগিভার অনুপাত ঠিক আছে" },
    detail: {
      en: "Day-care is running at 1 caregiver per 5 children.",
      bn: "ডে-কেয়ারে প্রতি ৫ শিশুতে ১ জন কেয়ারগিভার রয়েছে।",
    },
    module: { en: "Day-care", bn: "ডে-কেয়ার" },
  },
  {
    severity: "critical",
    title: {
      en: "Gateway settlement delayed",
      bn: "গেটওয়ে সেটেলমেন্ট বিলম্বিত",
    },
    detail: {
      en: "bKash settlement for yesterday has not landed in the MTB account.",
      bn: "গতকালের বিকাশ সেটেলমেন্ট এমটিবি অ্যাকাউন্টে পৌঁছায়নি।",
    },
    module: { en: "Payments", bn: "পেমেন্ট" },
  },
  {
    severity: "info",
    title: { en: "Offline queue cleared", bn: "অফলাইন কিউ পরিষ্কার" },
    detail: {
      en: "42 queued transactions synced after connectivity returned.",
      bn: "সংযোগ ফেরার পর ৪২টি লেনদেন সিঙ্ক হয়েছে।",
    },
    module: { en: "Platform", bn: "প্ল্যাটফর্ম" },
  },
]
