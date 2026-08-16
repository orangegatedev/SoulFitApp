# Dashboard: descuentos de membresias

## Alcance

El Dashboard principal agrega dos metricas en `GET /api/app/dashboard/summary`:

- `membershipDiscountsCount`: cantidad de pagos de membresia activos con descuento.
- `membershipDiscountAmount`: total historico descontado en pagos de membresia.

Tambien devuelve:

- `membershipDiscountsRate`: porcentaje de membresias vendidas con descuento.
- `membershipDiscountCordoba`: total descontado en Cordoba o moneda vacia.
- `membershipDiscountDollar`: total descontado en Dolar.
- `discountsTrend`: variacion de cantidad contra el periodo anterior.
- `discountAmountTrend`: variacion del total descontado contra el periodo anterior.

## Fuente de datos

Tabla principal:

```text
Pagos_Membresias
```

Campos usados:

```text
Id
Cliente_Membresia_Id
Dia_Pago
Monto_Bruto
Descuento
Total
Moneda
Estado
Usuario_Creacion_Id
Sucursal_Id
```

La membresia se filtra mediante:

```text
Clientes_Membresia.MembresiaId
```

## Formula

Una venta de membresia tiene descuento cuando:

```text
ISNULL(Pagos_Membresias.Descuento, 0) > 0
```

`Descuentos aplicados`:

```text
COUNT(pagos activos donde Descuento > 0)
```

`Porcentaje de membresias vendidas`:

```text
membershipDiscountsCount / membershipsSold * 100
```

Si `membershipsSold = 0`, el porcentaje retorna `0`.

`Total descontado`:

```text
SUM(Pagos_Membresias.Descuento)
```

No se recalcula con la configuracion actual de la membresia. Se usa el monto historico registrado en el pago.

## Monedas

El Dashboard existente calcula recaudacion de membresias con `SUM(Pagos_Membresias.Total)`.

Para evitar mezclar descuentos cuando aparezcan pagos en distintas monedas, la API separa:

```text
membershipDiscountCordoba
membershipDiscountDollar
```

La UI muestra C$ como valor principal y agrega US$ como detalle cuando existe monto descontado en Dolar.

## Filtros

Las metricas nuevas reutilizan `applyPaymentFilters()` y respetan:

```text
from / to
cashierId
membershipType
branchId
```

Solo se consideran pagos activos:

```text
Pagos_Membresias.Estado = 'Activo'
```

Pagos anulados, eliminados o no activos quedan excluidos igual que las ventas de membresias actuales.

## Archivos modificados

API:

```text
app/Http/Controllers/Api/AppDashboardController.php
```

Frontend:

```text
types/dashboard.ts
services/mock-data.ts
components/dashboard/dashboard-view.tsx
components/dashboard/metric-card.tsx
```

Documentacion:

```text
AGENTS.md
docs/DASHBOARD_DESCUENTOS_MEMBRESIAS.md
```

## Base de datos

No se agregaron migraciones ni indices.

Indices ya existentes en el esquema legacy:

```text
Pagos_Membresias.Cliente_Membresia_Id
Pagos_Membresias.Usuario_Creacion_Id
Pagos_Membresias.Sucursal_Id
```

Si el Dashboard crece en volumen, el indice candidato a evaluar manualmente en SQL Server seria:

```sql
Pagos_Membresias(Estado, Dia_Pago, Sucursal_Id, Usuario_Creacion_Id)
INCLUDE (Cliente_Membresia_Id, Descuento, Total, Moneda)
```

No se crea desde codigo.
