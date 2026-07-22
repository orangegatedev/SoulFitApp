"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { RankingPoint, TimeSeriesPoint } from "@/types/dashboard";

export function BarMetricChart({
  data,
  valueLabel = "value"
}: {
  data: Array<TimeSeriesPoint | RankingPoint>;
  valueLabel?: string;
}) {
  return (
    <div className="h-72 min-w-0 max-w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => [value, valueLabel]}
            contentStyle={{
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#fff"
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
