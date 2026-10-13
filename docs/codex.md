# Codex

Fuentes oficiales (consultadas el 13-10-2026):

- MCP: [Model Context Protocol](https://developers.openai.com/codex/mcp).
- Skills: [Agent Skills](https://developers.openai.com/codex/skills).
- AGENTS.md: [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md).

## Instalación

Hace falta GIMP 3 y el servidor `gimp-mcp`, igual que en [install.md](install.md):

```bash
pip install twelvetake-gimp-studio-mcp
gimp-mcp install-plugin
gimp-mcp doctor
```

Reinicia GIMP después de `install-plugin`.

## MCP

```bash
codex mcp add gimp -- gimp-mcp serve
```

Escribe esto en `~/.codex/config.toml`. También puedes pegarlo a mano allí o en `.codex/config.toml` del proyecto (solo se lee en proyectos de confianza):

```toml
[mcp_servers.gimp]
command = "gimp-mcp"
args = ["serve"]
# startup_timeout_sec = 30   # por defecto 10; súbelo si GIMP tarda en arrancar
```

Variables como `GIMP_MCP_HEADLESS=1` van con `--env` en `codex mcp add` o en una tabla `env` dentro de `[mcp_servers.gimp]`.

## Skills

Codex lee `.agents/skills` desde el directorio de trabajo hasta la raíz del repo. Aquí `.agents/skills` es un enlace simbólico a `skills/`: las 11 skills existen una sola vez. Cada `SKILL.md` trae `name` y `description` en el frontmatter.

Abre `codex` en un clon de este repo. Para otro proyecto, copia o enlaza `skills/*` en su `.agents/skills/` o en `~/.agents/skills/`. La orden **GIMP Studio: Instalar agente en el workspace** de la extensión también escribe `.agents/skills/`. No la ejecutes dentro de este repo: escribiría a través del enlace en `skills/`.

`AGENTS.md` de la raíz se carga solo. Ocupa unos 4,6 KiB; el límite por defecto (`project_doc_max_bytes`) es 32 KiB.

## Invocar

En el TUI, `/skills` o `$` abre la lista. Como la raíz también tiene `.claude-plugin/plugin.json`, Codex 0.162 las muestra con prefijo: `$gimp-studio:studio`, `$gimp-studio:dtf`… Si en tu versión salen sin prefijo, usa `$studio`. Escribe el brief detrás. Codex también elige una skill solo, por su `description`.

## Comprobar

1. `gimp-mcp doctor`: `bridge : INSTALLED` y, con GIMP abierto, `live bridge : REACHABLE`.
2. `codex mcp list`: fila `gimp  gimp-mcp  serve … enabled`.
3. En el TUI, `/mcp` lista `gimp` y sus herramientas; `/skills` lista `studio`, `open`, `edit`, `color`, `piel`, `seleccion`, `nitidez`, `composicion`, `dtf`, `review`, `export`.
4. Sin sesión: `codex debug prompt-input hola` en la raíz imprime el prompt; debe incluir las skills (raíz `…/skills`) y el texto de `AGENTS.md`.
5. Pide «revisa la imagen abierta»: debe llamar `get_bitmap`, no `gimp_exec`.
