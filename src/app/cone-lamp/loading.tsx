export default function ConeLampLoading() {
  return (
    <div className="min-h-screen bg-cream text-wood animate-pulse">
      {/* Top bar skeleton */}
      <div className="h-12 border-b border-wood/[0.08] bg-white/40" />

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        {/* Header skeleton */}
        <div className="mb-10">
          <div className="h-3 w-32 bg-wood/[0.08] rounded mb-3" />
          <div className="h-10 w-80 bg-wood/[0.08] rounded mb-4" />
          <div className="h-4 w-full max-w-[680px] bg-wood/[0.08] rounded mb-2" />
          <div className="h-4 w-3/4 max-w-[510px] bg-wood/[0.08] rounded" />
        </div>

        {/* Control panel skeleton */}
        <div className="bg-white/60 border border-wood/[0.08] rounded-2xl p-7 md:p-9 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
            {/* Left: slider area */}
            <div>
              <div className="h-3 w-24 bg-wood/[0.08] rounded mb-2.5" />
              <div className="h-12 w-28 bg-wood/[0.08] rounded mb-3.5" />
              <div className="h-2 w-full bg-wood/[0.08] rounded mb-4" />
              <div className="h-3 w-full bg-wood/[0.08] rounded mt-3.5" />
              <div className="h-3 w-3/4 bg-wood/[0.08] rounded mt-1.5" />
            </div>
            {/* Right: buttons area */}
            <div className="flex flex-col gap-3">
              <div className="h-3 w-20 bg-wood/[0.08] rounded mb-1" />
              <div className="grid grid-cols-2 gap-3.5 mb-1">
                <div>
                  <div className="h-7 w-8 bg-wood/[0.08] rounded" />
                  <div className="h-3 w-20 bg-wood/[0.08] rounded mt-1" />
                </div>
                <div>
                  <div className="h-7 w-10 bg-wood/[0.08] rounded" />
                  <div className="h-3 w-16 bg-wood/[0.08] rounded mt-1" />
                </div>
              </div>
              <div className="h-[52px] bg-wood/[0.08] rounded-2xl" />
              <div className="h-[48px] bg-wood/[0.08] rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Parts grid skeleton */}
        <div className="mb-8">
          <div className="h-7 w-48 bg-wood/[0.08] rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-3.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/55 border border-wood/[0.07] rounded-2xl p-3.5 h-[220px]"
              >
                <div className="h-[130px] bg-wood/[0.06] rounded mb-2.5" />
                <div className="border-t border-wood/[0.06] pt-2.5">
                  <div className="h-4 w-16 bg-wood/[0.08] rounded mb-1" />
                  <div className="h-3 w-24 bg-wood/[0.08] rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/55 border border-wood/[0.07] rounded-2xl p-3.5 h-[220px]"
              >
                <div className="h-[130px] bg-wood/[0.06] rounded mb-2.5" />
                <div className="border-t border-wood/[0.06] pt-2.5">
                  <div className="h-4 w-16 bg-wood/[0.08] rounded mb-1" />
                  <div className="h-3 w-24 bg-wood/[0.08] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
