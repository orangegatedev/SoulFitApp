import type { AuthUser } from "@/types/auth";
import type {
  AbsentClientsResponse,
  CashierMetric,
  DashboardFilterOptions,
  DashboardSummary,
  RankingPoint,
  TimeSeriesPoint
} from "@/types/dashboard";
import type { ReportResponse, ReportType } from "@/types/reports";
import type { Sucursal } from "@/types/sucursals";
import type { SystemUser } from "@/types/users";

export const mockAuthUser: AuthUser = {
  id: "u_admin",
  name: "Valeria Cruz",
  email: "admin@soulfit.com",
  role: "admin",
  active: true,
  branch: "Central"
};

export const mockSummary: DashboardSummary = {
  totalAttendance: 18420,
  activeClients: 1268,
  membershipsSold: 842,
  productSales: 240,
  membershipSales: 842,
  totalSales: 1082,
  membershipRevenue: 1200000,
  productRevenue: 298760,
  totalRevenue: 1498760,
  membershipDiscountsCount: 94,
  membershipDiscountsRate: 11.16,
  membershipDiscountAmount: 48250,
  membershipDiscountCordoba: 48250,
  membershipDiscountDollar: 0,
  attendanceTrend: 12.8,
  clientsTrend: 7.4,
  membershipsTrend: 18.1,
  revenueTrend: 21.6,
  discountsTrend: 9.3,
  discountAmountTrend: 14.8
};

export const mockAttendance: TimeSeriesPoint[] = [
  { label: "Lun", value: 540 },
  { label: "Mar", value: 610 },
  { label: "Mie", value: 585 },
  { label: "Jue", value: 720 },
  { label: "Vie", value: 760 },
  { label: "Sab", value: 690 },
  { label: "Dom", value: 430 }
];

export const mockTopClients: RankingPoint[] = [
  { id: "c1", name: "Marco Rivas", value: 29, meta: "Crossfit" },
  { id: "c2", name: "Lucia Medina", value: 27, meta: "Musculacion" },
  { id: "c3", name: "Carlos Prado", value: 25, meta: "Full access" },
  { id: "c4", name: "Ana Castillo", value: 23, meta: "Funcional" },
  { id: "c5", name: "Diego Solis", value: 21, meta: "Full access" }
];

export const mockPeakHours: TimeSeriesPoint[] = [
  { label: "5 AM", value: 76 },
  { label: "7 AM", value: 142 },
  { label: "12 PM", value: 96 },
  { label: "5 PM", value: 188 },
  { label: "7 PM", value: 224 },
  { label: "9 PM", value: 114 }
];

export const mockMemberships: RankingPoint[] = [
  { id: "m1", name: "Premium mensual", value: 328, meta: "NIO 1,450" },
  { id: "m2", name: "Full access", value: 264, meta: "NIO 1,950" },
  { id: "m3", name: "Basica mensual", value: 198, meta: "NIO 950" },
  { id: "m4", name: "Plan pareja", value: 52, meta: "NIO 2,700" }
];

export const mockCashiers: CashierMetric[] = [
  {
    cashierId: "ca1",
    cashierName: "Sofia Mercado",
    productSales: 48,
    membershipSales: 164,
    sales: 212,
    productRevenue: 68800,
    membershipRevenue: 268000,
    revenue: 336800
  },
  {
    cashierId: "ca2",
    cashierName: "Rafael Gomez",
    productSales: 39,
    membershipSales: 145,
    sales: 184,
    productRevenue: 52200,
    membershipRevenue: 246000,
    revenue: 298200
  },
  {
    cashierId: "ca3",
    cashierName: "Daniela Leon",
    productSales: 34,
    membershipSales: 132,
    sales: 166,
    productRevenue: 43900,
    membershipRevenue: 204000,
    revenue: 247900
  },
  {
    cashierId: "ca4",
    cashierName: "Mario Vega",
    productSales: 29,
    membershipSales: 99,
    sales: 128,
    productRevenue: 34400,
    membershipRevenue: 154000,
    revenue: 188400
  }
];

export const mockAbsentClients: AbsentClientsResponse = {
  clientesAusentes: {
    sinAsistencia: 12,
    unMes: 45,
    dosMeses: 31,
    tresMeses: 20,
    seisMeses: 12,
    nueveMeses: 8
  },
  clientesAusentesPorMembresia: [
    {
      membership: "Mensualidad General",
      sinAsistencia: 4,
      unMes: 10,
      dosMeses: 6,
      tresMeses: 4,
      seisMeses: 2,
      nueveMeses: 1
    },
    {
      membership: "Pilates",
      sinAsistencia: 3,
      unMes: 5,
      dosMeses: 3,
      tresMeses: 2,
      seisMeses: 1,
      nueveMeses: 0
    },
    {
      membership: "Sin membresia registrada",
      sinAsistencia: 5,
      unMes: 8,
      dosMeses: 4,
      tresMeses: 3,
      seisMeses: 2,
      nueveMeses: 1
    }
  ]
};

export const filterOptions: DashboardFilterOptions = {
  cashiers: mockCashiers.map((cashier) => ({
    value: cashier.cashierId,
    label: cashier.cashierName
  })),
  memberships: [
    { value: "premium", label: "Premium mensual" },
    { value: "full", label: "Full access" },
    { value: "basic", label: "Basica mensual" },
    { value: "couple", label: "Plan pareja" }
  ],
  branches: [
    { value: "central", label: "Sucursal Central" },
    { value: "metro", label: "Metrocentro" },
    { value: "carretera", label: "Carretera Sur" }
  ]
};

export let mockSucursals: Sucursal[] = [
  {
    id: "1",
    nombre: "SoulFit Centro",
    direccion: "Managua",
    telefono: "2222-0000",
    ruc: "J0000000000000",
    logo: null,
    estado: "Activa"
  },
  {
    id: "2",
    nombre: "SoulFit Metrocentro",
    direccion: "Metrocentro",
    telefono: "2222-1111",
    ruc: "J0000000000001",
    logo: null,
    estado: "Activa"
  },
  {
    id: "3",
    nombre: "SoulFit Carretera Sur",
    direccion: "Carretera Sur",
    telefono: "2222-2222",
    ruc: "J0000000000002",
    logo: null,
    estado: "Inactiva"
  }
];

export function replaceMockSucursals(nextSucursals: Sucursal[]) {
  mockSucursals = nextSucursals;
}

export let mockUsers: SystemUser[] = [
  {
    id: "u1",
    nombres: "Valeria",
    apellidos: "Cruz",
    name: "Valeria Cruz",
    email: "admin@soulfit.com",
    role: "admin",
    branch: "SoulFit Centro",
    sucursalId: "1",
    active: true,
    accessRevoked: false,
    isOnline: true,
    lastSeenAt: new Date().toISOString(),
    currentSessionSource: "mock",
    appAccessEnabled: true,
    createdAt: "2026-01-08T10:30:00.000Z",
    lastLogin: "2026-05-14T15:12:00.000Z"
  },
  {
    id: "u2",
    nombres: "Sofia",
    apellidos: "Mercado",
    name: "Sofia Mercado",
    email: "sofia@soulfit.com",
    role: "cashier",
    branch: "SoulFit Centro",
    sucursalId: "1",
    active: true,
    accessRevoked: false,
    isOnline: false,
    appAccessEnabled: true,
    createdAt: "2026-02-12T09:10:00.000Z",
    lastLogin: "2026-05-14T13:44:00.000Z"
  },
  {
    id: "u3",
    nombres: "Rafael",
    apellidos: "Gomez",
    name: "Rafael Gomez",
    email: "rafael@soulfit.com",
    role: "manager",
    branch: "SoulFit Metrocentro",
    sucursalId: "2",
    active: true,
    accessRevoked: false,
    isOnline: false,
    appAccessEnabled: true,
    createdAt: "2026-02-28T11:20:00.000Z",
    lastLogin: "2026-05-13T19:20:00.000Z"
  },
  {
    id: "u4",
    nombres: "Mario",
    apellidos: "Vega",
    name: "Mario Vega",
    email: "mario@soulfit.com",
    role: "viewer",
    branch: "SoulFit Carretera Sur",
    sucursalId: "3",
    active: false,
    accessRevoked: true,
    isOnline: false,
    appAccessEnabled: true,
    createdAt: "2026-03-16T08:05:00.000Z"
  }
];

export function replaceMockUsers(nextUsers: SystemUser[]) {
  mockUsers = nextUsers;
}

export function buildReport(type: ReportType): ReportResponse {
  const titles: Record<ReportType, string> = {
    attendance: "Reporte de asistencia",
    "top-clients": "Clientes mas frecuentes",
    "peak-hours": "Horas mas visitadas",
    memberships: "Membresias vendidas",
    "cashiers-sales": "Ventas por usuario",
    "cashiers-revenue": "Recaudacion por usuario"
  };

  if (type === "attendance") {
    return {
      type,
      title: titles[type],
      generatedAt: new Date().toISOString(),
      filters: {},
      columns: ["Dia", "Asistencias"],
      rows: mockAttendance.map((item) => ({ Dia: item.label, Asistencias: item.value })),
      summary: [{ label: "Total asistencia", value: 4335 }]
    };
  }

  if (type === "peak-hours") {
    return {
      type,
      title: titles[type],
      generatedAt: new Date().toISOString(),
      filters: {},
      columns: ["Hora", "Visitas"],
      rows: mockPeakHours.map((item) => ({ Hora: item.label, Visitas: item.value })),
      summary: [{ label: "Hora pico", value: "7 PM" }]
    };
  }

  if (type === "memberships") {
    return {
      type,
      title: titles[type],
      generatedAt: new Date().toISOString(),
      filters: {},
      columns: ["Membresia", "Ventas", "Ticket"],
      rows: mockMemberships.map((item) => ({
        Membresia: item.name,
        Ventas: item.value,
        Ticket: item.meta ?? ""
      })),
      summary: [{ label: "Membresias vendidas", value: 842 }]
    };
  }

  if (type === "cashiers-sales" || type === "cashiers-revenue") {
    return {
      type,
      title: titles[type],
      generatedAt: new Date().toISOString(),
      filters: {},
      columns: [
        "Usuario",
        "Ventas productos",
        "Ventas membresias",
        "Ventas total",
        "Recaudacion productos",
        "Recaudacion membresias",
        "Recaudacion total"
      ],
      rows: mockCashiers.map((item) => ({
        Usuario: item.cashierName,
        "Ventas productos": item.productSales,
        "Ventas membresias": item.membershipSales,
        "Ventas total": item.sales,
        "Recaudacion productos": item.productRevenue,
        "Recaudacion membresias": item.membershipRevenue,
        "Recaudacion total": item.revenue
      })),
      summary: [
        { label: "Usuarios activos", value: mockCashiers.length },
        {
          label: "Recaudacion productos",
          value: mockCashiers.reduce((total, cashier) => total + cashier.productRevenue, 0)
        },
        {
          label: "Recaudacion membresias",
          value: mockCashiers.reduce((total, cashier) => total + cashier.membershipRevenue, 0)
        }
      ]
    };
  }

  return {
    type,
    title: titles[type],
    generatedAt: new Date().toISOString(),
    filters: {},
    columns: ["Cliente", "Visitas", "Membresia"],
    rows: mockTopClients.map((item) => ({
      Cliente: item.name,
      Visitas: item.value,
      Membresia: item.meta ?? ""
    })),
    summary: [{ label: "Promedio visitas", value: 25 }]
  };
}
