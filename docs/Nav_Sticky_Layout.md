# Navegacion fija del layout

## Problema

`Topbar` ya declaraba `position: sticky`, pero varios ancestros usaban `overflow-x-hidden`. Esa combinacion puede crear un contenedor de scroll que impide al sticky seguir el viewport.

## Cambios

- `components/layout/dashboard-shell.tsx`: sustituye `overflow-x-hidden` por `overflow-x-clip`, que evita desbordamiento horizontal sin crear un contenedor de scroll.
- `components/layout/topbar.tsx`: mantiene `sticky top-0`, eleva el fondo y usa `overflow-x-clip`.
- `components/layout/sidebar.tsx`: explicita `lg:sticky lg:top-0`, altura de viewport y z-index estable.

En movil, el menu lateral conserva su comportamiento `fixed` y su overlay. En escritorio, sidebar y topbar permanecen visibles. El topbar sigue dentro del flujo, por lo que no tapa el contenido ni requiere padding artificial.

## Validacion

Ejecutar `npm run build` y revisar `/users` en escritorio y movil: scroll vertical largo, apertura/cierre del menu, tabla con scroll horizontal interno y ausencia de scroll horizontal en la pagina.

## Riesgos y rollback

`overflow-x-clip` requiere navegadores modernos, compatibles con el runtime actual de Next.js/Capacitor. El rollback consiste en restaurar las clases anteriores de los tres componentes.
