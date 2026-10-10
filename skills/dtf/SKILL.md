---
name: dtf
description: Prepara un PNG para DTF. Pregunta el requisito del proveedor (sRGB o CMYK) y no asume la base blanca.
---

# dtf

Requiere el servidor MCP `gimp` (`gimp-mcp serve`). No exporta el archivo final si quien manda es `studio`: después van `review` y `export`.

## Cuándo usar

“Prepáralo para DTF”, “camiseta negra, 10 pulgadas”, “que la sombra no haga halo”, “hay blanco dentro del logo”, “hoja de 22 pulgadas”, “ponle base blanca”, “esta foto de Instagram para la espalda”.

## Diagnóstico

`get_metadata` y `get_bitmap`. Cuenta las pulgadas honestas: píxeles / 300. Si para el tamaño pedido hay que ampliar más de un 150 %, avisa antes de escalar. `checkpoint`.

Pregunta al usuario qué pide su proveedor, sRGB o CMYK, antes de convertir nada. Los talleres no coinciden. Si no contesta, sigue en sRGB y dilo en el resumen. No incrustes underbase salvo que lo pida con esas palabras.

## Pasos

1. Fondo. Color de prenda o fondo plano: `list_shirt_presets` y `knockout_background` (`shirt` o `color` o `sample_xy`). Si ese color también es dibujo interior, `contiguous` true. Un solo plano duro: `cutout_color`. Un fundido suave que no sea film: `color_to_alpha`, y luego el paso 2 porque deja alfa intermedio. Halo de color: `despill` con `amount` 0,5 y míralo; es aproximado.
2. Alfa binario en logos, texto y cartoon. `threshold_alpha` o `clean_for_dtf` con partida 0,5. Halo fuerte: sube hacia 0,56. Detalle fino que se come: baja hacia 0,47. Esto endurece bordes suaves: no lo uses en un degradado que quieras conservar.
3. Degradado, sombra o glow. No los dejes en semitransparente: en la película salen como halo blanco. `halftone_separation` es solo un vistazo. Para el alfa, `apply_filter` `gegl:newsprint` sobre una máscara, o el fragmento `newsprint` de `rules/gimp-exec-snippets.md`. Partida: periodo cerca de 10 px a 300 DPI, ángulo 22,5 o 45, antialias en 1. Luego otra vez el umbral del paso 2. Confirma los nombres de propiedades con `describe_op` `gegl:newsprint` antes de fijarlos.
4. Polvo fuera del motivo: el umbral del paso 2, antes de recortar. `trim_to_content` usa cualquier alfa > 0 y agranda el archivo si queda polvo.
5. Tamaño. `print_geometry` con `dpi` 300 y `width_in` o `height_in`. Remuestrea. `export_dtf_png` solo etiqueta el DPI, no cambia las pulgadas.
6. Líneas finas, por debajo de unas 6 px a 300 DPI: `edge_spread` 1 o 2. Underbase solo si lo pidieron: `white_underbase` con `choke` 2. Avisa de que el RIP suele generarla.
7. Hoja: prepara cada pieza y `gang_sheet` (`sheet_width_in` 22, `dpi` 300, `gutter_in` 0,125) salvo otro número del brief.
8. No exportes aquí el PNG de entrega. La skill `export` llama a `export_dtf_png` después del `review`.

## Verificaciones

Tras el knockout y tras el umbral: `get_bitmap` con `background` `#000000` y otro con `#ff00ff`. `read_region` en el borde: alfa 0 o 255, no valores de en medio. Esquinas: `color_at` con alfa 0.

## Errores comunes

Asumir CMYK o sRGB. Underbase no pedida. `print_geometry` después de exportar. Knockout global que se come el blanco interior. Ampliar una captura de 1080 px hasta una espalda de 12 pulgadas sin avisar.

## Oficio

- `rules/dtf.md`
- `rules/exportacion.md`
- `rules/gimp-exec-snippets.md`
- `rules/seguridad.md`
