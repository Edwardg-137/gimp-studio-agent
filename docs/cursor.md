# Cursor

Fuentes oficiales:

- MCP de proyecto: `.cursor/mcp.json`, objeto `mcpServers`. [Model Context Protocol](https://cursor.com/docs/mcp).
- Skills: `.cursor/skills/<nombre>/SKILL.md`. Se invocan con `/<nombre>` en el agente. [Agent Skills](https://cursor.com/docs/skills). Cursor también lee `.agents/skills/`; esta extensión escribe la ruta `.cursor/skills/` para no mezclar con Antigravity.
- Rules: `.cursor/rules/*.mdc` con frontmatter. [Rules](https://cursor.com/docs/rules).

## Qué escribe la orden

Si `vscode.env.appName` contiene `Cursor`, **GIMP Studio: Instalar agente en el workspace** fusiona el MCP y copia las skills:

- `.cursor/mcp.json` — entrada `gimp` con `command` `gimp-mcp` y `args` `["serve"]`. Otras entradas se conservan. Si `gimp` ya tenía `env`, se mantiene.
- `.cursor/skills/gimp/SKILL.md` — comando `/gimp` (mismo cuerpo que `studio`).
- `.cursor/skills/{studio,open,edit,color,piel,seleccion,nitidez,composicion,dtf,review,export}/SKILL.md`
- `.cursor/skills/studio/references/` — copia de `rules/`
- `.cursor/rules/gimp-studio.mdc` — `alwaysApply: false` y una descripción para que el agente la tome cuando el pedido es de imagen.

`vscode.chat` en Cursor puede no existir. La extensión lo comprueba y no falla al activarse. El camino previsto es `/gimp` en la caja de agente, con el MCP `gimp` ya fusionado.

## Probar

1. Completa [install.md](install.md) y `gimp-mcp doctor`.
2. Instala el `.vsix` en Cursor y abre una carpeta.
3. Paleta: **GIMP Studio: Instalar agente en el workspace**.
4. Abre `.cursor/mcp.json` y confirma el servidor `gimp` junto a los que ya hubiera.
5. En el agente, `/gimp` y un brief de una etapa (por ejemplo revisar el documento abierto). Las herramientas que debe pedir son las del MCP (`get_bitmap`, `open_image`, `export_image`, …), no un script `gimp_exec` de primeras.
6. **GIMP Studio: Doctor**.

TODO verificable: el `appName` real de Cursor. Si no contiene `cursor`, elige Cursor en el selector de la orden.
