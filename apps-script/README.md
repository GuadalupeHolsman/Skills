# Conectar el kiosco a un Google Sheet

1. Abre la planilla (o crea una nueva) > **Extensiones > Apps Script**.
2. Borra lo que haya y pega el contenido de `Code.gs`. Guarda.
3. En el selector de funciones elige **setup** y dale **Ejecutar** (acepta los permisos). Crea las hojas `Respuestas` y `Resumen`.
4. **Implementar > Nueva implementación > Aplicación web**: ejecutar como **Yo**, acceso **Cualquier persona**. Copia la URL que termina en `/exec`.
5. En `src/kiosk.template.html` pon esa URL en `CONFIG.sheetUrl` y corre `python3 src/build.py`.
6. Prueba: haz una elección en el kiosco; debe aparecer una fila en `Respuestas` y el total subir en `Resumen`.

Si cambias el código del script, hay que volver a implementar (Nueva versión) para que tome efecto.

## Reiniciar los datos (antes del evento)
Con el código actualizado, la planilla muestra el menú **Loomlock > Reiniciar datos…** (recarga la página de la planilla si no aparece). Pregunta si quieres guardar una copia (pestaña "Copia fecha hora") y después borra las respuestas de la hoja `Respuestas`. Los totales y gráficos vuelven a cero. No hace falta volver a implementar.

## Nombre del invitado
Desde que el kiosco pide el nombre, `doPost` lo guarda en la columna E (`nombre`). Para que funcione hay que pegar el `Code.gs` nuevo y hacer **Implementar > Administrar implementaciones > editar > Versión: Nueva versión > Implementar** (la URL no cambia). Sin eso, todo sigue funcionando pero el nombre no se guarda.

## URL en uso
El kiosco envía a la implementación `AKfycbzWGRs-…/exec` (la que guarda el nombre en la columna E). La implementación anterior (`AKfycbwJnm…`) ya no se usa.
