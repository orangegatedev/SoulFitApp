# Cierres De Caja Analytics

## Cambios

- Se agrego la ruta frontend `/cierres-caja`.
- Se agrego la clave de visibilidad global `cierres_caja`.
- Se agregaron endpoints Laravel bajo `/api/app/cash-closings`.
- Se agrego `GET /api/app/users/options` como fuente comun para filtros de Usuario.
- Se cambio la etiqueta visible de filtros/reportes existentes de "Cajero" a "Usuario" donde aplica.
- Se amplio `Descuentos -> Pagos con descuento` para abrir un drawer de auditoria con pagos individuales bajo demanda.

## Endpoints

- `GET /api/app/cash-closings/filter-options`
  - Devuelve anos disponibles en `CierreCaja`.
- `GET /api/app/cash-closings`
  - Parametros: `user_id`, `month`, `year`, `page`, `per_page`.
  - Devuelve cierres paginados sin datos pesados.
- `GET /api/app/cash-closings/{id}/analytics`
  - Devuelve resumen general, membresias, productos y descuentos del cierre seleccionado.
- `GET /api/app/cash-closings/{id}/analytics/discount-payments`
  - Devuelve solo los pagos de membresias con descuento del cierre seleccionado.
  - Se carga bajo demanda al hacer click en la tarjeta `Pagos con descuento`.

## Logica Financiera

La base no tiene `CierreCajaId` en `Ventas` ni en `Pagos_Membresias`. Por eso la relacion usada es:

1. `CierreCaja.AperturaCajaId`.
2. `AperturaCaja.FechaApertura`.
3. `CierreCaja.FechaCierre`.
4. Mismo `UsuarioID` y `SucursalID`.

Para pagos de membresias tambien se respeta `Tipo_Cambio_Id` del cierre cuando existe, igual que el flujo de cierre del sistema de escritorio.

No se usa una aproximacion por dia completo. Si un cierre no tiene apertura asociada, el endpoint responde que no puede calcular analytics fiable.

## Membresias

Fuente:

- `Pagos_Membresias`
- `Clientes_Membresia`
- `Membresia`
- `Tipo_Pago`

Campos:

- Valor original: `Monto_Bruto`, con fallback `Total + Descuento - Mora`.
- Descuento: `Descuento`.
- Cobrado: `Total`.

La clasificacion Gym, Spinning, Combo y Personalizadas se deriva de `Membresia.Nombre`/`Periodo`, porque no existe una tabla formal de categorias de membresia en la estructura actual. El endpoint tambien devuelve desglose exacto por membresia.

## Descuentos

El resumen de descuentos y el detalle usan la misma fuente:

- `Pagos_Membresias`
- `Clientes_Membresia`
- `Clientes`
- `Membresia`
- `Usuarios`
- `Sucursales`
- `Tipo_Pago`

Relacion con cliente:

- `Pagos_Membresias.Cliente_Membresia_Id` -> `Clientes_Membresia.Id`.
- `Clientes_Membresia.ClienteId` -> `Clientes.Id`.
- El nombre mostrado es `Clientes.Nombres + Clientes.Apellidos`.

Relacion con usuario/cajero:

- `Pagos_Membresias.Usuario_Creacion_Id` -> `Usuarios.Id`.
- Este usuario es quien registro el cobro. No se sustituye por el usuario propietario del cierre salvo que sea el mismo por la relacion del cierre.

Campos historicos:

- Monto original: `Pagos_Membresias.Monto_Bruto`.
- Fallback de monto original: `Pagos_Membresias.Total + Pagos_Membresias.Descuento - Pagos_Membresias.Mora`, que es la misma formula defensiva del resumen.
- Descuento: `Pagos_Membresias.Descuento`.
- Monto pagado: `Pagos_Membresias.Total`.

Filtro de pertenencia al cierre:

1. `CierreCaja.AperturaCajaId = AperturaCaja.Id`.
2. `Pagos_Membresias.Dia_Pago` entre `AperturaCaja.FechaApertura` y `CierreCaja.FechaCierre`.
3. `Pagos_Membresias.Usuario_Creacion_Id = CierreCaja.UsuarioID`.
4. `Pagos_Membresias.Sucursal_Id = CierreCaja.SucursalID`.
5. Si existe `CierreCaja.TipoCambioID`, se exige `Pagos_Membresias.Tipo_Cambio_Id = CierreCaja.TipoCambioID`.
6. Solo pagos activos con `Pagos_Membresias.Descuento > 0`.

Validaciones:

- `COUNT(detalle.payments)` debe coincidir con `discounts.summary.paymentsWithDiscount`.
- `SUM(detalle.payments.discount)` debe coincidir con `discounts.summary.totalDiscount`.
- La respuesta incluye `summary.matchesAnalytics`; si no coincide, el drawer muestra advertencia.

UI:

- La tarjeta `Pagos con descuento` es interactiva solo si el conteo es mayor que cero.
- El drawer se cierra al cambiar el cierre seleccionado.
- En escritorio se usa tabla compacta; en movil se usan tarjetas por pago.

## Productos

Fuente:

- `Ventas`
- `DetalleVenta`
- `Productos`
- `Categorias`
- `Tipo_Pago`

Solo se cuentan ventas y detalles activos.

## Nota Para Produccion

Actualizar backend y frontend juntos. El frontend nuevo depende de:

- `GET /api/app/cash-closings`
- `GET /api/app/cash-closings/filter-options`
- `GET /api/app/cash-closings/{id}/analytics`
- `GET /api/app/cash-closings/{id}/analytics/discount-payments`
- `GET /api/app/users/options`
