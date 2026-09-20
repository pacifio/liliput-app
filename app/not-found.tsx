import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-3">
      <p className="figure text-4xl text-muted-foreground">404</p>
      <p className="text-xs font-medium">পৃষ্ঠা পাওয়া যায়নি</p>
      <p className="max-w-[36ch] text-center text-[0.6875rem] text-muted-foreground">
        আপনি যে পর্দা চেয়েছেন তা এই প্রোটোটাইপে নেই।
      </p>
      <Link
        href="/dashboard"
        className="mt-1 rounded-md bg-primary px-3 py-1.5 text-[0.6875rem] text-primary-foreground"
      >
        ড্যাশবোর্ডে ফিরুন
      </Link>
    </div>
  )
}
