---
name: studio
description: Entrada única de GIMP Studio. Enruta el brief a la skill de etapa y cierra siempre con review y export.
---

# studio

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

Cualquier encargo en lenguaje natural: “aclara las sombras”, “suaviza la piel”, “quita el fondo”, “está desenfocada”, “recórtala para Instagram”, “prepáralo para DTF”, “guárdala para la web”. Sin una skill de etapa, empieza aquí.

## Diagnóstico

1. `status`. Si falla, para y pide `gimp-mcp doctor`.
2. Sigue `open` si aún no hay imagen activa.
3. `get_metadata` y `get_bitmap`. Si el cambio es de tono o de ruido, `histogram` (`channel` `value`, y `red`/`green`/`blue` si hay dominante).

## Pasos

1. Escribe un plan de una línea: archivo, etapas, salida. Elige skills por lo que pide el usuario, no por el nombre del archivo.
   - Abrir o crear: `open`.
   - Horizonte, recorte, perspectiva, colocar un logo: `composicion`.
   - Exposición, curvas, dominante, saturación, blanco y negro: `color`.
   - Granos, ojeras, dientes, ojos, suavizar piel: `piel`.
   - Fondo, máscara, pelo, halo: `seleccion`.
   - Ruido, nitidez, claridad: `nitidez`. Ruido antes que nitidez.
   - Pintura, texto, una capa suelta: `edit`.
   - Camiseta, película, gang, underbase: `dtf`.
2. `checkpoint` con una etiqueta del brief antes del primer píxel. `undo` no revierte.
3. Ejecuta las etapas en ese orden. Cada una verifica con `get_bitmap` antes de pasar a la siguiente.
4. Sigue `review`. Si falla, vuelve a la etapa y repite `review`.
5. Sigue `export`.

No saltes el paso 4 ni el 5, aunque el usuario solo haya nombrado el retoque. Si pide no exportar, dilo en el resumen y deja el archivo sin entregar, pero el `review` se hace igual.

## Verificaciones

`checkpoint` antes de filtros, knockout, borrado o export. `gimp_exec` solo con un fragmento de `rules/gimp-exec-snippets.md`, y solo si `gimp_exec` está registrado. Si falta, `GIMP_MCP_NO_EXEC` lo apagó: no inventes otro camino.

## Errores comunes

Saltarse `review` porque el ajuste “se ve bien” en el número. Entregar sin reabrir el archivo exportado. Usar `SOFT_LIGHT` en vez de `SOFTLIGHT`.

## Oficio

- `rules/seguridad.md`
- `rules/capas.md`
- `rules/gimp-exec-snippets.md`
- La skill de cada etapa, y su archivo en `rules/`.
