# Conectar el kiosco a un Google Sheet

1. Abre la planilla (o crea una nueva) > **Extensiones > Apps Script**.
2. Borra lo que haya y pega el contenido de `Code.gs`. Guarda.
3. En el selector de funciones elige **setup** y dale **Ejecutar** (acepta los permisos). Crea las hojas `Respuestas` y `Resumen`.
4. **Implementar > Nueva implementación > Aplicación web**: ejecutar como **Yo**, acceso **Cualquier persona**. Copia la URL que termina en `/exec`.
5. En `src/kiosk.template.html` pon esa URL en `CONFIG.sheetUrl` y corre `python3 src/build.py`.
6. Prueba: haz una elección en el kiosco; debe aparecer una fila en `Respuestas` y el total subir en `Resumen`.

Si cambias el código del script, hay que volver a implementar (Nueva versión) para que tome efecto.
