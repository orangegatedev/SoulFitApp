"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgePercent,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Package,
  ReceiptText,
  RotateCcw,
  Search,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  useCashClosingAnalytics,
  useCashClosingDiscountPayments,
  useCashClosingFilterOptions,
  useCashClosings
} from "@/hooks/use-cash-closings";
import { useUserOptions } from "@/hooks/use-users";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type {
  CashClosingDiscountCategory,
  CashClosingDiscountPayment,
  CashClosingDiscountPaymentsResponse,
  CashClosingMembershipCategory,
  CashClosingPaymentMethodPoint,
  CashClosingProductCategory,
  CashClosingProductPoint,
  CashClosingRow
} from "@/types/cash-closings";
import type { UserFilterOption } from "@/types/users";

type TabId = "general" | "memberships" | "products" | "discounts";

const tabs: Array<{ id: TabId; label: string; icon: typeof ReceiptText }> = [
  { id: "general", label: "General", icon: ReceiptText },
  { id: "memberships", label: "Membresias", icon: Users },
  { id: "products", label: "Productos", icon: Package },
  { id: "discounts", label: "Descuentos", icon: BadgePercent }
];

const months = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" }
];

const dropdownClassName =
  "absolute z-[100] mt-2 w-full overflow-hidden rounded-md border border-secondary/20 bg-zinc-950 p-2 shadow-cyanGlow";
const optionListClassName = "mt-2 grid max-h-32 gap-1 overflow-y-auto overflow-x-hidden pr-1";

function formatDateTime(value: string | null) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  onClick,
  disabled,
  ariaLabel
}: {
  title: string;
  value: string;
  helper?: string;
  icon: typeof ReceiptText;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const content = (
    <>
      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
        <Icon className="h-4 w-4 text-neon-cyan" />
        <span className="min-w-0 truncate">{title}</span>
        {onClick && !disabled ? <ChevronRight className="ml-auto h-4 w-4 text-cyan-200" /> : null}
      </div>
      <p className="truncate text-2xl font-black text-white">{value}</p>
      {helper ? <p className="mt-1 text-xs text-zinc-500">{helper}</p> : null}
    </>
  );

  if (onClick && !disabled) {
    return (
      <button
        type="button"
        className="min-w-0 rounded-lg border border-white/10 bg-zinc-950/80 p-4 text-left transition hover:border-cyan-300/30 hover:bg-cyan-400/5 focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onClick}
        aria-label={ariaLabel ?? title}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-zinc-950/80 p-4">
      {content}
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-white/10 bg-zinc-950/50 px-4 text-center text-sm text-zinc-500">
      {label}
    </div>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex min-h-36 items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-950/50 text-sm text-zinc-400">
      <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
      {label}
    </div>
  );
}

function UserSelect({
  users,
  value,
  isLoading,
  onChange
}: {
  users: UserFilterOption[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = users.find((user) => user.value === value);
  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) =>
      `${user.label} ${user.email}`.toLowerCase().includes(term)
    );
  }, [search, users]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function selectUser(nextValue: string) {
    onChange(nextValue);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor="cash-closing-user">Usuario</Label>
      <div ref={wrapperRef} className="relative min-w-0">
        <button
          id="cash-closing-user"
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-zinc-950/70 px-3 py-2 text-left text-sm text-white focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            open ? "border-secondary/60 ring-2 ring-ring" : ""
          )}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate">{selected?.label ?? "Todos"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        </button>

        {open ? (
          <div className={dropdownClassName}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar usuario"
                className="pl-9"
                autoFocus
              />
            </div>

            <div className={optionListClassName}>
              <button
                type="button"
                className="flex h-10 min-w-0 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-white hover:bg-secondary/10"
                onClick={() => selectUser("")}
              >
                <span className="min-w-0 flex-1 truncate">Todos</span>
              </button>

              {isLoading ? (
                <p className="px-3 py-2 text-sm text-zinc-400">Cargando usuarios...</p>
              ) : visibleUsers.length ? (
                visibleUsers.map((user) => (
                  <button
                    key={user.value}
                    type="button"
                    className={cn(
                      "flex h-10 min-w-0 w-full items-center rounded-md px-3 text-left text-sm text-zinc-200 hover:bg-secondary/10 hover:text-white",
                      value === user.value ? "bg-primary/15 text-red-100" : ""
                    )}
                    onClick={() => selectUser(user.value)}
                  >
                    <span className="min-w-0 flex-1 truncate">{user.label}</span>
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

function BarList<T extends { name: string }>({
  data,
  valueKey,
  valueFormatter,
  meta
}: {
  data: T[];
  valueKey: keyof T;
  valueFormatter: (value: number) => string;
  meta?: (row: T) => string;
}) {
  const max = Math.max(
    ...data.map((row) => Number(row[valueKey]) || 0),
    1
  );

  return (
    <div className="grid min-w-0 gap-3">
      {data.map((row) => {
        const value = Number(row[valueKey]) || 0;
        return (
          <div key={row.name} className="grid min-w-0 gap-1">
            <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-semibold text-white">{row.name}</span>
              <span className="shrink-0 text-zinc-300">{valueFormatter(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-red to-neon-cyan"
                style={{ width: `${Math.max((value / max) * 100, value > 0 ? 5 : 0)}%` }}
              />
            </div>
            {meta ? <p className="text-xs text-zinc-500">{meta(row)}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

function PaymentMethodList({ data }: { data: CashClosingPaymentMethodPoint[] }) {
  if (!data.length) return <EmptyBlock label="No hay pagos para mostrar." />;

  return (
    <div className="grid gap-2">
      {data.map((item) => (
        <div
          key={`${item.name}-${item.currency ?? "NIO"}`}
          className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{item.name}</p>
            <p className="text-xs text-zinc-500">
              {item.currency ?? "Cordoba"} · {formatNumber(item.paymentsCount ?? item.salesCount ?? 0)} operaciones
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-cyan-100">{formatCurrency(item.revenue)}</p>
        </div>
      ))}
    </div>
  );
}

function DiscountPaymentsDrawer({
  open,
  closingId,
  detail,
  isLoading,
  isError,
  onClose,
  onRetry
}: {
  open: boolean;
  closingId: string | null;
  detail?: CashClosingDiscountPaymentsResponse;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onRetry: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  if (!open) return null;

  const payments = detail?.payments ?? [];
  const summary = detail?.summary;

  return (
    <div className="fixed inset-0 z-[220]" role="dialog" aria-modal="true" aria-labelledby="discount-payments-title">
      <button
        type="button"
        className="absolute inset-0 cursor-default border-0 bg-black/75 p-0 backdrop-blur-sm"
        aria-label="Cerrar detalle de descuentos"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-dvh w-full max-w-3xl flex-col overflow-hidden border-l border-red-400/20 bg-[#09070a] shadow-[0_0_50px_rgba(0,0,0,0.55)] sm:w-[86vw]">
        <div className="flex min-w-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="discount-payments-title" className="text-xl font-black text-white">
              Pagos con descuento
            </h2>
            <p className="mt-1 text-sm text-zinc-400">Cierre #{closingId ?? ""}</p>
            {summary ? (
              <p className="mt-2 text-sm text-cyan-100">
                {formatNumber(summary.count)} pagos · {formatCurrency(summary.totalDiscount)} descontados
              </p>
            ) : null}
          </div>
          <Button ref={closeButtonRef} type="button" variant="outline" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {isLoading ? (
            <LoadingBlock label="Cargando detalle de pagos con descuento..." />
          ) : isError ? (
            <div className="grid gap-3 rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                No fue posible cargar el detalle de los pagos con descuento.
              </div>
              <Button type="button" variant="outline" className="w-full sm:w-fit" onClick={onRetry}>
                Reintentar
              </Button>
            </div>
          ) : payments.length ? (
            <div className="grid min-w-0 gap-4">
              {summary && !summary.matchesAnalytics ? (
                <div className="rounded-md border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-100">
                  El detalle no coincide con el resumen: {formatNumber(summary.count)} pagos / {formatCurrency(summary.totalDiscount)} en detalle contra {formatNumber(summary.analyticsPaymentsWithDiscount)} pagos / {formatCurrency(summary.analyticsTotalDiscount)} del analytics.
                </div>
              ) : null}

              <div className="hidden max-w-full overflow-x-auto md:block">
                <table className="min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    <tr className="border-b border-white/10">
                      <th className="py-3 pr-3">Cliente</th>
                      <th className="py-3 pr-3">Usuario/Cajero</th>
                      <th className="py-3 pr-3">Monto original</th>
                      <th className="py-3 pr-3 text-red-100">Descuento</th>
                      <th className="py-3 pr-3">Monto pagado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/6">
                        <td className="py-3 pr-3">
                          <p className="max-w-[220px] truncate font-semibold text-white">{payment.clientName}</p>
                          <p className="max-w-[220px] truncate text-xs text-zinc-500">
                            {payment.membershipName} · {payment.membershipCategory}
                          </p>
                        </td>
                        <td className="py-3 pr-3 text-zinc-300">{payment.cashierName}</td>
                        <td className="py-3 pr-3 text-zinc-300">{formatCurrency(payment.originalAmount)}</td>
                        <td className="py-3 pr-3 font-bold text-red-100">-{formatCurrency(payment.discount)}</td>
                        <td className="py-3 pr-3 font-bold text-cyan-100">{formatCurrency(payment.paidAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 md:hidden">
                {payments.map((payment) => (
                  <DiscountPaymentMobileCard key={payment.id} payment={payment} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyBlock label="No existen pagos con descuento en este cierre." />
          )}
        </div>
      </aside>
    </div>
  );
}

function DiscountPaymentMobileCard({ payment }: { payment: CashClosingDiscountPayment }) {
  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="min-w-0">
        <p className="truncate font-bold text-white">{payment.clientName}</p>
        <p className="truncate text-sm text-zinc-400">
          {payment.membershipName} · {payment.membershipCategory}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <DetailValue label="Usuario/Cajero" value={payment.cashierName} />
        <DetailValue label="Fecha" value={formatDateTime(payment.paidAt)} />
        <DetailValue label="Original" value={formatCurrency(payment.originalAmount)} />
        <DetailValue label="Descuento" value={`-${formatCurrency(payment.discount)}`} highlight />
        <DetailValue label="Pagado" value={formatCurrency(payment.paidAmount)} />
        <DetailValue label="Sucursal" value={payment.branchName} />
      </div>
    </div>
  );
}

function DetailValue({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={cn("mt-1 truncate font-semibold", highlight ? "text-red-100" : "text-white")}>
        {value}
      </p>
    </div>
  );
}

function ClosingsTable({
  rows,
  selectedId,
  isLoading,
  onSelect
}: {
  rows: CashClosingRow[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
}) {
  if (isLoading) return <LoadingBlock label="Cargando cierres..." />;
  if (!rows.length) return <EmptyBlock label="No hay cierres para los filtros seleccionados." />;

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="min-w-[860px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          <tr className="border-b border-white/10">
            <th className="py-3 pr-3">Cierre</th>
            <th className="py-3 pr-3">Usuario</th>
            <th className="py-3 pr-3">Sucursal</th>
            <th className="py-3 pr-3">Cordobas</th>
            <th className="py-3 pr-3">Dolares</th>
            <th className="py-3 pr-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                "cursor-pointer border-b border-white/6 transition hover:bg-primary/10",
                selectedId === row.id ? "bg-primary/15" : ""
              )}
              onClick={() => onSelect(row.id)}
            >
              <td className="py-3 pr-3">
                <p className="font-semibold text-white">#{row.id}</p>
                <p className="text-xs text-zinc-500">{formatDateTime(row.fechaCierre)}</p>
              </td>
              <td className="py-3 pr-3 text-zinc-200">{row.userName}</td>
              <td className="py-3 pr-3 text-zinc-300">{row.branchName}</td>
              <td className="py-3 pr-3 font-semibold text-white">{formatCurrency(row.totalCordoba)}</td>
              <td className="py-3 pr-3 text-zinc-300">{formatUsd(row.totalDolar)}</td>
              <td className="py-3 pr-3 font-bold text-cyan-100">{formatCurrency(row.totalRecaudado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CashClosingsView() {
  const now = useMemo(() => new Date(), []);
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [discountPaymentsOpen, setDiscountPaymentsOpen] = useState(false);
  const { data: users = [], isLoading: isLoadingUsers } = useUserOptions();
  const filterOptions = useCashClosingFilterOptions();
  const listParams = useMemo(
    () => ({ userId, month, year, page, perPage: 10 }),
    [month, page, userId, year]
  );
  const closings = useCashClosings(listParams);
  const analytics = useCashClosingAnalytics(selectedId);
  const discountPayments = useCashClosingDiscountPayments(selectedId, discountPaymentsOpen);
  const years = filterOptions.data?.years ?? [now.getFullYear()];

  useEffect(() => {
    setPage(1);
    setSelectedId(null);
    setDiscountPaymentsOpen(false);
  }, [month, userId, year]);

  useEffect(() => {
    setDiscountPaymentsOpen(false);
  }, [selectedId]);

  useEffect(() => {
    if (selectedId || !closings.data?.data.length) return;
    setSelectedId(closings.data.data[0].id);
  }, [closings.data?.data, selectedId]);

  function clearFilters() {
    setUserId("");
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
    setPage(1);
  }

  return (
    <div className="grid min-w-0 max-w-full gap-6 overflow-x-hidden">
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
          Finanzas
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          Cierres de caja
        </h1>
      </div>

      <section className="relative z-40 rounded-lg border border-red-400/10 bg-zinc-950/70 p-4 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <CalendarDays className="h-4 w-4 text-neon-cyan" />
          Filtros
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-4">
          <UserSelect
            users={users}
            value={userId}
            isLoading={isLoadingUsers}
            onChange={setUserId}
          />
          <div className="grid min-w-0 gap-2">
            <Label htmlFor="cash-closing-month">Mes</Label>
            <Select id="cash-closing-month" value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid min-w-0 gap-2">
            <Label htmlFor="cash-closing-year">Anio</Label>
            <Select id="cash-closing-year" value={year} onChange={(event) => setYear(event.target.value)}>
              {years.map((option) => (
                <option key={option} value={String(option)}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex min-w-0 items-end">
            <Button variant="outline" className="w-full" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-cyan-200" />
              Cierres encontrados
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {closings.isError ? (
              <EmptyBlock label="No fue posible cargar los cierres de caja." />
            ) : (
              <ClosingsTable
                rows={closings.data?.data ?? []}
                selectedId={selectedId}
                isLoading={closings.isLoading}
                onSelect={setSelectedId}
              />
            )}

            {closings.data ? (
              <div className="flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Pagina {closings.data.meta.currentPage} de {closings.data.meta.lastPage} · {formatNumber(closings.data.meta.total)} cierres
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={page <= 1}
                    aria-label="Pagina anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((current) => Math.min(current + 1, closings.data?.meta.lastPage ?? current))}
                    disabled={page >= closings.data.meta.lastPage}
                    aria-label="Pagina siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex min-w-0 items-center justify-between gap-3">
              <span className="min-w-0 truncate">
                Analytics {selectedId ? `#${selectedId}` : ""}
              </span>
              {analytics.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" /> : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-5">
            {!selectedId ? (
              <EmptyBlock label="Selecciona un cierre para ver el detalle." />
            ) : analytics.isLoading ? (
              <LoadingBlock label="Calculando analytics del cierre..." />
            ) : analytics.isError || !analytics.data ? (
              <EmptyBlock label="No fue posible cargar el analytics del cierre seleccionado." />
            ) : (
              <>
                <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={cn(
                          "flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
                          activeTab === tab.id
                            ? "border-secondary/30 bg-secondary/15 text-white shadow-cyanGlow"
                            : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-primary/10 hover:text-white"
                        )}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {activeTab === "general" ? (
                  <div className="grid min-w-0 gap-4">
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                      <MetricCard title="Total cerrado" value={formatCurrency(analytics.data.general.closedTotal)} helper={formatDateTime(analytics.data.closing.fechaCierre)} icon={ReceiptText} />
                      <MetricCard title="Operaciones" value={formatNumber(analytics.data.general.totalOperations)} helper={`${formatNumber(analytics.data.general.membershipPayments)} membresias · ${formatNumber(analytics.data.general.productSales)} productos`} icon={ClipboardCheck} />
                      <MetricCard title="Membresias C$" value={formatCurrency(analytics.data.general.membershipRevenueCordoba)} helper={`${formatUsd(analytics.data.general.membershipRevenueDollar)} en dolares`} icon={Users} />
                      <MetricCard title="Productos" value={formatCurrency(analytics.data.general.productRevenueCordoba)} helper="Ventas directas en caja" icon={Package} />
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
                      <p className="font-semibold text-white">Ventana auditada</p>
                      <p className="mt-1">
                        {formatDateTime(analytics.data.relation.from)} - {formatDateTime(analytics.data.relation.to)}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">{analytics.data.relation.note}</p>
                    </div>
                    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                      <div className="grid gap-3">
                        <h3 className="font-bold text-white">Pagos de membresias</h3>
                        <PaymentMethodList data={analytics.data.general.paymentMethods.memberships} />
                      </div>
                      <div className="grid gap-3">
                        <h3 className="font-bold text-white">Ventas de productos</h3>
                        <PaymentMethodList data={analytics.data.general.paymentMethods.products} />
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === "memberships" ? (
                  <div className="grid min-w-0 gap-4">
                    <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                      <MetricCard title="Valor original" value={formatCurrency(analytics.data.memberships.summary.grossRevenue)} icon={ReceiptText} />
                      <MetricCard title="Descuentos" value={formatCurrency(analytics.data.memberships.summary.discount)} icon={BadgePercent} />
                      <MetricCard title="Cobrado" value={formatCurrency(analytics.data.memberships.summary.netRevenue)} icon={Users} />
                    </div>
                    {analytics.data.memberships.byCategory.length ? (
                      <BarList<CashClosingMembershipCategory>
                        data={analytics.data.memberships.byCategory}
                        valueKey="netRevenue"
                        valueFormatter={formatCurrency}
                        meta={(row) => `${formatNumber(row.paymentsCount)} pagos · descuento ${formatCurrency(row.discount)}`}
                      />
                    ) : (
                      <EmptyBlock label="No hay membresias cobradas en este cierre." />
                    )}
                    <div className="max-w-full overflow-x-auto">
                      <table className="min-w-[720px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          <tr className="border-b border-white/10">
                            <th className="py-3 pr-3">Membresia</th>
                            <th className="py-3 pr-3">Categoria</th>
                            <th className="py-3 pr-3">Pagos</th>
                            <th className="py-3 pr-3">Original</th>
                            <th className="py-3 pr-3">Descuento</th>
                            <th className="py-3 pr-3">Cobrado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.data.memberships.byMembership.map((row) => (
                            <tr key={row.id} className="border-b border-white/6">
                              <td className="py-3 pr-3 font-semibold text-white">{row.name}</td>
                              <td className="py-3 pr-3 text-zinc-300">{row.category}</td>
                              <td className="py-3 pr-3 text-zinc-300">{formatNumber(row.paymentsCount)}</td>
                              <td className="py-3 pr-3 text-zinc-300">{formatCurrency(row.grossRevenue)}</td>
                              <td className="py-3 pr-3 text-red-100">{formatCurrency(row.discount)}</td>
                              <td className="py-3 pr-3 font-bold text-cyan-100">{formatCurrency(row.netRevenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {activeTab === "products" ? (
                  <div className="grid min-w-0 gap-4">
                    <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                      <MetricCard title="Ventas" value={formatNumber(analytics.data.products.summary.salesCount)} icon={ReceiptText} />
                      <MetricCard title="Unidades" value={formatNumber(analytics.data.products.summary.quantity)} icon={Package} />
                      <MetricCard title="Total productos" value={formatCurrency(analytics.data.products.summary.revenue)} icon={ClipboardCheck} />
                    </div>
                    {analytics.data.products.byCategory.length ? (
                      <BarList<CashClosingProductCategory>
                        data={analytics.data.products.byCategory}
                        valueKey="revenue"
                        valueFormatter={formatCurrency}
                        meta={(row) => `${formatNumber(row.quantity)} unidades · ${formatNumber(row.salesCount)} ventas`}
                      />
                    ) : (
                      <EmptyBlock label="No hay productos vendidos en este cierre." />
                    )}
                    <div className="grid gap-2">
                      {analytics.data.products.topProducts.map((product: CashClosingProductPoint) => (
                        <div key={product.id} className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                            <p className="text-xs text-zinc-500">{product.categoryName} · {formatNumber(product.quantity)} unidades</p>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-cyan-100">{formatCurrency(product.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {activeTab === "discounts" ? (
                  <div className="grid min-w-0 gap-4">
                    <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                      <MetricCard title="Descuento total" value={formatCurrency(analytics.data.discounts.summary.totalDiscount)} icon={BadgePercent} />
                      <MetricCard
                        title="Pagos con descuento"
                        value={formatNumber(analytics.data.discounts.summary.paymentsWithDiscount)}
                        helper={analytics.data.discounts.summary.paymentsWithDiscount > 0 ? "Click para auditar" : "Sin pagos descontados"}
                        icon={ReceiptText}
                        disabled={analytics.data.discounts.summary.paymentsWithDiscount <= 0}
                        onClick={() => setDiscountPaymentsOpen(true)}
                        ariaLabel={`Ver pagos con descuento del cierre ${selectedId}`}
                      />
                      <MetricCard title="Tasa descuento" value={`${analytics.data.discounts.summary.discountRate}%`} icon={ClipboardCheck} />
                    </div>
                    {analytics.data.discounts.byCategory.length ? (
                      <BarList<CashClosingDiscountCategory>
                        data={analytics.data.discounts.byCategory}
                        valueKey="discount"
                        valueFormatter={formatCurrency}
                        meta={(row) => `${formatNumber(row.paymentsCount)} pagos sobre ${formatCurrency(row.grossRevenue)}`}
                      />
                    ) : (
                      <EmptyBlock label="No hay descuentos aplicados en este cierre." />
                    )}
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </section>
      <DiscountPaymentsDrawer
        open={discountPaymentsOpen}
        closingId={selectedId}
        detail={discountPayments.data}
        isLoading={discountPayments.isLoading || discountPayments.isFetching}
        isError={discountPayments.isError}
        onClose={() => setDiscountPaymentsOpen(false)}
        onRetry={() => void discountPayments.refetch()}
      />
    </div>
  );
}
