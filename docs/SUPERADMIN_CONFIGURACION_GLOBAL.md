# SuperAdmin y Configuracion Global

## Arquitectura implementada

El rol `SuperAdmin` se integra en la arquitectura existente de SoulFit:

- La API usa la tabla legacy `Cargos` como fuente de roles.
- Los usuarios siguen viviendo en `Usuarios` y se relacionan con `Cargos` mediante `Usuarios.Id_cargo`.
- La autorizacion se valida con el middleware existente `role:*`.
- El frontend recibe el rol normalizado como `superadmin`.
- La opcion `Configuracion global` solo se muestra y solo se permite abrir cuando `user.role === "superadmin"`.

La configuracion global se centraliza en la API mediante `SystemSettings` y en el frontend mediante `AppConfigProvider`.

Flujo:

1. `AppConfigProvider` inicia siempre con valores deterministas para que SSR y el primer render del cliente coincidan.
2. Despues de montar, carga cache local y luego consulta `GET /api/app/config/public`.
3. Login y Sidebar usan `useAppConfig()` para titulos y visibilidad, pero conservan el logo historico de sucursal desde `GET /api/app/sucursals/logo`.
4. SuperAdmin administra valores desde `/administracion/configuracion`.
5. La API protege lectura/escritura administrativa con `auth:sanctum` + `role:SuperAdmin`.

## Base de datos

Migracion creada en API:

```text
database/migrations/2026_08_13_000001_create_system_settings_and_superadmin_role.php
```

Tabla creada:

```text
SystemSettings
--------------
Id
SettingKey
SettingValue
ValueType
created_at
updated_at
```

Valores iniciales:

```text
site_name = SoulFit
browser_title = SoulFit
login_title = Entrar a SoulFit
nav_title = SoulFit
logo_path = null
favicon_path = null
nav_visibility = JSON con claves del menu
```

Rol creado o actualizado:

```text
Cargos.Nombre = SuperAdmin
```

No se asume ningun `Id` fijo. El rol se resuelve por nombre.

## API

### GET /api/app/config/public

Autenticacion: no requiere.

Rol requerido: ninguno.

Uso: branding publico y visibilidad visual del menu.

Response:

```json
{
  "siteName": "SoulFit",
  "browserTitle": "SoulFit",
  "loginTitle": "Entrar a SoulFit",
  "navTitle": "SoulFit",
  "logoUrl": null,
  "faviconUrl": null,
  "navVisibility": {
    "dashboard": true,
    "ventas_productos": true,
    "usuarios": true,
    "sucursales": true,
    "visitas_sitio": true
  },
  "version": "default"
}
```

### GET /api/app/admin/configuration

Autenticacion: `auth:sanctum`.

Rol requerido: `SuperAdmin`.

Response: igual a configuracion publica, reservado para administracion.

### PUT /api/app/admin/configuration

Autenticacion: `auth:sanctum`.

Rol requerido: `SuperAdmin`.

Request soportado:

```text
multipart/form-data
siteName
browserTitle
loginTitle
navTitle
navVisibility JSON
favicon file opcional
```

Validaciones:

- `siteName`: string, max 120.
- `browserTitle`: string, max 160.
- `loginTitle`: string, max 160.
- `navTitle`: string, max 80.
- `favicon`: archivo `.ico`; max 512 KB.

### POST /api/app/admin/configuration

Alias del update administrativo. Se usa desde el frontend para compatibilidad robusta con `multipart/form-data`.

## Frontend

Archivos creados:

```text
types/app-config.ts
services/app-config.service.ts
components/layout/app-config-provider.tsx
components/dashboard/global-configuration-view.tsx
app/administracion/configuracion/page.tsx
docs/SUPERADMIN_CONFIGURACION_GLOBAL.md
```

Archivos modificados:

```text
app/layout.tsx
components/layout/app-providers.tsx
components/layout/auth-guard.tsx
components/layout/sidebar.tsx
components/forms/login-form.tsx
components/forms/user-form.tsx
components/dashboard/users-management.tsx
services/users.service.ts
types/auth.ts
```

Responsabilidades:

- `AppConfigProvider`: fuente unica de configuracion, cache local, titulo y favicon dinamicos.
- `app-config.service`: llamadas a API con `@/lib/api`.
- `GlobalConfigurationView`: UI de administracion para SuperAdmin.
- `Sidebar`: usa `navTitle` y `navVisibility`; el logo se carga desde `/sucursals/logo`.
- `LoginForm`: usa `loginTitle`; el logo se carga despues del primer render desde `/sucursals/logo`.
- `AuthGuard`: bloquea acceso manual a `/administracion/configuracion` para no SuperAdmin.

## Visibilidad del Nav

Claves estables:

```text
dashboard
ventas_productos
usuarios
sucursales
visitas_sitio
```

La visibilidad solo oculta o muestra elementos del menu. No reemplaza permisos funcionales ni middleware de API.

`Configuracion global` no se incluye en la lista configurable para evitar que SuperAdmin se quede sin acceso.

## Archivos multimedia

Los archivos se almacenan usando el disco Laravel `public`:

```text
storage/app/public/system/branding/favicons
```

La base de datos guarda rutas relativas como:

```text
system/branding/favicons/favicon-hash.ico
```

La API retorna URL publica generada con `Storage::url()` usando el host real del request, agregando version:

```text
https://api.soulfit.pro/storage/system/branding/favicons/favicon-hash.ico?v=...
```

El nombre generado por storage cambia por archivo y el query `v` ayuda a evitar cache agresivo del favicon.

Si existe una configuracion antigua PNG/JPG del favicon, la API publica retorna `faviconUrl: null` y el frontend usa el fallback local hasta que SuperAdmin cargue un `.ico`.

## Hidratacion

La app se exporta como sitio estatico (`output: export`), por lo que no se puede depender de SSR dinamico para obtener configuracion publica por request.

No inicializar estado con `localStorage` durante el primer render del cliente. Eso provoca HTML inicial con defaults (`Entrar a SoulFit`) y primer render cliente con cache (`Entrar a Hardcore`), generando mismatch de hidratacion.

El flujo correcto es:

```text
SSR / primer render cliente
  -> defaults deterministas
  -> hydration OK
despues de montar
  -> leer cache local
  -> consultar GET /config/public
  -> actualizar titulo, favicon y textos
```

El logo de Nav/Login no se guarda en `SystemSettings`; se mantiene la fuente original de `Sucursales.Logo` mediante `GET /api/app/sucursals/logo` para no romper la compatibilidad con WinForms ni duplicar branding.

## Seguridad

- La pantalla esta protegida en frontend y API.
- La API responde `401` si no hay token.
- La API responde `403` si el usuario autenticado no tiene cargo `SuperAdmin`.
- Solo SuperAdmin puede crear, modificar o cambiar estado de usuarios SuperAdmin.
- La seguridad no depende de ocultar botones.

## Seguridad de Usuarios SuperAdmin

Identificacion de roles:

- Backend: la fuente es `Cargos.Nombre`; `SuperAdmin` se normaliza como `superadmin` sin depender de un `Id` fijo.
- Frontend: el rol normalizado vive como `UserRole = "superadmin" | "admin" | "manager" | "cashier" | "viewer"`.
- Actor autenticado: la API usa `request()->user()` y carga su relacion `cargo`; nunca confia en roles enviados en el body.

Frontend:

- `lib/user-roles.ts` centraliza `userRoleOptions`, `roleLabels`, `getAssignableRoles()` y `canManageSuperAdminTarget()`.
- Crear usuario y Editar usuario usan `getAssignableRoles(currentUserRole)`.
- Si el actor no es SuperAdmin, el rol `SuperAdmin` no aparece en el selector.
- Si un Admin ve un usuario SuperAdmin, las acciones de editar, desactivar y cortar/restaurar acceso se deshabilitan con mensaje contextual.
- Los filtros de analytics siguen pudiendo listar usuarios SuperAdmin cuando corresponda; esta regla solo limita asignacion y administracion.

Backend:

- `App\Services\AppUserSuperAdminGuard` centraliza autorizacion de operaciones SuperAdmin.
- `POST /api/app/users`: rechaza crear/asignar `superadmin` si el actor no es SuperAdmin.
- `PUT /api/app/users/{id}`: rechaza promover a SuperAdmin, degradar un SuperAdmin o modificar privilegios SuperAdmin si el actor no es SuperAdmin.
- `PATCH /api/app/users/{id}/status`: rechaza desactivar, activar, cortar o restaurar acceso de un SuperAdmin si el actor no es SuperAdmin.
- El controlador legacy `UsuarioController` aplica el mismo guard en `store`, `update`, `destroy` y `upsert` cuando el payload o el usuario objetivo toca el cargo SuperAdmin.
- Operaciones no autorizadas responden `403` con mensaje comprensible: `No tienes permisos para administrar usuarios SuperAdmin.`

Proteccion del ultimo SuperAdmin activo:

- Antes de degradar, desactivar, cortar acceso o eliminar un SuperAdmin activo, la API cuenta los SuperAdmin activos con bloqueo dentro de una transaccion.
- Si la operacion dejaria cero SuperAdmin activos, responde `403`: `No es posible desactivar o cambiar el rol del ultimo SuperAdmin activo.`
- Si existen dos o mas SuperAdmin activos, un SuperAdmin puede degradar o desactivar a otro segun las reglas actuales.

Auditoria:

- Las operaciones autorizadas que asignan o cambian desde/hacia SuperAdmin se registran con `Log::info`.
- Los intentos de dejar el sistema sin SuperAdmin activo se registran con `Log::warning`.

## Instalacion

Backend:

```bash
cd C:\xampp\htdocs\SoulfitSysWeb
php artisan migrate
php artisan storage:link
php artisan route:clear
php artisan config:clear
```

Frontend:

```bash
cd C:\xampp\htdocs\soulfitwebapp
npm run build
```

No se instalaron dependencias nuevas.

## Rollback

Para revertir la migracion:

```bash
cd C:\xampp\htdocs\SoulfitSysWeb
php artisan migrate:rollback --path=database/migrations/2026_08_13_000001_create_system_settings_and_superadmin_role.php
```

Esto elimina `SystemSettings`.

El rollback no elimina el cargo `SuperAdmin` para evitar borrar un rol que podria tener usuarios asociados. Si se necesita retirarlo, hacerlo manualmente tras verificar que no existan usuarios vinculados.

## Validacion realizada

Ejecutado:

```bash
npm run build
php -l app\Models\SystemSetting.php
php -l app\Services\GlobalConfigurationService.php
php -l app\Http\Controllers\Api\AppGlobalConfigurationController.php
php -l app\Http\Controllers\Api\AppUserController.php
php -l database\migrations\2026_08_13_000001_create_system_settings_and_superadmin_role.php
php artisan route:list --path=api/app
php artisan test
npm run lint
php artisan migrate --pretend
```

Resultados:

- `npm run build`: correcto.
- `php -l`: correcto.
- `route:list`: endpoints registrados.
- `php artisan test`: falla por migracion legacy MySQL ejecutada sobre SQLite en memoria (`AUTO_INCREMENT`, `ENGINE=InnoDB`), no por esta implementacion.
- `npm run lint`: queda en prompt interactivo porque el proyecto no tiene ESLint configurado y `next lint` esta deprecado.
- `migrate --pretend`: no pudo conectar a SQL Server local con usuario `sa`; no modifico la base.
