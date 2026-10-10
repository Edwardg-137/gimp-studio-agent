# Color y tono

- `color_at` devuelve `rgba` en 0–255 sRGB. `histogram` con `space=perceptual` usa esa misma escala (media, mediana, mínimo, máximo).
- `levels` y `curves` piden 0.0–1.0 en luz lineal, no el 0–255 de `color_at`. Un pixel leído como 200 está cerca de 0.58 en `levels`.
- `threshold` usa 0.0–1.0 en la escala de `color_at` (divide entre 255).
- `brightness_contrast`: cada eje va de -1 a 1. `hue_saturation`: tono -180..180, luminosidad y saturación -100..100.
- `normalize` con `keep_colors=false` estira cada canal y puede teñir. `keep_colors=true` conserva el tono.
- Perfiles: `get_profile`, `assign_profile`, `convert_profile`. No conviertas de perfil a ciegas en un PNG de DTF.
