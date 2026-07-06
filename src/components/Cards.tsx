interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

interface ContentCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ContentCard({ title, children, action }: ContentCardProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {action}
      </div>
      <div className="mt-4 space-y-3 text-zinc-700 leading-relaxed">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  className = "bg-zinc-100 text-zinc-700",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${className}`}
    >
      {children}
    </span>
  );
}
