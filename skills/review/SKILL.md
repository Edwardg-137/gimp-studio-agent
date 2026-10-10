---
name: review
description: Revisa con get_bitmap, histograma y color_at antes de exportar. No exporta.
---

# review

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

Siempre, al final de `studio`, y cuando pidan “mírame esto” o “¿está bien?”. No llama a `export_image` ni a `export_dtf_png`.

## Diagnóstico

`get_bitmap` del lienzo (`max_dim` 1200) y un `region` al 100 % del sitio del brief (mejilla, borde del recorte, horizonte, cielo). `histogram` de `value` y, si hay transparencia, de `alpha`. `get_metadata`.

## Pasos

1. Compara con el pedido, no con un ideal genérico.
2. Tono: el histograma no debe haber pegado a 0 y a 255 más zona que antes del ajuste. Neutro de referencia con `color_at`: R, G y B a menos de 5 si debía ser gris.
3. Piel: poros visibles en el `region`. Dientes sin 255 puro. Ojos sin blanco nuclear.
4. Recorte: `get_bitmap` sobre negro y sobre un color vivo. Halo o borde fantasma: vuelve a `seleccion`.
5. Nitidez: borde sin doble contorno y zona lisa sin grano nuevo.
6. DTF: alfa del borde en 0 o 255 (`read_region`). Esquinas transparentes. Pulgadas ≈ píxeles / dpi. Líneas no más finas de unas 6 px a 300 DPI.
7. Composición: sujeto cerca de un tercio si ese era el encargo. Esquinas opacas si no se pidió transparencia.
8. Si algo falla, nómbralo y vuelve a la etapa. No exportes un review fallido.

## Verificaciones

Esta skill no pinta. Un `checkpoint` nuevo solo si vas a corregir a continuación.

## Errores comunes

Dar por bueno el número del histograma sin el `get_bitmap`. Revisar la sesión y no el archivo: el archivo se revisa en `export`, después de reabrirlo.

## Oficio

- `rules/color.md`
- `rules/piel.md`
- `rules/seleccion.md`
- `rules/nitidez.md`
- `rules/dtf.md`
- `rules/exportacion.md`
