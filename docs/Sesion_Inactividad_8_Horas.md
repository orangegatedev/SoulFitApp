# Sesion web por inactividad

La app usa `sessionTimeoutService` como instancia unica y `useSessionTimeout` como integracion React. Mouse, clic, teclado, scroll, touch, navegacion y operaciones mutables reinician la actividad. La marca se conserva en `localStorage` para sobrevivir recargas y sincronizar pestanas.

El heartbeat solo se envia mientras la sesion local sigue activa; una pestaña abandonada no mantiene vivo el token en la API.

Al vencer se eliminan `soulfit-auth` y `soulfit-session-last-activity`, se conserva temporalmente el mensaje en `sessionStorage` y se redirige a `/login`.

Configurar en `.env.local`:

```text
NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MINUTES=480
```

Cambiar el valor requiere reconstruir la app. El backend debe usar el mismo numero de minutos.
