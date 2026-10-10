# Seguridad

El MCP corre con los permisos del usuario. El puente escucha en loopback con token; no lo expongas a la red.

- Prefiere las herramientas estructuradas. `gimp_exec` ejecuta Python arbitrario dentro de GIMP. Úsalo solo si ninguna herramienta de `src/gimp_mcp/tools` cubre el caso, dilo en el plan y no lo uses para abrir, exportar, knockout ni niveles.
- Para apagar ese escape: `GIMP_MCP_NO_EXEC=1`. El resto de herramientas sigue disponible.
- `GIMP_MCP_HEADLESS=1` fuerza GIMP sin ventana. `GIMP_MCP_DISABLED` hace que el puente no sirva.
- Antes de borrar capas, aplanar, knockout o exportar: `checkpoint`. Recuperar con `restore`. `undo` no revierte en GIMP 3.
