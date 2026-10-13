# Claude Code

Fuentes oficiales (consultadas el 13-10-2026):

- MCP y `.mcp.json`: [MCP](https://code.claude.com/docs/en/mcp).
- Skills: [Skills](https://code.claude.com/docs/en/skills).
- Plugins: [Plugins](https://code.claude.com/docs/en/plugins), [referencia](https://code.claude.com/docs/en/plugins-reference), [marketplaces](https://code.claude.com/docs/en/plugin-marketplaces), [descubrir e instalar](https://code.claude.com/docs/en/discover-plugins).

## Instalación

Hace falta GIMP 3 y el servidor `gimp-mcp`, igual que en [install.md](install.md):

```bash
pip install twelvetake-gimp-studio-mcp
gimp-mcp install-plugin
gimp-mcp doctor
```

Reinicia GIMP después de `install-plugin`. El `.vsix` no hace falta en Claude Code.

## Opción A: plugin

El repositorio es a la vez marketplace y plugin. `.claude-plugin/marketplace.json` lista el plugin `gimp-studio` con `"source": "."` (la raíz del repo). La raíz trae `skills/` (se carga por defecto) y `.mcp.json` (servidor `gimp`).

Dentro de una sesión:

```text
/plugin marketplace add Edwardg-137/gimp-studio-agent
/plugin install gimp-studio@gimp-studio-agent
```

O desde la terminal:

```bash
claude plugin marketplace add Edwardg-137/gimp-studio-agent
claude plugin install gimp-studio@gimp-studio-agent
```

El repo es privado: hace falta acceso a GitHub con `gh` o git ya autenticados.

Las skills del plugin llevan prefijo: `/gimp-studio:studio`, `/gimp-studio:dtf`, `/gimp-studio:review`… El servidor aparece como `plugin:gimp-studio:gimp`.

## Opción B: abrir este repositorio

Al clonar y lanzar `claude` en la raíz:

- `.mcp.json` declara `gimp` (`type` `stdio`, `command` `gimp-mcp`, `args` `["serve"]`). Claude Code pide confiar en la carpeta y aprobar el servidor la primera vez. Hasta entonces sale como `⏸ Pending approval`.
- `.claude/skills` es un enlace simbólico a `skills/`. Las skills salen sin prefijo: `/studio`, `/dtf`, `/review`…

Para registrar el servidor en otro proyecto sin el plugin:

```bash
claude mcp add --transport stdio --scope project gimp -- gimp-mcp serve
```

## Invocar

`/gimp-studio:studio` (o `/studio` en este repo) con el brief: «prepara el logo para una camiseta DTF». `studio` enruta a la skill de etapa y cierra con `review` y `export`. Claude también elige una skill solo, por su `description`.

## Comprobar

1. `gimp-mcp doctor`: `bridge : INSTALLED` y, con GIMP abierto, `live bridge : REACHABLE`.
2. `claude plugin list`: `gimp-studio@gimp-studio-agent` con `✔ enabled`.
3. `claude mcp list`: `plugin:gimp-studio:gimp: gimp-mcp serve - ✔ Connected`. En este repo, `claude mcp get gimp` muestra el servidor de proyecto.
4. En la sesión, `/mcp` lista `gimp` y sus herramientas. Pide «revisa la imagen abierta»: debe llamar `get_bitmap`, no `gimp_exec`.
5. `claude plugin validate .` en un clon del repo valida el manifiesto y el marketplace.
