# SoulFit Dashboard

Dashboard estadistico para gimnasio construido con Next.js App Router, TypeScript, Tailwind CSS, componentes estilo Shadcn/UI, Recharts, TanStack Query, Axios, Zustand, jsPDF, PWA y Capacitor.

## Requisitos

- Node.js 20 o superior.
- npm.
- Android Studio para Android, usando JDK 11+ o el JBR incluido en Android Studio.
- Xcode en macOS para iOS.

## Configuracion

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
cp .env.example .env.local
```

3. Configura la API:

```env
NEXT_PUBLIC_API_URL=http://10.65.19.13:8000/api/app
NEXT_PUBLIC_USE_MOCKS=true
```

Con `NEXT_PUBLIC_USE_MOCKS=true` la app usa datos demo. Para conectar la API real, cambia a `false` y asegúrate de exponer estos endpoints:

- `POST /auth/login`
- `GET /dashboard/summary`
- `GET /dashboard/attendance`
- `GET /dashboard/top-clients`
- `GET /dashboard/peak-hours`
- `GET /dashboard/memberships`
- `GET /dashboard/cashiers-sales`
- `GET /dashboard/cashiers-revenue`
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `PATCH /users/:id/status`
- `GET /sucursals`
- `POST /sucursals`
- `PUT /sucursals/:id`
- `PATCH /sucursals/:id`
- `DELETE /sucursals/:id`
- `GET /reports/:type`

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`. Si el puerto está ocupado:

```bash
npm run dev -- -p 3001
```

Credenciales demo:

- Email: `admin@soulfit.com`
- Password: cualquier valor en modo mock.

## Compilar como web/PWA

```bash
npm run build
```

Next exporta la aplicacion estatica en `out/`. La PWA incluye manifest, iconos PNG instalables, service worker y soporte de instalacion en navegadores compatibles.

### PWA instalable

Para publicar la PWA, sube el contenido de `out/` a `https://app.soulfit.pro`.

La PWA instalable usa:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-192.png`
- `public/icons/maskable-512.png`
- `public/icons/apple-touch-icon.png`

El manifest inicia en `/login/`, usa `display: standalone` y mantiene el tema oscuro rojo/neon del sistema. El service worker cachea solo recursos del mismo origen para no interferir con la API Laravel externa.

Despues de `npm run build`, verifica en `out/`:

```text
out/manifest.webmanifest
out/sw.js
out/icons/icon-192.png
out/icons/icon-512.png
```

En produccion configura `NEXT_PUBLIC_API_URL` con el host real de la API. No uses `localhost` ni `127.0.0.1` para una PWA publicada.

## Mobile con Capacitor

Capacitor usa el mismo build estatico de Next:

- `webDir`: `out`
- Android package id: `com.soulfit.dashboard`
- App name: `SoulFit`

La API debe configurarse con un host accesible desde el dispositivo movil. No uses `localhost` ni `127.0.0.1` para pruebas en telefono real:

```env
NEXT_PUBLIC_API_URL=http://10.65.19.13:8000/api/app
NEXT_PUBLIC_USE_MOCKS=false
```

### Recursos nativos

Los iconos y splash se generan desde:

- `resources/icon.svg`
- `resources/splash.svg`

Cuando cambien, ejecuta:

```bash
npm run mobile:assets
```

### Sincronizar plataformas

```bash
npm run mobile:sync
```

Este comando ejecuta `next build` y luego `cap sync`, copiando `out/` a las plataformas nativas.

## Android con Capacitor

1. Agrega Android la primera vez si la carpeta no existe:

```bash
npm run cap:add:android
```

2. Sincroniza Android:

```bash
npm run android:sync
```

3. Abre Android Studio:

```bash
npm run android
```

4. Genera APK debug:

```bash
npm run android:apk
```

El APK queda normalmente en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

5. Genera AAB release para publicacion futura:

```bash
npm run android:aab
```

El AAB queda normalmente en:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Para release real, configura firma en Android Studio o Gradle antes de publicar.

Si tu terminal usa Java 8, configura `JAVA_HOME` antes de generar APK/AAB. En Windows con Android Studio suele funcionar:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

## iOS con Capacitor

iOS requiere macOS con Xcode.

1. Agrega iOS la primera vez si la carpeta no existe:

```bash
npm run cap:add:ios
```

2. Sincroniza iOS:

```bash
npm run ios:sync
```

3. Abre Xcode:

```bash
npm run ios
```

## Estructura

- `app/`: rutas App Router.
- `components/dashboard/`: vistas, filtros, metric cards y estados.
- `components/charts/`: graficos Recharts y tablas.
- `components/layout/`: guard de autenticacion, sidebar, topbar y shell.
- `components/forms/`: login y formulario de usuarios.
- `lib/`: Axios, utilidades y generador PDF.
- `services/`: servicios REST por dominio.
- `stores/`: Zustand para auth y filtros.
- `hooks/`: hooks TanStack Query.
- `types/`: contratos TypeScript de API.

## Notas de integracion

- El JWT se guarda con Zustand Persist en `localStorage`.
- `lib/api.ts` agrega `Authorization: Bearer <token>` en cada request.
- Si la API responde `401`, se limpia la sesion y se redirige a `/login`.
- Los reportes PDF consultan `GET /reports/:type` cuando `NEXT_PUBLIC_USE_MOCKS=false`.
