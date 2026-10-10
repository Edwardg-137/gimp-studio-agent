# DTF

Cada píxel con algo de opacidad recibe tinta, y en la práctica una base blanca. Un semitransparente sale como halo claro, sobre todo en prenda oscura. El alfa de un logo, un texto o un cartoon tiene que quedar en 0 o 255.

## El proveedor manda el color

Los talleres no coinciden. Unos piden entregar en sRGB y convierten ellos. Otros piden CMYK y desaconsejan RGB. Pregunta el requisito antes de convertir. Si no hay respuesta, sigue en sRGB y dilo: un RGB muy saturado puede salir menos vivo. CMYK solo con el perfil `.icc` que te den (`convert_profile`). Un CMYK sin ese perfil, o encima de un RIP que esperaba RGB, es una conversión de más.

No incrustes underbase salvo que lo pidan con esas palabras. El RIP suele generarla. Si la piden: `white_underbase` con `choke` 2, y avisa.

## Flujo

`checkpoint`, quitar fondo si hace falta, umbral del alfa, `trim_to_content`, `print_geometry`, y el export lo hace la otra skill (`export_dtf_png`). Entregar RGBA a 300 DPI.

1. Fondo de prenda: `list_shirt_presets` y `knockout_background`. Negro tiende a `subtract`; rojos y claros, a `hard`. `contiguous` true si ese color también es dibujo interior (lineart, ojos de letras). Un plano duro sin lógica de prenda: `cutout_color`. Un fundido que no quieres como film: `color_to_alpha` y después el umbral, porque deja alfa intermedio. Halo de color: `despill` con `amount` 0,5; es aproximado, míralo.
2. Umbral: `threshold_alpha` o `clean_for_dtf`, partida 0,5. Halo fuerte: hacia 0,56. Detalle fino que se come: hacia 0,47. No lo uses en un degradado que quieras conservar.
3. Sombra, glow o degradado: no los dejes en semitransparente. `halftone_separation` es solo un vistazo. El semitono de verdad va con `describe_op` `gegl:newsprint` y `apply_filter`, o el fragmento `newsprint`. Partida orientativa: periodo cerca de 10 px a 300 DPI, ángulo 22,5 o 45, antialias en 1. Ese periodo sale de dividir 300 entre unos 30 LPI (talleres hablan de 25–35 LPI y de un punto mínimo cerca de 0,5 mm). Es una estimación de partida, no una ficha de proveedor. Los nombres de propiedades por canal no se fijan aquí: `describe_op` antes. Luego otra vez el umbral.
4. Polvo fuera del motivo, antes de recortar. `trim_to_content` usa cualquier alfa mayor que 0.
5. Tamaño: `print_geometry` con `dpi` 300 y `width_in` o `height_in`. Remuestrea. `export_dtf_png` solo etiqueta el DPI. Si para el tamaño pedido hay que ampliar más de un 150 %, avisa antes. Pulgadas honestas = píxeles / 300.
6. Líneas por debajo de unas 6 px a 300 DPI: `edge_spread` 1 o 2. `edge_choke` recorta el alfa hacia dentro.
7. Hoja: cada pieza lista y `gang_sheet` (`sheet_width_in` 22, `dpi` 300, `gutter_in` 0,125) salvo otro número del brief. Ya escribe el PNG.

## Ver

Tras el knockout y tras el umbral: `get_bitmap` sobre `#000000` y sobre `#ff00ff`. `read_region` en el borde: alfa 0 o 255. Esquinas: `color_at` con alfa 0.

## Fuentes

- DTF Transfer Club: https://dtftransferclub.com/artwork-considerations/ (consultado 2026-10-10).
- dtf.market (entrega RGB): https://www.dtf.market/guides/design-file-preparation (consultado 2026-10-10).
- housedtf (pide CMYK): https://www.housedtf.com/resources/artwork-guidelines.html (consultado 2026-10-10).
- DTF Database: https://dtfdatabase.com/blog/gimp-for-dtf-transfers-free-photoshop-alternative/ (consultado 2026-10-10).
- DTFWiz, semitransparentes, umbral orientativo 0,56: https://dtfwiz.com/fix/semi-transparent-pixels-dtf (consultado 2026-10-10; sitio de una herramienta comercial).
- Printed Mint, 25–35 LPI: https://printedmint.com/blog/drop-shipping-business-tips-5/mastering-halftones-simulating-transparency-in-dtf-t-shirt-printing-985 (consultado 2026-10-10).
- Manual GIMP 3.0: newsprint, threshold alpha, color to alpha, print size. https://docs.gimp.org/3.0/en/gimp-filter-newsprint.html y páginas hermanas. GEGL newsprint: https://gegl.org/operations/gegl-newsprint.html . Consultado 2026-10-10.
- gimp-studio-mcp `tools/print_dtf.py` (commit 429da76). `export_dtf_png` etiqueta DPI; `print_geometry` remuestrea.
