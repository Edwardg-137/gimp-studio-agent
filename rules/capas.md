# Capas

- `create_layer` inserta en la posición 0 (arriba) salvo que pases otra. `layer_from_file` carga un archivo como capa.
- No llames a `flatten` si el siguiente paso necesita alfa (DTF, PNG transparente). `merge_down` y `delete_layer` son destructivos: van detrás de `checkpoint`.
- `group_create` / `group_add` / `group_ungroup` para ordenar, no para “simplificar” antes de tiempo.
- `set_visible` en false no exporta esa capa en un merge de visibles. Compruébalo en `review` con `get_bitmap`.
- `duplicate_layer` antes de un efecto que no tenga vuelta atrás clara.
