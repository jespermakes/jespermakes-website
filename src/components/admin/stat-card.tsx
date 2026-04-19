import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}

export function StatCard({ label, value, sub, href }: StatCardProps) {
  const inner = (
    <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 h-full hover:border-wood/[0.15] transition-colors">
      <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
        {label}
      </div>
      <div className="text-3xl font-semibold text-wood leading-none mb-1">{value}</div>
      {sub && <div className="text-xs text-wood-light/55">{sub}</div>}
    </div>
  );
  if (href) {
    return <Link href={href} className="block no-underline">{inner}</Link>;
  }
  return inner;
}
