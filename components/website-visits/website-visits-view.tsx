"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CalendarDays, Globe2, MapPin, MonitorSmartphone, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { websiteVisitsAnalyticsService as service } from "@/services/website-visits-analytics.service";
import type { VisitFilters } from "@/types/website-visits-analytics";
import { useAuthStore } from "@/stores/auth-store";

const iso = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const defaults = (): VisitFilters => ({ from: iso(new Date(Date.now() - 29 * 86400000)), to: iso(new Date()), device: "", path: "", country: "", city: "" });
const selectClass = "h-10 min-w-0 rounded-md border border-white/10 bg-zinc-950/70 px-3 text-sm text-white outline-none focus:border-cyan-400/60";

export function WebsiteVisitsView() {
  const role = useAuthStore((state) => state.user?.role);
  const [filters, setFilters] = useState(defaults); const [page, setPage] = useState(1);
  const overview = useQuery({ queryKey: ["website-visits", "overview", filters], queryFn: () => service.overview(filters) });
  const recent = useQuery({ queryKey: ["website-visits", "recent", filters, page], queryFn: () => service.recent(filters, page) });
  const data = overview.data; const set = (key: keyof VisitFilters, value: string) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (overview.error) console.error("[Website visits analytics] overview request failed", overview.error);
    if (recent.error) console.error("[Website visits analytics] recent visits request failed", recent.error);
  }, [overview.error, recent.error]);
  const metrics = [
    ["Visitas totales", data?.summary.total_visits, Globe2], ["Hoy", data?.summary.visits_today, Activity], ["Últimos 7 días", data?.summary.visits_7_days, CalendarDays], ["Últimos 30 días", data?.summary.visits_30_days, CalendarDays],
    ["Visitantes únicos", data?.summary.unique_visitors, Users], ["Página principal", data?.summary.top_path?.label ?? "-", Globe2], ["Dispositivo principal", data?.summary.top_device?.label ?? "-", MonitorSmartphone], ["Ubicación principal", data?.summary.top_location?.label ?? "-", MapPin]
  ] as const;

  if (role !== "admin") return <div className="rounded-md border border-red-500/30 bg-red-500/10 p-5 text-red-100">No tienes permisos para consultar estas estadísticas.</div>;

  return <div className="space-y-5">
    <div><p className="text-xs font-bold uppercase text-cyan-300">Sitio público</p><h1 className="text-2xl font-black text-white sm:text-3xl">Estadísticas de visitas del sitio web</h1><p className="mt-1 text-sm text-zinc-400">Tráfico de soulfit.pro, dispositivos y ubicación aproximada por IP.</p></div>
    <section className="grid gap-3 border-y border-white/10 py-4 sm:grid-cols-2 lg:grid-cols-6">
      <Input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} /><Input type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} />
      {(["device", "path", "country", "city"] as const).map((key) => <select key={key} className={selectClass} value={filters[key]} onChange={(e) => set(key, e.target.value)}><option value="">{key === "device" ? "Todos los dispositivos" : key === "path" ? "Todas las páginas" : key === "country" ? "Todos los países" : "Todas las ciudades"}</option>{data?.filter_options[`${key === "device" ? "devices" : key === "path" ? "paths" : key === "country" ? "countries" : "cities"}`].map((value) => <option key={value}>{value}</option>)}</select>)}
      <Button variant="outline" className="lg:col-start-6" onClick={() => { setFilters(defaults()); setPage(1); }}><RotateCcw className="mr-2 h-4 w-4" />Limpiar</Button>
    </section>
    {overview.isError ? <p className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-200">No se pudieron cargar las estadísticas.</p> : null}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon]) => <Card key={label}><CardContent className="flex min-h-28 items-center gap-4 p-4"><Icon className="h-6 w-6 shrink-0 text-cyan-300" /><div className="min-w-0"><p className="text-xs text-zinc-400">{label}</p><p className="truncate text-xl font-black text-white">{overview.isLoading ? "..." : String(value ?? 0)}</p></div></CardContent></Card>)}</section>
    <section className="grid gap-4 xl:grid-cols-2"><Chart title="Visitas por día" data={data?.by_day ?? []} area /><Chart title="Visitas por hora" data={data?.by_hour ?? []} /><Chart title="Dispositivos" data={data?.by_device ?? []} /><Chart title="Páginas más visitadas" data={data?.by_path ?? []} /><Chart title="Ubicaciones" data={data?.by_location ?? []} /></section>
    <Card><CardHeader><CardTitle>Visitas recientes</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase text-zinc-500"><tr>{["Fecha", "Página", "Dispositivo", "Navegador", "Ubicación", "IP"].map((h) => <th className="border-b border-white/10 px-3 py-2" key={h}>{h}</th>)}</tr></thead><tbody>{recent.data?.data.map((visit) => <tr key={visit.id} className="border-b border-white/5 text-zinc-300"><td className="px-3 py-3">{new Date(visit.visited_at).toLocaleString()}</td><td className="px-3 py-3 text-cyan-200">{visit.path}</td><td className="px-3 py-3">{visit.device_type ?? "-"}</td><td className="px-3 py-3">{visit.browser ?? "-"}</td><td className="px-3 py-3">{[visit.city, visit.country].filter(Boolean).join(", ") || "-"}</td><td className="px-3 py-3 font-mono text-xs">{visit.ip_address ?? "-"}</td></tr>)}</tbody></table><div className="mt-4 flex items-center justify-between text-sm text-zinc-400"><span>{recent.data?.total ?? 0} registros</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button><span className="px-2 py-2">{page}/{recent.data?.last_page ?? 1}</span><Button size="sm" variant="outline" disabled={page >= (recent.data?.last_page ?? 1)} onClick={() => setPage((p) => p + 1)}>Siguiente</Button></div></div></CardContent></Card>
  </div>;
}

function Chart({ title, data, area = false }: { title: string; data: { label: string | number; value: number }[]; area?: boolean }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%">{area ? <AreaChart data={data}><defs><linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={.45}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#ffffff10"/><XAxis dataKey="label" tick={{fill:"#a1a1aa",fontSize:11}}/><YAxis tick={{fill:"#a1a1aa",fontSize:11}}/><Tooltip/><Area dataKey="value" stroke="#22d3ee" fill="url(#visitsFill)"/></AreaChart> : <BarChart data={data}><CartesianGrid stroke="#ffffff10"/><XAxis dataKey="label" tick={{fill:"#a1a1aa",fontSize:11}}/><YAxis tick={{fill:"#a1a1aa",fontSize:11}}/><Tooltip/><Bar dataKey="value" fill="#e11d48" radius={[4,4,0,0]}/></BarChart>}</ResponsiveContainer></div></CardContent></Card>; }