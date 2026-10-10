# Exportación

- `export_image` exporta una copia. Conserva el alfa en png, tiff, webp, tga y gif. Lo aplana en jpg y bmp. `flatten=true` fuerza opaco; `flatten=false` fuerza conservar alfa.
- DTF: `export_dtf_png`. No uses `flatten` ni `export_image` a JPG para una película.
- Lee `saved`, `flattened`, `alpha` y `warning` en la respuesta. Si el brief pedía transparencia y `alpha` es false, no entregues ese archivo.
- Comprueba el archivo reabriéndolo: `open_image` y `get_metadata` sobre el id nuevo. `get_metadata` no inspecciona un archivo en disco sin abrirlo.
- `get_bitmap` de la copia exportada cierra el review de entrega.
