# Dashboard UI y navegacion

## Accordions del Dashboard

Las secciones `Clientes mas frecuentes` y `Membresias mas vendidas` se renderizan con:

```text
components/charts/collapsible-chart-card.tsx
```

El componente inicia cerrado por defecto mediante `defaultOpen = false`. Usa un `button` como trigger con `aria-expanded` y `aria-controls`, y anima apertura/cierre con `grid-template-rows`, opacidad y rotacion del icono `ChevronDown`.

El boton PDF no forma parte del trigger. Su `onClick` ejecuta `event.stopPropagation()` y conserva el flujo existente de `useReportExport`, `ReportType` y filtros actuales.

## Sidebar y scroll independiente

`components/layout/dashboard-shell.tsx` usa un contenedor `h-dvh overflow-hidden`. Dentro:

- `Sidebar` queda como panel independiente con `h-dvh` y `overflow-y-auto`.
- `Topbar` permanece fuera del scroll vertical del contenido.
- `main` usa `min-h-0 flex-1 overflow-y-auto overflow-x-hidden`.

Con esta estructura, al desplazarse una vista larga solo se mueve el contenido principal. Si el menu crece, el sidebar tiene scroll interno propio.

## Sidebar colapsable

El colapso visual de escritorio se controla en:

```text
components/layout/dashboard-shell.tsx
components/layout/topbar.tsx
components/layout/sidebar.tsx
```

`Topbar` muestra:

- boton movil `Menu` para abrir el drawer;
- boton escritorio `PanelLeftClose` / `PanelLeftOpen` para ocultar o mostrar el sidebar.

En escritorio, `Sidebar` aplica ancho cero, opacidad cero y `translate-x` cuando esta colapsado. El contenido principal es `flex-1`, por lo que ocupa automaticamente el espacio liberado.

En movil, el sidebar conserva el comportamiento drawer con overlay, bloqueo de scroll del `body`, cierre por click fuera, cierre por `Escape` y cierre al navegar.

## Persistencia SSR-safe

La preferencia local se guarda en:

```text
soulfit-sidebar-collapsed
```

El primer render siempre usa `sidebarCollapsed = false`. Luego, en `useEffect`, se lee `localStorage` y se aplica la preferencia. Esta estrategia mantiene identico el HTML inicial del servidor/export y el primer render del cliente, evitando hydration mismatch.

## Separacion de responsabilidades

El colapso temporal del sidebar no modifica la configuracion global ni los permisos:

```text
permisos del usuario
  + visibilidad global
  -> opciones disponibles
  -> sidebar
  -> colapso visual temporal
```

La visibilidad global sigue controlando si una opcion existe en el menu. El boton hamburguesa solo oculta o muestra el panel lateral completo para ganar espacio.
