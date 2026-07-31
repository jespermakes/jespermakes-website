// Section kicker: short amber rule + letterspaced small caps.
export function Kicker({
  children,
  dark = false,
  center = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
      <span className="h-px w-8 bg-amber" />
      <span
        className={`text-[11px] font-bold tracking-[0.25em] uppercase ${
          dark ? "text-cream/50" : "text-wood-light/50"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
