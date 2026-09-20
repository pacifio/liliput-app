export default function Loading() {
  return (
    <div className="flex h-full flex-col gap-3 px-5 py-4">
      <div className="h-7 w-52 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-24 animate-pulse rounded-xl bg-muted/60" />
      <div className="grid flex-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="animate-pulse rounded-xl bg-muted/60" />
        <div className="animate-pulse rounded-xl bg-muted/60" />
      </div>
    </div>
  )
}
