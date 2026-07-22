"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TimeSeriesPoint } from "@/types/dashboard";

export function AttendanceChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <div className="h-72 min-w-0 max-w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="attendance" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#ff2638" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#fff"
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#ff2638"
            strokeWidth={3}
            fill="url(#attendance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
