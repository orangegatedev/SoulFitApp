import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { CashierMetric } from "@/types/dashboard";

export function CashierTable({ data }: { data: CashierMetric[] }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-white/10">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="text-xs uppercase text-zinc-500">
          <tr className="border-b border-white/10">
            <th className="py-3 pr-3">Usuario</th>
            <th className="py-3 pr-3">Ventas totales</th>
            <th className="py-3 pr-3">Recaudacion total</th>
            <th className="py-3">Performance</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cashier) => (
            <tr key={cashier.cashierId} className="border-b border-white/6">
              <td className="max-w-[180px] truncate py-3 pr-3 font-semibold text-white">
                {cashier.cashierName}
              </td>
              <td className="py-3 pr-3 text-zinc-300">
                <div className="font-semibold text-white">{cashier.sales}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Productos {cashier.productSales} / Membresias {cashier.membershipSales}
                </div>
              </td>
              <td className="py-3 pr-3 text-zinc-300">
                <div className="font-semibold text-white">{formatCurrency(cashier.revenue)}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Productos {formatCurrency(cashier.productRevenue)} / Membresias{" "}
                  {formatCurrency(cashier.membershipRevenue)}
                </div>
              </td>
              <td className="py-3">
                <Badge variant={cashier.sales > 170 ? "success" : "outline"}>
                  {cashier.sales > 170 ? "Alto" : "Estable"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
