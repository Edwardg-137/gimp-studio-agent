# Composición

No hay herramienta de recorte, rotación, escala del lienzo ni de sanar o clonar. `trim_to_content` recorta al cuadro del alfa: un JPEG opaco no se recorta así. `get_bitmap` puede recortar una copia de vista, no el documento. `print_geometry` escala a pulgadas de impresión, no a un ancho de red. `gang_sheet` puede girar una pieza 90° al empaquetar; no sustituye un giro del encargo.

Esos gestos son los fragmentos `crop`, `straighten`, `scale`, `canvas`, `perspective`, `rotate90` y `flip` de `rules/gimp-exec-snippets.md`. `checkpoint` antes. Una sola interpolación: varias rotaciones ablandan. NoHalo al reducir.

## Encargos

- Red social. Pregunta la proporción si no viene. Partida de feed: 4:5. Stories: 9:16. Recorta con el sujeto cerca de un tercio (ancho/3 o 2·ancho/3, lo mismo en alto, cerca de un 5 %). Luego escala. Instagram pide del orden de 1080 px de ancho; la nitidez de después es la otra skill.
- Horizonte. Dos `color_at` en el borde cielo/tierra, izquierda y derecha. Si la y no coincide, pasa el ángulo a `straighten` y recorta las esquinas vacías. Una sola rotación. Esquinas con alfa 255 si el brief no pide transparencia.
- Fachada o papel: `perspective` con las cuatro esquinas del cuadro original, luego recorta el vacío. Si el edificio queda achatado, dilo; no reescales en bucle.
- Producto con margen transparente: `select_from_alpha` o `trim_to_content` después de limpiar polvo. Un margen opaco es `canvas`.
- Logo: `layer_from_file`, `scale` si pesa, `move_layer` con un margen cercano al 4 % del ancho, `set_opacity` 70 si es marca de agua. `drop_shadow` con opacidad 0,3 y blur 8, y mira que la capa no se salga.
- Quitar un objeto grande: `list_procedures` con filtro `heal`. El nombre `plug-in-heal-selection` no está verificado. Si Resynthesizer no está, dilo. Un defecto pequeño puede seguir el camino de piel (selección y blur), no un clonado inventado.
- Giro de 90° o volteo: `rotate90` o `flip`. El texto y los rasgos quedan al revés.

Después de cada transformación: `get_bitmap` y `get_metadata`. Redes, ancho de al menos 1080. Impresión, pulgadas por 300.

## Fuentes

- Instagram, resolución de las fotos: https://www.facebook.com/help/instagram/1631821640426723 (consultado 2026-10-10).
- Cambridge in Colour, regla de los tercios: https://www.cambridgeincolour.com/tutorials/rule-of-thirds.htm (consultado 2026-10-10).
- Manual GIMP 3.0: crop, measure, rotate, perspective, transformaciones, tamaño de lienzo. https://docs.gimp.org/3.0/en/gimp-tool-crop.html y páginas hermanas. Consultado 2026-10-10.
- API: `Image.crop`, `Image.scale`, `Image.resize`, `Image.rotate`, `Image.flip`, `Item.transform_rotate`, `Item.transform_perspective`. https://developer.gimp.org/api/3.0/libgimp/method.Image.crop.html y métodos hermanos. Consultado 2026-10-10.
- Resynthesizer 3: https://github.com/bootchk/resynthesizer/wiki/Installing-Resynthesizer3-Plugins (consultado 2026-10-10). El nombre PDB no se ejecutó.
- gimp-studio-mcp: no hay herramientas crop/rotate/scale/heal/clone en `src/gimp_mcp/tools` (revisado 2026-10-10).
