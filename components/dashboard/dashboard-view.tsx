"use client";

import { Activity, Banknote, TicketCheck, Users } from "lucide-react";
import { AbsentClientsCard } from "@/components/dashboard/absent-clients-card";
import { AttendanceChart } from "@/components/charts/attendance-chart";
import { BarMetricChart } from "@/components/charts/bar-metric-chart";
import { CashierTable } from "@/components/charts/cashier-table";
import { ChartCard } from "@/components/charts/chart-card";
import { RankingList } from "@/components/charts/ranking-list";
import {
  ChartSkeleton,
  EmptyState,
  ErrorState,
  WaitingState
} from "@/components/dashboard/state-blocks";
import { FiltersBar } from "@/components/dashboard/filters-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useDashboard } from "@/hooks/use-dashboard";
import { useFilterStore } from "@/stores/filter-store";

export function DashboardView() {
  const filters = useFilterStore((state) => state.filters);
  const dashboard = useDashboard(filters);
  const summaryWaiting = dashboard.isDebouncing;
  const chartsWaiting = dashboard.isDebouncing || !dashboard.canLoadCharts;
  const secondaryWaiting = dashboard.isDebouncing || !dashboard.canLoadSecondary;

  return (
    <div className="grid min-w-0 max-w-full gap-6 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
          Gimnasio premium
        </p>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Dashboard estadistico
        </h1>
      </div>

      <FiltersBar />

      {summaryWaiting ? (
        <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <WaitingState label="Preparando metricas..." />
          <WaitingState label="Preparando clientes..." />
          <WaitingState label="Preparando ventas..." />
          <WaitingState label="Preparando recaudacion..." />
        </section>
      ) : dashboard.summary.isLoading ? (
        <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </section>
      ) : dashboard.summary.isError ? (
        <ErrorState label="No fue posible cargar las metricas principales." />
      ) : dashboard.summary.data ? (
        <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Asistencias totales"
            value={dashboard.summary.data.totalAttendance}
            trend={dashboard.summary.data.attendanceTrend}
            icon={Activity}
          />
          <MetricCard
            label="Clientes activos"
            value={dashboard.summary.data.activeClients}
            trend={dashboard.summary.data.clientsTrend}
            icon={Users}
          />
          <MetricCard
            label="Membresias vendidas"
            value={dashboard.summary.data.membershipsSold}
            trend={dashboard.summary.data.membershipsTrend}
            icon={TicketCheck}
            details={[
              { label: "Ventas productos", value: dashboard.summary.data.productSales },
              { label: "Ventas totales", value: dashboard.summary.data.totalSales }
            ]}
          />
          <MetricCard
            label="Total recaudado"
            value={dashboard.summary.data.totalRevenue}
            trend={dashboard.summary.data.revenueTrend}
            icon={Banknote}
            money
            details={[
              {
                label: "Membresias",
                value: dashboard.summary.data.membershipRevenue,
                money: true
              },
              {
                label: "Productos",
                value: dashboard.summary.data.productRevenue,
                money: true
              }
            ]}
          />
        </section>
      ) : null}

      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <ChartCard title="Asistencia por periodo" reportType="attendance">
          {chartsWaiting ? (
            <WaitingState label="Esperando metricas principales..." />
          ) : dashboard.attendance.isLoading ? (
            <ChartSkeleton />
          ) : dashboard.attendance.isError ? (
            <ErrorState label="No fue posible cargar la asistencia por periodo." />
          ) : dashboard.attendance.data?.length ? (
            <AttendanceChart data={dashboard.attendance.data} />
          ) : (
            <EmptyState label="No hay asistencias en el rango seleccionado." />
          )}
        </ChartCard>

        <ChartCard title="Hora mas visitada" reportType="peak-hours">
          {chartsWaiting ? (
            <WaitingState label="Esperando metricas principales..." />
          ) : dashboard.peakHours.isLoading ? (
            <ChartSkeleton />
          ) : dashboard.peakHours.isError ? (
            <ErrorState label="No fue posible cargar la hora mas visitada." />
          ) : dashboard.peakHours.data?.length ? (
            <BarMetricChart data={dashboard.peakHours.data} valueLabel="visitas" />
          ) : (
            <EmptyState label="No hay visitas registradas." />
          )}
        </ChartCard>

        <ChartCard title="Clientes mas frecuentes" reportType="top-clients">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : dashboard.topClients.isLoading ? (
            <ChartSkeleton />
          ) : dashboard.topClients.isError ? (
            <ErrorState label="No fue posible cargar clientes frecuentes." />
          ) : dashboard.topClients.data?.length ? (
            <RankingList data={dashboard.topClients.data} />
          ) : (
            <EmptyState label="No hay clientes frecuentes para mostrar." />
          )}
        </ChartCard>

        <ChartCard title="Membresias mas vendidas" reportType="memberships">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : dashboard.memberships.isLoading ? (
            <ChartSkeleton />
          ) : dashboard.memberships.isError ? (
            <ErrorState label="No fue posible cargar membresias vendidas." />
          ) : dashboard.memberships.data?.length ? (
            <RankingList data={dashboard.memberships.data} suffix="ventas" />
          ) : (
            <EmptyState label="No hay membresias vendidas en el periodo." />
          )}
        </ChartCard>

        {secondaryWaiting ? (
          <div className="xl:col-span-2">
            <WaitingState label="Esperando graficas principales..." />
          </div>
        ) : dashboard.absentClients.isLoading ? (
          <div className="xl:col-span-2">
            <ChartSkeleton />
          </div>
        ) : dashboard.absentClients.isError ? (
          <div className="xl:col-span-2">
            <ErrorState label="No fue posible cargar clientes ausentes." />
          </div>
        ) : dashboard.absentClients.data ? (
          <AbsentClientsCard data={dashboard.absentClients.data} />
        ) : (
          <div className="xl:col-span-2">
            <EmptyState label="No hay clientes ausentes para mostrar." />
          </div>
        )}

        <ChartCard title="Cajeros con mas ventas" reportType="cashiers-sales">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : dashboard.cashierSales.isLoading ? (
            <ChartSkeleton />
          ) : dashboard.cashierSales.isError ? (
            <ErrorState label="No fue posible cargar ventas por cajero." />
          ) : dashboard.cashierSales.data?.length ? (
            <CashierTable data={dashboard.cashierSales.data} />
          ) : (
            <EmptyState label="No hay ventas por cajero." />
          )}
        </ChartCard>

        <ChartCard title="Total recaudado por cajero" reportType="cashiers-revenue">
          {secondaryWaiting ? (
            <WaitingState label="Esperando graficas principales..." />
          ) : dashboard.cashierRevenue.isLoading ? (
            <ChartSkeleton />
          ) : dashboard.cashierRevenue.isError ? (
            <ErrorState label="No fue posible cargar recaudacion por cajero." />
          ) : dashboard.cashierRevenue.data?.length ? (
            <CashierTable data={dashboard.cashierRevenue.data} />
          ) : (
            <EmptyState label="No hay recaudacion por cajero." />
          )}
        </ChartCard>
      </section>
    </div>
  );
}
