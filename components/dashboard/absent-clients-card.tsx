"use client";

import { UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { AbsentClientsResponse } from "@/types/dashboard";

const ranges = [
  { key: "unMes", label: "1 mes" },
  { key: "dosMeses", label: "2 meses" },
  { key: "tresMeses", label: "3 meses" },
  { key: "seisMeses", label: "6 meses" },
  { key: "nueveMeses", label: "9 meses" }
] as const;

export function AbsentClientsCard({ data }: { data: AbsentClientsResponse }) {
  const topMemberships = data.clientesAusentesPorMembresia.slice(0, 5);

  return (
    <Card className="min-w-0 overflow-hidden xl:col-span-2">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
            <UserX className="h-5 w-5 text-cyan-100" />
          </div>
          <CardTitle className="min-w-0">Clientes ausentes</CardTitle>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300">
          Nunca asistieron:{" "}
          <span className="font-semibold text-white">
            {formatNumber(data.clientesAusentes.sinAsistencia)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-5">
        <div className="grid min-w-0 gap-3 sm:grid-cols-5">
          {ranges.map((range) => (
            <div
              key={range.key}
              className="rounded-md border border-white/10 bg-white/[0.03] p-3"
            >
              <p className="text-xs font-semibold uppercase text-zinc-500">{range.label}</p>
              <p className="mt-2 text-2xl font-black text-white">
                {formatNumber(data.clientesAusentes[range.key])}
              </p>
            </div>
          ))}
        </div>

        {topMemberships.length ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-3">Membresia</th>
                  <th className="py-3 pr-3">Nunca</th>
                  {ranges.map((range) => (
                    <th key={range.key} className="py-3 pr-3">
                      {range.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topMemberships.map((membership) => (
                  <tr key={membership.membership} className="border-b border-white/6">
                    <td className="py-3 pr-3 font-semibold text-white">
                      {membership.membership}
                    </td>
                    <td className="py-3 pr-3 text-zinc-300">
                      {formatNumber(membership.sinAsistencia)}
                    </td>
                    {ranges.map((range) => (
                      <td key={range.key} className="py-3 pr-3 text-zinc-300">
                        {formatNumber(membership[range.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
