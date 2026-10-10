# Exportación

Exporta una copia. No aplanes la imagen de trabajo para “sacar el archivo”. `checkpoint` antes. No escribas encima del original.

## Qué hace cada herramienta

- `export_image(path, image, flatten)`. El formato sale de la extensión. Conserva el alfa en png, tiff, webp, tga y gif. Lo aplana en jpg y bmp. `flatten=true` fuerza opaco; `flatten=false` fuerza conservar alfa en un formato que pueda. Lee `saved`, `flattened`, `alpha`, `had_alpha` y `warning`. Si el brief pedía transparencia y `alpha` es false, no entregues ese archivo. No hay argumento de calidad JPEG ni de submuestreo: salen los valores del complemento. Para fijarlos, el fragmento `jpeg`. Si `gimp_exec` no está, entrega con `export_image` y di que la calidad no es la pedida.
- DTF: `export_dtf_png` después de `print_geometry`. El `dpi` de esa exportación solo etiqueta. No uses JPG ni `flatten` para una película.
- Impresión. Pregunta sRGB o CMYK si no vino en el brief. `convert_profile` solo con una ruta `.icc`. `soft_proof` no está implementado. TIFF o JPEG según pidan. Cambiar los ppi no añade píxeles: eso es `print_geometry` o el fragmento `scale`.
- Pantalla, si aún no se escaló: fragmento `scale` con NoHalo al ancho pedido, y la nitidez corta (std_dev 0,25, scale 2) antes de este export. Instagram, del orden de 1080 px de ancho. No reexportes un JPEG ya comprimido una y otra vez.
- Partida de calidad en el fragmento JPEG: 0,9. Web 0,80–0,88. Entrega 0,90–0,95. Esos números son de partida; los nombres de las propiedades del procedimiento hay que leerlos antes de fijarlos (el fragmento lo hace).

## Comprobar el archivo

`open_image` de la ruta escrita, `get_metadata` sobre el id nuevo, `get_profile` si el brief hablaba de perfil, `get_bitmap`. `get_metadata` no inspecciona un archivo en disco sin abrirlo. Esquinas: `color_at` con alfa 0 si pedían transparencia, o sin alfa si es un JPEG opaco. Pulgadas DTF = píxeles / dpi del archivo reabierto.

Resume ruta, formato, si se conservó el alfa, DPI o píxeles, y el id del checkpoint.

## Fuentes

- Manual GIMP 3.0: exportar, JPEG, PNG, WebP, TIFF, tamaño de impresión frente a escala, NoHalo/LoHalo, convertir perfil. https://docs.gimp.org/3.0/en/gimp-export-dialog.html , `file-jpeg-export.html`, `gimp-image-print-size.html`, `gimp-image-scale.html`, `gimp-tools-transform.html`, `gimp-image-color-profile-convert.html`. Consultado 2026-10-10. La página de exportar PDF de ese manual devolvió 404 ese día.
- Instagram: https://www.facebook.com/help/instagram/1631821640426723 (consultado 2026-10-10).
- Cambridge in Colour, sRGB y redimensionado: https://www.cambridgeincolour.com/tutorials/sRGB-AdobeRGB1998.htm y `image-resize-for-web.htm`. Consultado 2026-10-10.
- gimp-studio-mcp `tools/document.py` (`export_image` sin calidad) y `tools/color_mgmt.py` (`soft_proof` siempre falla). Revisado el 2026-10-10.
