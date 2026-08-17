"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  BadgePercent,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  PackageSearch,
  Receipt,
  RotateCcw,
  Search,
  ShoppingCart,
  Trophy,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartSkeleton,
  EmptyState,
  ErrorState,
  WaitingState
} from "@/components/dashboard/state-blocks";
import { RankingList } from "@/components/charts/ranking-list";
import { useProductSalesAnalytics } from "@/hooks/use-product-sales-analytics";
import { useUserOptions } from "@/hooks/use-users";
import {
  exportProductSalesExcel,
  exportProductSalesPdf
} from "@/lib/product-sales-export";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { productSalesAnalyticsService } from "@/services/product-sales-analytics.service";
import type {
  ProductRankingPoint,
  ProductSalesCashierPoint,
  ProductSalesCategoryPoint,
  ProductSalesDatePoint,
  ProductSalesDetailRow,
  ProductSalesDiscountPoint,
  ProductSalesFilterOption,
  ProductSalesFilters,
  ProductSalesHourPoint
} from "@/types/product-sales-analytics";

const dropdownClassName =
  "absolute z-[100] mt-2 w-full overflow-hidden rounded-md border border-secondary/20 bg-zinc-950 p-2 shadow-cyanGlow";
const optionListClassName = "mt-2 grid max-h-32 gap-1 overflow-y-auto overflow-x-hidden pr-1";
const optionButtonClassName =
  "flex h-10 min-w-0 w-full items-center rounded-md px-3 text-left text-sm text-zinc-200 hover:bg-secondary/10 hover:text-white";

function normalizeSearchText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function SearchableSelect({
  id,
  label,
  value,
  options,
  allLabel,
  searchPlaceholder,
  onChange,
  disabled = false
}: {
  id: string;
  label: string;
  value?: string;
  options: ProductSalesFilterOption[];
  allLabel: string;
  searchPlaceholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? allLabel;
  const visibleOptions = useMemo(() => {
    const needle = normalizeSearchText(search.trim());
    if (!needle) return options;

    return options.filter((option) => normalizeSearchText(option.label).includes(needle));
  }, [options, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div ref={ref} className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-zinc-950/70 px-3 py-2 text-left text-sm text-white focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            open ? "border-secondary/60 ring-2 ring-ring" : ""
          )}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        </button>

        {open ? (
          <div className={dropdownClassName}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
                autoFocus
              />
            </div>

            <div className={optionListClassName}>
              <button
                type="button"
                className="flex h-10 min-w-0 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-white hover:bg-secondary/10"
                onClick={() => selectOption("")}
              >
                <span className="min-w-0 flex-1 truncate">{allLabel}</span>
              </button>

              {visibleOptions.length ? (
                visibleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      optionButtonClassName,
                      value === option.value ? "bg-primary/15 text-red-100" : ""
                    )}
                    onClick={() => selectOption(option.value)}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-zinc-400">Sin resultados.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AnalyticsCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  helper,
  money = false
}: {
  label: string;
  value: number | string;
  icon: typeof Package;
  helper?: string;
  money?: boolean;
}) {
  const formattedValue =
    typeof value === "number" ? (money ? formatCurrency(value) : formatNumber(value)) : value;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="relative p-5">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-neon-red/30 via-neon-ember/15 to-neon-cyan/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-3 truncate text-2xl font-black text-white sm:text-3xl">
              {formattedValue}
            </p>
            {helper ? <p className="mt-2 truncate text-xs text-zinc-500">{helper}</p> : null}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-secondary/15 bg-white/10">
            <Icon className="h-5 w-5 text-neon-cyan" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesByDateChart({ data }: { data: ProductSalesDatePoint[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="product-sales-revenue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#ff2638" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value, name) => [
              name === "revenue" ? formatCurrency(Number(value)) : formatNumber(Number(value)),
              name === "revenue" ? "Vendido" : "Cantidad"
            ]}
            contentStyle={{
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#fff"
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#ff2638"
            strokeWidth={3}
            fill="url(#product-sales-revenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueBarChart({
  data,
  valueKey = "revenue"
}: {
  data: Array<
    | ProductSalesCategoryPoint
    | ProductSalesCashierPoint
    | ProductSalesHourPoint
    | { label: string; revenue: number; quantity?: number }
  >;
  valueKey?: "revenue" | "quantity" | "salesCount";
}) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey={(item) => ("label" in item ? item.label : item.name)}
            stroke="#a1a1aa"
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => [
              valueKey === "revenue" ? formatCurrency(Number(value)) : formatNumber(Number(value)),
              valueKey === "revenue" ? "Vendido" : "Cantidad"
            ]}
            contentStyle={{
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#fff"
            }}
          />
          <Bar dataKey={valueKey} radius={[6, 6, 0, 0]} fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function toRankingByQuantity(products: ProductRankingPoint[]) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    value: product.quantity,
    meta: `${product.categoryName} - ${formatCurrency(product.revenue)}`
  }));
}

function toRankingByRevenue(products: ProductRankingPoint[]) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    value: Math.round(product.revenue),
    meta: `${product.categoryName} - ${formatNumber(product.quantity)} unidades`
  }));
}

function DiscountTable({ data }: { data: ProductSalesDiscountPoint[] }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-white/10">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs uppercase text-zinc-500">
          <tr className="border-b border-white/10">
            <th className="py-3 pr-3">Producto</th>
            <th className="py-3 pr-3">Categoria</th>
            <th className="py-3 pr-3">Descuento</th>
            <th className="py-3 pr-3">Ventas</th>
            <th className="py-3">%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-white/6">
              <td className="py-3 pr-3 font-semibold text-white">{row.productName}</td>
              <td className="py-3 pr-3 text-zinc-300">{row.categoryName}</td>
              <td className="py-3 pr-3 text-zinc-300">{formatCurrency(row.discount)}</td>
              <td className="py-3 pr-3 text-zinc-300">{formatCurrency(row.revenue)}</td>
              <td className="py-3 text-cyan-100">{row.discountRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailsTable({ data }: { data: ProductSalesDetailRow[] }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-white/10">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="text-xs uppercase text-zinc-500">
          <tr className="border-b border-white/10">
            <th className="py-3 pr-3">Fecha</th>
            <th className="py-3 pr-3">Usuario</th>
            <th className="py-3 pr-3">Sucursal</th>
            <th className="py-3 pr-3">Categoria</th>
            <th className="py-3 pr-3">Producto</th>
            <th className="py-3 pr-3">Unidad</th>
            <th className="py-3 pr-3">Cantidad</th>
            <th className="py-3 pr-3">Antes desc.</th>
            <th className="py-3 pr-3">Precio final</th>
            <th className="py-3 pr-3">Descuento</th>
            <th className="py-3 pr-3">Subtotal</th>
            <th className="py-3">Metodo pago</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-white/6">
              <td className="py-3 pr-3 text-zinc-300">{formatDate(row.date)}</td>
              <td className="py-3 pr-3 font-semibold text-white">{row.cashierName}</td>
              <td className="py-3 pr-3 text-zinc-300">{row.branchName}</td>
              <td className="py-3 pr-3 text-zinc-300">{row.categoryName}</td>
              <td className="max-w-[220px] truncate py-3 pr-3 text-zinc-100">{row.productName}</td>
              <td className="py-3 pr-3 text-zinc-300">{row.unitName}</td>
              <td className="py-3 pr-3 text-zinc-300">{formatNumber(row.quantity)}</td>
              <td className="py-3 pr-3 text-zinc-300">
                {formatCurrency(row.priceBeforeDiscount)}
              </td>
              <td className="py-3 pr-3 text-zinc-300">{formatCurrency(row.finalUnitPrice)}</td>
              <td className="py-3 pr-3 text-zinc-300">{formatCurrency(row.discount)}</td>
              <td className="py-3 pr-3 font-semibold text-white">
                {formatCurrency(row.subtotal)}
              </td>
              <td className="py-3 text-zinc-300">{row.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailsPagination({
  page,
  perPage,
  total,
  lastPage,
  onPageChange,
  onPerPageChange
}: {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span>
          Mostrando {formatNumber(start)}-{formatNumber(end)} de {formatNumber(total)}
        </span>
        <label className="flex items-center gap-2">
          <span>Filas</span>
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="h-9 rounded-md border border-white/10 bg-zinc-950 px-2 text-white outline-none focus:border-secondary/60 focus:ring-2 focus:ring-ring"
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="rounded-md border border-white/10 px-3 py-2 text-white">
          Página {formatNumber(page)} de {formatNumber(lastPage)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const defaultFilters: ProductSalesFilters = {};

export function ProductSalesAnalyticsView() {
  const [filters, setFilters] = useState<ProductSalesFilters>(defaultFilters);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsPerPage, setDetailsPerPage] = useState(10);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const detailsParams = useMemo(
    () => ({ page: detailsPage, perPage: detailsPerPage }),
    [detailsPage, detailsPerPage]
  );
  const analytics = useProductSalesAnalytics(filters, detailsParams);
  const options = analytics.filterOptions.data;
  const { data: userOptions = [], isLoading: isLoadingUsers } = useUserOptions();
  const productOptions = useMemo(() => {
    const products = options?.products ?? [];
    if (!filters.categoryId) return products;

    return products.filter((product) => product.categoryId === filters.categoryId);
  }, [filters.categoryId, options?.products]);
  const chartsWaiting = analytics.isDebouncing || !analytics.canLoadPrimaryCharts;
  const secondaryWaiting = analytics.isDebouncing || !analytics.canLoadSecondary;
  const detailsPayload = analytics.details.data;
  const exportDisabled =
    analytics.isDebouncing ||
    analytics.summary.isLoading ||
    analytics.summary.isError ||
    analytics.details.isLoading ||
    Boolean(exporting);

  useEffect(() => {
    setDetailsPage(1);
  }, [filters.from, filters.to, filters.cashierId, filters.categoryId, filters.productId, filters.branchId]);

  function setFilter<K extends keyof ProductSalesFilters>(
    key: K,
    value: ProductSalesFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined
    }));
  }

  function setCategory(value: string) {
    setFilters((current) => ({
      ...current,
      categoryId: value || undefined,
      productId: undefined
    }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  async function loadAllDetails() {
    const firstPage = await productSalesAnalyticsService.getDetails(analytics.filters, {
      page: 1,
      perPage: 500
    });
    const rows = [...firstPage.data];

    for (let page = 2; page <= firstPage.meta.lastPage; page += 1) {
      const nextPage = await productSalesAnalyticsService.getDetails(analytics.filters, {
        page,
        perPage: 500
      });
      rows.push(...nextPage.data);
    }

    return rows;
  }

  async function exportReport(type: "excel" | "pdf") {
    if (exportDisabled) return;

    setExporting(type);
    try {
      const details = await loadAllDetails();
      const payload = {
        filters: analytics.filters,
        options,
        summary: analytics.summary.data,
        details,
        generatedAt: new Date()
      };

      if (type === "excel") {
        exportProductSalesExcel(payload);
      } else {
        exportProductSalesPdf(payload);
      }
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="grid min-w-0 max-w-full gap-6 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
            POS analytics
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Ventas de productos
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={exportDisabled}
            onClick={() => void exportReport("excel")}
          >
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Excel
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={exportDisabled}
            onClick={() => void exportReport("pdf")}
          >
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </div>

      <section className="relative z-40 min-w-0 rounded-lg border border-red-400/10 bg-zinc-950/70 p-4 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <PackageSearch className="h-4 w-4 text-neon-cyan" />
          Filtros
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <div className="grid gap-2">
            <Label htmlFor="product-sales-from">Desde</Label>
            <Input
              id="product-sales-from"
              type="date"
              value={filters.from ?? ""}
              onChange={(event) => setFilter("from", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-sales-to">Hasta</Label>
            <Input
              id="product-sales-to"
              type="date"
              value={filters.to ?? ""}
              onChange={(event) => setFilter("to", event.target.value)}
            />
          </div>
          <SearchableSelect
            id="product-sales-cashier"
            label="Usuario"
            value={filters.cashierId}
            options={userOptions}
            allLabel="Todos"
            searchPlaceholder="Buscar usuario"
            onChange={(value) => setFilter("cashierId", value)}
            disabled={isLoadingUsers}
          />
          <SearchableSelect
            id="product-sales-category"
            label="Categoria"
            value={filters.categoryId}
            options={options?.categories ?? []}
            allLabel="Todas"
            searchPlaceholder="Buscar categoria"
            onChange={setCategory}
            disabled={analytics.filterOptions.isLoading}
          />
          <SearchableSelect
            id="product-sales-product"
            label="Producto"
            value={filters.productId}
            options={productOptions}
            allLabel="Todos"
            searchPlaceholder="Buscar producto"
            onChange={(value) => setFilter("productId", value)}
            disabled={analytics.filterOptions.isLoading}
          />
          <SearchableSelect
            id="product-sales-branch"
            label="Sucursal"
            value={filters.branchId}
            options={options?.branches ?? []}
            allLabel="Todas"
            searchPlaceholder="Buscar sucursal"
            onChange={(value) => setFilter("branchId", value)}
            disabled={analytics.filterOptions.isLoading}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" className="w-full md:w-auto" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </section>

      {analytics.summary.isLoading || analytics.isDebouncing ? (
        <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </section>
      ) : analytics.summary.isError ? (
        <ErrorState label="No fue posible cargar las metricas de productos." />
      ) : analytics.summary.data ? (
        <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total vendido"
            value={analytics.summary.data.totalRevenue}
            icon={Receipt}
            money
          />
          <KpiCard
            label="Productos vendidos"
            value={analytics.summary.data.totalQuantity}
            icon={Package}
          />
          <KpiCard
            label="Ventas con productos"
            value={analytics.summary.data.salesCount}
            icon={ShoppingCart}
          />
          <KpiCard
            label="Ticket promedio"
            value={analytics.summary.data.averageTicket}
            icon={Receipt}
            money
          />
          <KpiCard
            label="Producto mas vendido"
            value={analytics.summary.data.topProductByQuantity?.name ?? "Sin datos"}
            helper={
              analytics.summary.data.topProductByQuantity
                ? `${formatNumber(analytics.summary.data.topProductByQuantity.value ?? 0)} unidades`
                : undefined
            }
            icon={Trophy}
          />
          <KpiCard
            label="Mayor ingreso"
            value={analytics.summary.data.topProductByRevenue?.name ?? "Sin datos"}
            helper={
              analytics.summary.data.topProductByRevenue
                ? formatCurrency(analytics.summary.data.topProductByRevenue.value ?? 0)
                : undefined
            }
            icon={Trophy}
          />
          <KpiCard
            label="Descuentos"
            value={analytics.summary.data.totalDiscount}
            icon={BadgePercent}
            money
          />
          <KpiCard
            label="Estado de carga"
            value="Progresiva"
            helper="Metricas, graficas y detalle por bloques"
            icon={Clock3}
          />
        </section>
      ) : null}

      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <AnalyticsCard title="Ventas por fecha">
          {chartsWaiting ? (
            <WaitingState label="Esperando metricas principales..." />
          ) : analytics.byDate.isLoading ? (
            <ChartSkeleton />
          ) : analytics.byDate.isError ? (
            <ErrorState label="No fue posible cargar ventas por fecha." />
          ) : analytics.byDate.data?.length ? (
            <SalesByDateChart data={analytics.byDate.data} />
          ) : (
            <EmptyState label="No hay ventas de productos en el rango." />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Horas con mas ventas">
          {chartsWaiting ? (
            <WaitingState label="Esperando metricas principales..." />
          ) : analytics.byHour.isLoading ? (
            <ChartSkeleton />
          ) : analytics.byHour.isError ? (
            <ErrorState label="No fue posible cargar ventas por hora." />
          ) : analytics.byHour.data?.length ? (
            <RevenueBarChart data={analytics.byHour.data} />
          ) : (
            <EmptyState label="No hay ventas por hora para mostrar." />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Ventas por categoria">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : analytics.byCategory.isLoading ? (
            <ChartSkeleton />
          ) : analytics.byCategory.isError ? (
            <ErrorState label="No fue posible cargar ventas por categoria." />
          ) : analytics.byCategory.data?.length ? (
            <RevenueBarChart data={analytics.byCategory.data} />
          ) : (
            <EmptyState label="No hay categorias para mostrar." />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Ventas por usuario">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : analytics.byCashier.isLoading ? (
            <ChartSkeleton />
          ) : analytics.byCashier.isError ? (
            <ErrorState label="No fue posible cargar ventas por usuario." />
          ) : analytics.byCashier.data?.length ? (
            <RevenueBarChart data={analytics.byCashier.data} />
          ) : (
            <EmptyState label="No hay usuarios con ventas de productos." />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Top productos por cantidad">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : analytics.topProducts.isLoading ? (
            <ChartSkeleton />
          ) : analytics.topProducts.isError ? (
            <ErrorState label="No fue posible cargar top productos." />
          ) : analytics.topProducts.data?.byQuantity.length ? (
            <RankingList data={toRankingByQuantity(analytics.topProducts.data.byQuantity)} suffix="uds" />
          ) : (
            <EmptyState label="No hay productos vendidos para mostrar." />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Top productos por ingreso">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : analytics.topProducts.isLoading ? (
            <ChartSkeleton />
          ) : analytics.topProducts.isError ? (
            <ErrorState label="No fue posible cargar ranking por ingreso." />
          ) : analytics.topProducts.data?.byRevenue.length ? (
            <RankingList
              data={toRankingByRevenue(analytics.topProducts.data.byRevenue)}
              suffix="C$"
            />
          ) : (
            <EmptyState label="No hay ingresos de productos para mostrar." />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Descuentos aplicados">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : analytics.discounts.isLoading ? (
            <ChartSkeleton />
          ) : analytics.discounts.isError ? (
            <ErrorState label="No fue posible cargar descuentos." />
          ) : analytics.discounts.data?.length ? (
            <DiscountTable data={analytics.discounts.data} />
          ) : (
            <EmptyState label="No hay descuentos aplicados en el rango." />
          )}
        </AnalyticsCard>
      </section>

      <AnalyticsCard title="Detalle de ventas de productos">
        {secondaryWaiting ? (
          <WaitingState label="Esperando analitica secundaria..." />
        ) : analytics.details.isLoading ? (
          <ChartSkeleton />
        ) : analytics.details.isError ? (
          <ErrorState label="No fue posible cargar el detalle de ventas." />
        ) : detailsPayload?.data.length ? (
          <div className="grid min-w-0 gap-4">
            <DetailsTable data={detailsPayload.data} />
            <DetailsPagination
              page={detailsPayload.meta.currentPage}
              perPage={detailsPayload.meta.perPage}
              total={detailsPayload.meta.total}
              lastPage={detailsPayload.meta.lastPage}
              onPageChange={setDetailsPage}
              onPerPageChange={(nextPerPage) => {
                setDetailsPerPage(nextPerPage);
                setDetailsPage(1);
              }}
            />
          </div>
        ) : (
          <EmptyState label="No hay detalle de ventas para mostrar." />
        )}
      </AnalyticsCard>
    </div>
  );
}
