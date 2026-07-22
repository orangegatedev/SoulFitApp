# Correccion de codificacion UTF-8

## Causa encontrada

El transporte HTTP y la conexion SQL Server ya trabajan con Unicode. El problema visible provenia de cadenas fuente guardadas despues de una doble interpretacion: bytes UTF-8 fueron tratados como Windows-1252 y luego guardados otra vez como UTF-8. Esto produjo secuencias como `configuraciÃƒÂ³n`.

Se encontraron textos afectados en el panel de visitas del frontend y en dos etiquetas de ubicacion del endpoint Laravel. `routes/api.php` contenia el mismo problema solamente en comentarios. Tambien habia textos visibles escritos sin tildes, como `Iniciar sesion`, `Contrasena` y `Telefono`.

## Cambios

- Se repararon las cadenas mojibake y los textos visibles sin tildes.
- `app/layout.tsx` declara `<meta charSet="UTF-8" />`.
- Axios envia `Accept: application/json` y `Content-Type: application/json; charset=utf-8` para JSON. FormData conserva el boundary automatico del navegador.
- Laravel agrega `charset=UTF-8` a respuestas JSON mediante `AppCorsMiddleware`.
- `.editorconfig` fija UTF-8, LF y salto final para los archivos del frontend.
- Los archivos modificados fueron escritos como UTF-8 sin BOM.

## Base de datos

No se modificaron datos. SQL Server usa tipos Unicode donde el esquema define `nvarchar`; el driver Laravel tiene `charset=utf8`. La conversion defensiva de `AppSucursalController::cleanText` solo actua cuando el valor no es UTF-8 valido y no se cambio.

Antes de corregir datos persistidos, ejecutar consultas de solo lectura por tabla y columna, por ejemplo:

```sql
SELECT TOP (100) Id, Nombre
FROM dbo.Sucursales
WHERE Nombre LIKE N'%Ãƒ%' OR Nombre LIKE N'%Ã‚%' OR Nombre LIKE N'%ï¿½%';
```

Si aparecen filas, preparar un script por columna con respaldo y transaccion. No aplicar reemplazos globales a toda la base.

## Validacion

- Buscar `Ãƒ`, `Ã‚` y `ï¿½` en fuentes frontend y API.
- Compilar la app con `npm run build`.
- Ejecutar pruebas Laravel y revisar el header Content-Type de una respuesta JSON.
- Verificar login, menus, formularios y panel de estadisticas con textos espanoles.

Evitar editores configurados como ANSI/Windows-1252 y no usar `utf8_encode`, `utf8_decode` o conversiones manuales sobre JSON valido.