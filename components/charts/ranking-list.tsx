import { Badge } from "@/components/ui/badge";
import type { RankingPoint } from "@/types/dashboard";

export function RankingList({
  data,
  suffix = "visitas"
}: {
  data: RankingPoint[];
  suffix?: string;
}) {
  return (
    <div className="grid gap-3">
      {data.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] p-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neon-red/90 via-neon-ember/80 to-neon-cyan/80 text-sm font-black text-white">
              {index + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{item.name}</p>
              <p className="truncate text-xs text-zinc-400">{item.meta}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {item.value} {suffix}
          </Badge>
        </div>
      ))}
    </div>
  );
}
