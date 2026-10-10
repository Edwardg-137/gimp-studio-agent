# Retoque de piel

Conserva poros. Si el lunar puede ser un rasgo, pregunta antes de quitarlo. El orden con el resto del flujo: color global, esta etapa, nitidez de ojos, revisión.

Duplica la base, renómbrala y oculta el original. `checkpoint` antes del primer filtro. Mira la mejilla con `get_bitmap` y `region` a tamaño real: los poros tienen que verse al empezar y al terminar.

## Frecuencias

Dos copias, “Baja” y “Alta”. En Baja, `gaussian_blur`. Radios de partida, no una medida de laboratorio (la tabla pública de radios es de una página solo en parte fiable): 2–4 px en imagen pequeña, 4–6 en piel joven y archivo grande, 6–8 en retrato medio, 8–12 si la textura es gruesa. Sube el radio solo hasta que los poros desaparezcan y la forma de la cara siga.

En Alta, `set_blend_mode` `GRAIN_EXTRACT`. Tiene que verse gris con relieve. El tono se iguala en Baja. No difumines la textura para “emparejar”.

No hay herramienta “nueva desde visible”. Si hace falta fundir lo que se ve, el fragmento `new_from_visible`. Comprueba con `color_at` en tres puntos que Baja más textura se acerca al original (1 o 2 cuentas de diferencia es la tolerancia de partida). Si no reconstruye, no edites todavía.

## Defectos, volumen, ojos, dientes

- Granos sueltos: no hay Heal ni Clone. `select_ellipse`, `select_feather` 2–4, `gaussian_blur` suave solo en esa zona de la capa Baja, `select_none`. Un defecto con borde de pelo no sale bien así: fragmento `heal`, y si no basta, el usuario en el lienzo.
- Volumen: capa nueva, `set_fg` `#808080`, `fill` `foreground`, `SOFTLIGHT`, `set_paint_opacity` 8. Blanco en pómulo, puente y frente; negro bajo el pómulo. El volumen se intuye. Si la cara no cambia, el modo cayó a Normal.
- Ojos rojos: elipse de la pupila, feather 1–2, `apply_filter` `gegl:red-eye-removal` con `threshold` 0,4. Si se come otro rojo, la selección sobraba: `restore`.
- Dientes: feather 1–3, `hue_saturation` `range` `yellow`, saturación −40 (entre −30 y −60), luminosidad 10 (entre 5 y 15). Marfil, no 255,255,255. R un poco por encima de B.
- Iris: saturación 10–20. La nitidez del iris es la skill de nitidez.
- Brillo graso: capa `DARKEN_ONLY`, opacidad de pintura 25, color muestreado al lado del brillo con `color_at`.

## Fuentes

- Manual GIMP 3.0: Heal, Clone, Dodge/Burn, wavelet, gaussiano selectivo, red-eye, modos de inversión, capa gris medio. https://docs.gimp.org/3.0/en/gimp-tool-heal.html y páginas hermanas (`gimp-tool-clone`, `gimp-tool-dodge-burn`, `plug-in-wavelet-decompose`, `gimp-filter-gaussian-blur-selective`, `gimp-filter-red-eye-removal`, `layer-mode-group-inversion`, `gimp-layer-new`). Consultado 2026-10-10.
- Radios de partida: https://gimp.cc/frequency-separation.html (página parcialmente poco fiable; solo como punto de salida). Consultado 2026-10-10.
- GEGL: `gegl-gaussian-blur`, `gegl-red-eye-removal`. https://gegl.org/operations/ . Consultado 2026-10-10.
- API: `Gimp.Layer.new_from_visible`, `Gimp.heal`. https://developer.gimp.org/api/3.0/libgimp/ctor.Layer.new_from_visible.html y `func.heal.html`. Consultado 2026-10-10.
- gimp-studio-mcp no registra heal, clone ni new-from-visible (lista de herramientas en `src/gimp_mcp/tools`, revisada el 2026-10-10).
