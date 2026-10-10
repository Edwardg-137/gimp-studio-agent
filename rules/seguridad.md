# Seguridad

El MCP corre con los permisos del usuario. El puente escucha en loopback con token. No lo expongas a la red.

## Qué está verificado en el código

- `gimp_exec` ejecuta Python arbitrario dentro de GIMP. El namespace trae `Gimp`, `Gegl`, `Gio`, `GLib`, `GObject`, `Babl`, `pdb`, `find_image`, `find_drawable` y `compat`. La salida estructurada es la variable `_result`. Fuente: `tools/session.py` y `bridge/gimp_side.py` de gimp-studio-mcp.
- `GIMP_MCP_NO_EXEC=1` (también `true`, `yes`, `on`) no registra esa herramienta. El resto sigue. Si falta en la lista de herramientas, para: no inventes otro intérprete.
- El único uso permitido aquí es copiar un fragmento de `rules/gimp-exec-snippets.md`. Nada de código libre, ni para abrir, exportar con las herramientas que ya existen, knockout o niveles.
- `apply_filter`, `gaussian_blur`, `unsharp_mask` y `drop_shadow` hacen `merge_filter`: pisan la capa. Las herramientas de color (`levels`, `curves`, `brightness_contrast`, `hue_saturation`, `color_balance`, `desaturate`, `normalize`, …) también escriben en el drawable. No hay un deshacer fiable: `undo` y `redo` devuelven `supported: false` en GIMP 3 y no revierten. Antes de filtrar, borrar, aplanar, knockout o exportar: `duplicate_layer` (y oculta el original) o `checkpoint`. Recuperar con `restore`.
- `GIMP_MCP_HEADLESS=1` fuerza GIMP sin ventana. `GIMP_MCP_DISABLED` hace que el puente no sirva.

## Fuentes

- gimp-studio-mcp `SECURITY.md`, `tools/session.py`, `tools/filters.py`, `tools/safety.py`, `tools/color_tone.py`: https://github.com/TwelveTake-Studios/gimp-studio-mcp (commit 429da76, 2026-09-29). Revisado en el árbol local el 2026-10-10.
