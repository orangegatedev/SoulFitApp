import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
  money = false,
  details = []
}: {
  label: string;
  value: number;
  trend: number;
  icon: LucideIcon;
  money?: boolean;
  details?: Array<{ label: string; value: number; money?: boolean; text?: string }>;
}) {
  const formatValue = (amount: number, asMoney = money) =>
    asMoney ? formatCurrency(amount) : formatNumber(amount);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="relative min-w-0 p-5">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-neon-red/30 via-neon-ember/15 to-neon-cyan/10" />
        <div className="relative flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-3 break-words text-2xl font-black text-white sm:text-3xl">
              {formatValue(value)}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-secondary/15 bg-white/10">
            <Icon className="h-5 w-5 text-neon-cyan" />
          </div>
        </div>
        {details.length ? (
          <div className="relative mt-4 grid min-w-0 gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs">
            {details.map((detail) => (
              <div key={detail.label} className="flex min-w-0 items-center justify-between gap-3">
                <span className="min-w-0 truncate text-zinc-400">{detail.label}</span>
                <span className="shrink-0 text-right font-semibold text-zinc-100">
                  {detail.text ?? formatValue(detail.value, detail.money)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="relative mt-5 flex min-w-0 items-center gap-2 text-sm text-cyan-200">
          <TrendingUp className="h-4 w-4" />
          <span className="min-w-0 break-words">{trend}% vs periodo anterior</span>
        </div>
      </CardContent>
    </Card>
  );
}
