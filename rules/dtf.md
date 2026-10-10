# DTF

- `knockout_background` elige técnica según la prenda (`list_shirt_presets`). Negro tiende a `subtract`; rojos y claros, a `hard`. `contiguous=true` conserva el color de prenda encerrado por el dibujo (lineart). Déjalo en false para ojos de letras y agujeros.
- Un color plano sin lógica de prenda: `cutout_color` (corte seco) o `color_to_alpha` (suave).
- `white_underbase` crea la capa de tinta blanca debajo, encogida `choke` píxeles. `edge_choke` recorta el alfa del arte hacia dentro; `edge_spread` lo engorda.
- `clean_for_dtf` binariza el alfa. Úsalo para film con borde seco. Sáltalo si el arte tiene sombras suaves.
- `despill` es aproximado. Confírmalo con `get_bitmap`.
- `print_geometry` fija DPI y pulgadas. `export_dtf_png` solo etiqueta el DPI; no remuestrea. El orden es geometría y después export.
- `gang_sheet` empaqueta archivos en una hoja (ancho 22 pulgadas y 300 DPI si no dices otra cosa) y ya escribe el PNG.
- `halftone_separation` no es una separación de canales a registro.
