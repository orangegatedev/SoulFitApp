# Presencia de usuarios y busqueda de clientes

## Alcance

Cambios coordinados entre:

- Backend Laravel: `C:\xampp\htdocs\SoulfitSysWeb`
- App web/movil: `C:\xampp\htdocs\soulfitwebapp`
- Escritorio C#: `C:\Users\USUARIO\source\repos\SoulFitSys`

## Presencia de usuarios

La arquitectura existente usa la tabla `Usuarios` con estos campos:

- `IsOnline`
- `LastSeenAt`
- `CurrentSessionSource`

No se creo migracion nueva porque esos campos ya existen en la API y en el sistema de escritorio.

### Origen de sesion

- `mobile`: login o heartbeat desde app web/movil. La interfaz lo muestra como `App`.
- `desktop`: login o heartbeat desde el software de escritorio. La interfaz lo muestra como `Terminal de escritorio`.

La API ya marca `mobile` en `POST /auth/login` y `POST /auth/heartbeat`.
El escritorio marca `desktop` directamente en SQL Server al iniciar sesion, y mantiene la presencia con heartbeat cada minuto desde `FrmPrincipal`.

Al cerrar el formulario principal del escritorio se llama `MarkOffline`, dejando `IsOnline = 0` y limpiando `CurrentSessionSource`.

Limitacion conocida: si Windows cierra el proceso de forma abrupta, no existe cierre formal. En ese caso la app debe considerar desconectado a un usuario sin heartbeat reciente usando `LastSeenAt`.

## App web/movil

Archivo actualizado:

- `components/dashboard/users-management.tsx`

La columna `Conexion` ahora muestra un badge claro:

- `App`
- `Terminal de escritorio`
- `Sin sesion activa`

El color mantiene la paleta oscura de SoulFit: cian para app y rojo suave para escritorio.

## Escritorio C#

Archivos relevantes:

- `Controladores/CUsuarios.cs`
- `Vistas/FrmPrincipal.cs`
- `Vistas/Clientes/FrmClientes.cs`
- `Docs/OptimizacionClientesPagos.md`

`CUsuarios.IniciarSesion` marca online con `desktop` cuando las credenciales son validas.
`FrmPrincipal` refresca la presencia cada minuto y marca offline al cerrar.

## Busqueda automatica en Clientes

`FrmClientes` mantiene:

- Carga inicial de primera pagina.
- Busqueda manual con Enter.
- Busqueda manual con boton.
- Paginacion existente.
- Estados visuales de carga.

Nuevo comportamiento:

- `TextChanged` solo programa busqueda automatica con 4 o mas caracteres.
- No consulta con 1, 2 o 3 caracteres.
- Usa debounce de 400 ms.
- Si el texto baja de 4 caracteres, se cancela la busqueda automatica pendiente o en curso.

## Rendimiento

La consulta paginada de `CClientes.BuscarPaginadoAsync` ya usa:

- Parametros SQL.
- Coincidencia exacta para `Telefono`, `Cedula` y `Barcode`.
- Prefijo para `Nombres`, `Apellidos` y `Email`.
- Listado liviano sin foto, huella ni binarios.

Indices recomendados si se detecta lentitud en SQL Server:

```sql
CREATE INDEX IX_Clientes_Estado_Telefono ON Clientes (Estado, Telefono);
CREATE INDEX IX_Clientes_Estado_Cedula ON Clientes (Estado, Cedula);
CREATE INDEX IX_Clientes_Estado_Barcode ON Clientes (Estado, Barcode);
CREATE INDEX IX_Clientes_Estado_Nombres ON Clientes (Estado, Nombres);
CREATE INDEX IX_Clientes_Estado_Apellidos ON Clientes (Estado, Apellidos);
CREATE INDEX IX_Clientes_Estado_Email ON Clientes (Estado, Email);
```

Estos indices no fueron creados desde codigo para evitar alterar estructura sin autorizacion explicita.

## Validaciones esperadas

- Login desde app: `CurrentSessionSource = mobile`.
- Login desde escritorio: `CurrentSessionSource = desktop`.
- Usuarios conectados en app muestran `App` o `Terminal de escritorio`.
- Cierre normal de escritorio marca offline.
- Busqueda con 3 caracteres no consulta.
- Busqueda con 4 caracteres consulta con debounce.
- Busqueda por telefono y nombre siguen funcionando.
- Enter y boton siguen funcionando sin esperar debounce.
