# SoulFit Dashboard - AI Context

## Proyecto
Dashboard administrativo para gimnasios SoulFit.



## Stack
- Next.js 15
- TypeScript
- TailwindCSS
- Laravel API backend
- Axios para peticiones

## Backend
La URL base de la API Laravel se configura exclusivamente con:

NEXT_PUBLIC_API_URL

Ejemplo para pruebas en red local:

NEXT_PUBLIC_API_URL=http://10.65.19.13:8000/api/app

## Reglas

Mantén actualizada la documentación del proyecto.

Si introduces:
- nuevas convenciones
- endpoints
- reglas de negocio
- patrones reutilizables
- decisiones arquitectónicas

actualiza AGENTS.md o la documentación correspondiente
cuando el cambio sea relevante para futuros desarrollos.

## Convenciones

### Requests
- Siempre usar el cliente Axios central `@/lib/api`
- Nunca usar fetch directo
- La URL base debe salir de `NEXT_PUBLIC_API_URL`; no usar hosts fijos ni fallbacks a localhost/127.0.0.1.
- Los servicios deben usar el cliente central `@/lib/api` con endpoints relativos, por ejemplo `api.post("/auth/login", payload)`.
- Cuando el payload sea `FormData`, no configurar manualmente `Content-Type`; el interceptor central debe quitarlo para que el navegador agregue el boundary multipart correcto.
- Los endpoints usan snake_case en backend
- El frontend transforma a camelCase cuando es necesario

### UI
- Tema oscuro
- Color principal: rojo intenso/moderno
- Color secundario/acento: cyan o azul neon para estados activos, focus, hover e indicadores
- Evitar que rosa/fucsia vuelva a ser el color predominante
- Inputs redondeados
- Diseño responsive
- Mantener estilo actual del dashboard
- Las vistas deben evitar scroll horizontal global: usar `min-w-0`, `max-w-full` y `overflow-x-hidden` en wrappers principales cuando aplique.
- Las tablas anchas deben vivir dentro de un wrapper `max-w-full overflow-x-auto`; solo la tabla interna puede tener `min-w-*`.
- Cards, charts, filtros y headers flex/grid deben declarar `min-w-0` para que el contenido se ajuste en movil sin romper el layout.
- El sidebar movil funciona como drawer modal: overlay y panel deben quedar por encima de dropdowns/filtros, bloquear el scroll del body al abrirse y mantener scroll vertical interno para el menu.

### Buscador superior
- Reutilizar el input del Topbar para vistas administrativas con listados.
- No mostrar el buscador superior en Dashboard.
- El estado del buscador debe vivir en un store compartido y la vista activa aplica el filtrado.
- Si la busqueda es local sobre datos ya cargados, no crear endpoints nuevos.

### Selects
- Los selects grandes deben:
  - incluir buscador
  - máximo 3 filas visibles
  - scroll vertical
  - opción "Todas"
  - no limitar datos en API, backend o base de datos para controlar la altura visual
  - permitir buscar registros aunque no estén visibles inicialmente

### Membresías
Endpoint:
GET /membresias/buscar?q=texto

### Logo publico
- El login y el sidebar consumen `GET /sucursals/logo` sin autenticacion para cargar el logo de sucursal.
- El login debe mostrar primero el icono local/fallback y pedir el logo remoto despues del primer render para no retrasar la vista ni el formulario.
- La API debe retornar el primer logo valido disponible de una sucursal activa; si la primera sucursal no tiene logo, no debe responder `Logo: null` si existe otro logo utilizable.
- La columna `Sucursales.Logo` debe ser `VARBINARY(MAX)` en SQL Server para mantener compatibilidad con WinForms.
- En la app, crear/editar sucursales con logo debe convertir archivos `multipart/form-data` o base64 a binario antes de guardar; no almacenar rutas, texto, `varchar`, `nvarchar` ni base64 permanente en `Logo`.
- Los endpoints pueden responder el logo como `data:image/...;base64,...` cuando la vista lo necesita, pero nunca deben devolver binario crudo en JSON.

### Usuarios
Endpoint:
GET /users/search?q=texto

### Presencia y permisos de Cajero
- La API expone `POST /auth/heartbeat` y `POST /auth/logout` bajo `NEXT_PUBLIC_API_URL`.
- El login movil `POST /auth/login` marca al usuario como online con `CurrentSessionSource = mobile`.
- El sistema de escritorio marca presencia directamente en SQL Server con `CurrentSessionSource = desktop`.
- El estado online se calcula con `Usuarios.IsOnline` y `Usuarios.LastSeenAt`; si no hay heartbeat reciente, la API debe tratarlo como desconectado.
- Los Cajeros pueden bloquearse solo para la app movil con `Usuarios.AppAccessEnabled`; este bloqueo no debe romper el login del escritorio.
- Los permisos globales del rol Cajero viven en `CashierPermissions` y deben validarse en backend con middleware, no solo ocultarse en UI.

### Dashboard
- Cuando el dashboard se filtra por cajero, las metricas basadas en asistencias deben usar AperturaCaja/CierreCaja como fuente de verdad del turno.
- Para ese caso, solo contar asistencias cuya Fecha caiga entre FechaApertura y FechaCierre del cajero.
- Si la caja no tiene cierre, usar la fecha/hora actual como fin temporal.
- Si el cajero no tiene aperturas dentro del rango consultado, retornar datos vacios para las graficas de asistencia/hora.
- La API expone `GET /dashboard/absent-clients` para el bloque "Clientes ausentes"; calcula rangos acumulados de 1, 2, 3, 6 y 9 meses usando `MAX(Cliente_Asistencia.Fecha)` por cliente activo, incluye `sin_asistencia`, y agrupa por membresia activa o ultima membresia registrada.
- `GET /dashboard/absent-clients` debe resolverse con agregaciones por tabla, no con subconsultas por cliente: una subconsulta resume ultima asistencia por `ClienteId`, otra elige la membresia vigente/reciente con `ROW_NUMBER()`, y una sola consulta agrupada devuelve resumen por membresia. La fecha de corte usa `to/endDate/fecha2`; si no viene, usa la fecha actual.
- Indices recomendados para `GET /dashboard/absent-clients` en SQL Server: `Cliente_Asistencia(Estado, ClienteId, Fecha DESC)`, `Clientes_Membresia(ClienteId, Estado, Activo, FechaIngreso DESC, Id DESC)` incluyendo `MembresiaId` y `Sucursal_Id`, y `Clientes(Estado, Id)`.
- La carga del dashboard debe ser progresiva: primero metricas principales, luego graficas principales y al final reportes secundarios.
- Los filtros del dashboard deben aplicarse con debounce en frontend para evitar rafagas de peticiones.
- Las peticiones del dashboard deben consumir AbortSignal de React Query para cancelar solicitudes obsoletas al cambiar filtros.
- Evitar llamadas duplicadas: si dos vistas usan los mismos datos base, reutilizar la query y ordenar/derivar localmente cuando sea razonable.

### Analytics productos
- Ruta frontend: `/analytics/productos`.
- Endpoints backend bajo `/api/app/analytics/product-sales/*`.
- Fuente de verdad: Ventas + DetalleVenta + Productos + Categorias + UnidadMedida + Usuarios + Sucursales + Tipo_Pago.
- Solo contar ventas y detalles activos: `Ventas.Estado = 'Activo'` y `DetalleVenta.Estado = 'Activo'`.
- Filtros soportados: `from`, `to`, `cashier_id`, `category_id`, `product_id`, `sucursal_id`.
- Mantener carga progresiva por bloques: resumen, graficas principales, analitica secundaria y detalle.
- Compatibilidad legacy: si `DetalleVenta` no tiene `Descuento` o `PrecioAntesDelDescuento`, el backend debe calcular descuentos de forma defensiva usando `Productos.Precio` contra `DetalleVenta.PrecioUnitario`.
- El detalle usa paginacion backend con `page` y `per_page`; respuesta esperada: `{ data, meta: { current_page, per_page, total, last_page } }`.
- Exportaciones del modulo: Excel `.xlsx` y PDF en cliente, usando los filtros debounced actuales y cargando el detalle completo paginado antes de generar el archivo.
- Indices recomendados en SQL Server para este modulo: Ventas(Fecha), Ventas(UsuarioID), Ventas(SucursalId), DetalleVenta(VentaID), DetalleVenta(ProductoID), Productos(CategoriaID).

## Reglas importantes
- No romper el diseño actual
- No eliminar componentes existentes
- No cambiar rutas sin necesidad
- Mantener tipado TypeScript
- No usar any

## Build
La app usa:
output: 'export'

## PWA
- La PWA se publica subiendo el contenido de `out/` a `https://app.soulfit.pro`.
- El manifest oficial vive en `public/manifest.webmanifest` y debe usar `start_url: "/login/"`, `display: "standalone"` y rutas absolutas para iconos.
- Los iconos instalables requeridos viven en `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/maskable-192.png`, `public/icons/maskable-512.png` y `public/icons/apple-touch-icon.png`.
- El service worker vive en `public/sw.js`; solo debe cachear recursos same-origin y nunca interceptar/cachear la API Laravel externa.
- En desarrollo local, la app debe desregistrar service workers y limpiar caches del origen para evitar que builds anteriores mantengan un `NEXT_PUBLIC_API_URL` viejo en `localhost`.
- Despues de cambios PWA, validar que `npm run build` copie `manifest.webmanifest`, `sw.js` e iconos a `out/`.
- Produccion debe usar `NEXT_PUBLIC_API_URL` con host real/HTTPS accesible desde navegador movil; no usar `localhost` ni `127.0.0.1`.

## Mobile / Capacitor
- La app movil usa Capacitor con `webDir: "out"` y consume el mismo build estatico de Next export.
- Antes de sincronizar plataformas nativas, ejecutar `npm run mobile:build`; para sincronizar ambas plataformas usar `npm run mobile:sync`.
- Los recursos nativos salen de `resources/icon.svg` y `resources/splash.svg`; regenerarlos con `npm run mobile:assets` cuando cambie la marca visual.
- Android vive en `android/` y iOS en `ios/`. Android puede abrirse con `npm run android`; iOS requiere macOS + Xcode.
- Para generar APK debug usar `npm run android:apk`; para AAB release usar `npm run android:aab` y firmar desde Android Studio/Gradle segun el flujo de publicacion.
- Android Gradle Plugin requiere JDK 11+; en Windows se puede usar el JBR incluido en Android Studio si el `java` global apunta a Java 8.
- En movil la API debe apuntar a una IP/host accesible desde el dispositivo mediante `NEXT_PUBLIC_API_URL`; no usar `localhost` ni `127.0.0.1`.
- Para pruebas LAN con HTTP, Android/iOS tienen configuracion nativa de desarrollo para permitir cleartext/ATS. En publicacion usar HTTPS.
- El origen de Capacitor es `https://localhost`; la API debe permitirlo en CORS junto con `https://app.soulfit.pro`.
- Para diagnosticar errores de red en Android, activar `NEXT_PUBLIC_API_DEBUG=true` al compilar o ejecutar en consola WebView `localStorage.setItem("soulfit-api-debug","true")`.

## Deployment
La app se despliega estática en Apache/XAMPP.

## Comandos
npm run dev
npm run build
npm run mobile:sync
npm run android

# Backend API Source

El código fuente de la API Laravel se encuentra en:

C:\xampp\htdocs\SoulfitSysWeb

## Backend stack
- Laravel
- SQL Server
- Sanctum/Auth API

## Importante
Cuando sea necesario modificar endpoints, modelos,
controladores o validaciones, revisar este proyecto backend.
