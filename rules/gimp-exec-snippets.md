# Fragmentos gimp_exec

Único uso permitido de `gimp_exec`. Copia uno de estos bloques, sustituye los números en mayúsculas y no añadas otra lógica. Si la herramienta no está registrada, `GIMP_MCP_NO_EXEC` la apagó: para y dilo.

Antes de cualquiera: `checkpoint`. El namespace ya tiene `Gimp`, `Gegl`, `Gio`, `pdb`, `find_image`, `find_drawable` y `compat`. Asigna `_result`. Estos fragmentos no se han ejecutado contra un GIMP en vivo en este repositorio. Las firmas citadas salen de la API 3.0 (consultada el 2026-10-10), no de una corrida.

`find_image(None)` es la imagen activa. `select_none` antes de `transform_*`: con una selección, GIMP gira solo el flotante.

## crop

`Image.crop(new_width, new_height, offx, offy)`. El recorte tiene que caber: ancho y alto mayores que 0 y no mayores que la imagen; `offx` entre 0 y `width - new_width`.

```python
img = find_image(None)
ok = img.crop(ANCHO, ALTO, OFF_X, OFF_Y)
_result = {"ok": bool(ok), "width": img.get_width(), "height": img.get_height()}
```

## straighten

Una sola rotación, en radianes, alrededor del centro de la capa. `TransformResize.ADJUST` agranda para no recortar esquinas. El sentido del ángulo se comprueba con `get_bitmap`, no se da por sabido.

```python
import math
img = find_image(None)
layer = find_drawable(None, None)
Gimp.context_set_interpolation(Gimp.InterpolationType.NOHALO)
Gimp.context_set_transform_resize(Gimp.TransformResize.ADJUST)
rotated = layer.transform_rotate(math.radians(GRADOS), True, 0.0, 0.0)
_result = {"layer": int(rotated.get_id()), "grados": GRADOS, "width": img.get_width(), "height": img.get_height()}
```

Después, `crop` de las esquinas vacías si el brief no pide transparencia.

## scale

`Image.scale` usa la interpolación del contexto. NoHalo al reducir. No encadena tres escalas.

```python
img = find_image(None)
Gimp.context_set_interpolation(Gimp.InterpolationType.NOHALO)
ok = img.scale(ANCHO, ALTO)
_result = {"ok": bool(ok), "width": img.get_width(), "height": img.get_height()}
```

## canvas

`Image.resize(new_width, new_height, offx, offy)`. `offx` y `offy` colocan el contenido viejo dentro del lienzo nuevo. No remuestrea.

```python
img = find_image(None)
ok = img.resize(ANCHO, ALTO, OFF_X, OFF_Y)
_result = {"ok": bool(ok), "width": img.get_width(), "height": img.get_height()}
```

## perspective

Las cuatro parejas son las nuevas posiciones de las esquinas del cuadro original, en este orden: arriba izquierda, arriba derecha, abajo izquierda, abajo derecha.

```python
img = find_image(None)
layer = find_drawable(None, None)
Gimp.context_set_interpolation(Gimp.InterpolationType.NOHALO)
Gimp.context_set_transform_resize(Gimp.TransformResize.ADJUST)
out = layer.transform_perspective(X0, Y0, X1, Y1, X2, Y2, X3, Y3)
_result = {"layer": int(out.get_id()), "width": img.get_width(), "height": img.get_height()}
```

## rotate90

`Image.rotate` con `Gimp.RotationType.DEGREES90`, `DEGREES180` o `DEGREES270`. La página del enum dice los grados, no si son horarios. Mira el bitmap.

```python
img = find_image(None)
ok = img.rotate(Gimp.RotationType.DEGREES90)
_result = {"ok": bool(ok), "width": img.get_width(), "height": img.get_height()}
```

## flip

`Image.flip` con `Gimp.OrientationType.HORIZONTAL` o `VERTICAL`. El texto y los rasgos quedan al revés.

```python
img = find_image(None)
ok = img.flip(Gimp.OrientationType.HORIZONTAL)
_result = {"ok": bool(ok), "width": img.get_width(), "height": img.get_height()}
```

## jpeg

`export_image` no acepta calidad. Este fragmento lista los argumentos de `file-jpeg-export` y solo escribe las propiedades que existen. No inventes `quality` si no está en la lista: devuelve los nombres y para. Partida, si el nombre existe: `quality` 0,9 (web 0,80–0,88, entrega 0,90–0,95) y `sub-sampling` `sub-sampling-1x1`. Esos nombres salen del código de GIMP en master y están marcados como no verificados en 3.0/3.2 hasta que `get_arguments()` los confirme.

```python
img = find_image(None)
proc = pdb.lookup_procedure("file-jpeg-export")
if proc is None:
    _result = {"ok": False, "error": "no está file-jpeg-export"}
else:
    names = [a.name for a in proc.get_arguments()]
    wanted = {"quality": 0.9, "sub-sampling": "sub-sampling-1x1", "progressive": True, "optimize": True}
    missing = [k for k in wanted if k not in names]
    if missing or "image" not in names or "file" not in names:
        _result = {"ok": False, "arguments": names, "missing": missing}
    else:
        cfg = proc.create_config()
        cfg.set_property("image", img)
        cfg.set_property("file", Gio.File.new_for_path("RUTA.jpg"))
        for k, v in wanted.items():
            cfg.set_property(k, v)
        res = proc.run(cfg)
        _result = {"ok": True, "path": "RUTA.jpg", "status": str(res.index(0)), "arguments": names}
```

Trabaja sobre la imagen activa. Si no quieres aplastar el máster, duplícala antes en la sesión y exporta la copia.

## new_from_visible

`Gimp.Layer.new_from_visible(origen, destino, nombre)` no inserta la capa. Hay que insertarla.

```python
img = find_image(None)
layer = Gimp.Layer.new_from_visible(img, img, "Visible")
img.insert_layer(layer, None, 0)
_result = {"layer": int(layer.get_id()), "name": layer.get_name()}
```

## heal

No hay herramienta Heal. La API 3.0 declara `gimp_heal(drawable, src_drawable, src_x, src_y, num_strokes, strokes)` con `strokes` como pares x,y. En el binding de Python la longitud a veces se omite: este fragmento prueba las dos formas. No está corrido en vivo. Coordenadas en píxeles de la capa. Si el defecto tiene borde fino, es mejor que lo haga el usuario en el lienzo.

```python
layer = find_drawable(None, None)
strokes = [DEST_X, DEST_Y]
try:
    ok = Gimp.heal(layer, layer, SRC_X, SRC_Y, strokes)
except TypeError:
    ok = Gimp.heal(layer, layer, SRC_X, SRC_Y, len(strokes), strokes)
_result = {"ok": bool(ok)}
```

## newsprint

Preferible: `describe_op` con `gegl:newsprint` y luego `apply_filter`. Este fragmento solo lista las propiedades, para no fijar un nombre de canal que no se ha comprobado. La partida orientativa (periodo cerca de 10, ángulo 22,5 o 45, antialias 1) está en `rules/dtf.md`. El periodo 10 a 300 DPI es una estimación (DPI / LPI), no una ficha de taller.

```python
Gegl.init(None)
props = []
for spec in Gegl.Operation.list_properties("gegl:newsprint"):
    props.append(spec.get_name())
_result = {"op": "gegl:newsprint", "properties": props}
```

Con esa lista, vuelve a `apply_filter`. No reescribas este fragmento para pintar el semitono a ciegas.

## Fuentes

- API 3.0: `Image.crop`, `Image.scale`, `Image.resize`, `Image.rotate`, `Image.flip`, `Item.transform_rotate`, `Item.transform_perspective`, `Layer.new_from_visible`, `Gimp.heal`, `TransformResize`. https://developer.gimp.org/api/3.0/libgimp/ (consultado 2026-10-10).
- Enum de rotación (90, 180, 270, sin sentido horario declarado): https://developer.gimp.org/api/3.0/libgimp/enum.RotationType.html .
- gimp-studio-mcp `tools/session.py` (`GIMP_MCP_NO_EXEC`, namespace, `_result`) y `tools/document.py` (`export_image` sin calidad). Revisado el 2026-10-10.
- Propiedades JPEG en el código de GIMP (master), no verificadas en 3.0/3.2 hasta `get_arguments()`: https://gitlab.gnome.org/GNOME/gimp/-/raw/master/plug-ins/file-jpeg/jpeg.c (consultado 2026-10-10).
