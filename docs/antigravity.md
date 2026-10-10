# Antigravity

La extensión no adivina rutas. Las de abajo salen de la documentación oficial. Si una página no fija un path, no se usa.

## Rutas confirmadas

| Qué | Dónde (workspace) | Fuente |
| --- | --- | --- |
| Workflow legado | `.agents/workflows/<nombre>.md`, comando `/<nombre>` | [Migración de workflows a skills](https://antigravity.google/docs/migration/workflows-to-skills/). La página [Workflows](https://antigravity.google/docs/ide/workflows/) explica el comando `/workflow-name` y el panel, pero no el directorio. |
| Skill | `.agents/skills/<nombre>/SKILL.md`, comando `/<nombre>` | La misma guía de migración. |
| Rule | `.agents/rules/*.md` con frontmatter `trigger` | [Rules](https://antigravity.google/docs/rules/). También [Rules del IDE](https://www.antigravity.google/docs/ide/rules). |
| MCP | `.agents/mcp_config.json`, objeto `mcpServers` | [MCP](https://www.antigravity.google/docs/mcp/) y [MCP en el IDE](https://www.antigravity.google/docs/ide/mcp/). Global: `~/.gemini/config/mcp_config.json`. |

Los workflows actuales dejan de ejecutarse el **19 de octubre de 2026**. A partir de ese día el comando `/gimp` lo resuelve la skill, que tiene prioridad si conviven el workflow y la skill con el mismo nombre (la guía de migración lo dice así).

No usamos `~/.gemini/config/global_workflows/`: lo cita un artículo de terceros y la guía oficial de migración nombra `~/.gemini/config/workflows/` para lo global. Esta orden solo escribe en el workspace.

Un `.md` dentro de `.agents/rules/` sin `trigger` válido se descarta en silencio (`always_on`, `model_decision`, `glob` o `manual`). La rule que escribimos lleva `trigger: model_decision`. Las reglas de oficio van como `references/` de la skill `studio`, no sueltas en `.agents/rules/`.

## Qué escribe la orden

**GIMP Studio: Instalar agente en el workspace**, cuando `vscode.env.appName` contiene `Antigravity` (si no, pregunta):

- `.agents/skills/{studio,open,edit,dtf,review,export,gimp}/SKILL.md`
- `.agents/skills/studio/references/*.md` (copia de `rules/`)
- `.agents/workflows/gimp.md` (el texto de `studio`, comando `/gimp`)
- `.agents/rules/gimp-studio.md`
- `.agents/mcp_config.json` con `gimp` → `gimp-mcp` / `["serve"]`, fusionado

Si `vscode.chat` existe, `@gimp` también está disponible. Si no existe, la activación no se rompe: el camino es `/gimp`.

## Probar

1. [install.md](install.md): `pipx install twelvetake-gimp-studio-mcp` (o `pip install --user`), `gimp-mcp install-plugin`, reinicia GIMP, `gimp-mcp doctor`.
2. Instala el `.vsix` en Antigravity.
3. Abre una carpeta. Paleta: **GIMP Studio: Instalar agente en el workspace**.
4. Comprueba que existen `.agents/mcp_config.json`, `.agents/workflows/gimp.md` y `.agents/skills/gimp/SKILL.md`, y que otras claves de `mcpServers` siguen ahí.
5. En el agente: `/gimp` y un brief corto (abrir una imagen, un ajuste, exportar PNG). El flujo tiene que pasar por revisión (`get_bitmap`) y por exportación.
6. **GIMP Studio: Doctor**. Si falta `gimp-mcp`, el botón **Instalar** abre la terminal; no instala solo.

TODO verificable: el nombre exacto que Antigravity pone en `vscode.env.appName`. Si no contiene `antigravity`, la orden muestra un selector. Confírmalo en Help → About.
