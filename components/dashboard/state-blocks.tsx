import { AlertTriangle, Clock3, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <Inbox className="h-8 w-8 text-zinc-500" />
      <p className="mt-3 text-sm font-semibold text-zinc-300">{label}</p>
    </div>
  );
}

export function WaitingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-secondary/20 bg-secondary/5 p-6 text-center">
      <Clock3 className="h-8 w-8 text-cyan-200" />
      <p className="mt-3 text-sm font-semibold text-cyan-100">{label}</p>
    </div>
  );
}

export function ErrorState({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-red-300" />
      <p className="mt-3 text-sm font-semibold text-red-100">{label}</p>
    </div>
  );
}
