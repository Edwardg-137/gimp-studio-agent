# Antigravity

La extensión no adivina rutas. Las de abajo salen de la documentación oficial, leída el 2026-10-10. Lo que esa documentación no fija se marca como no verificado y no se usa como si lo fuera.

## Rutas confirmadas

| Qué | Dónde | Fuente |
| --- | --- | --- |
| Skill | `.agents/skills/<nombre>/SKILL.md` en el workspace. Global: `~/.gemini/config/skills/<nombre>/SKILL.md`. Comando `/<nombre>`. | [Agent skills](https://antigravity.google/docs/skills/) y [migración de workflows](https://antigravity.google/docs/migration/workflows-to-skills/). |
| Plugin | `.agents/plugins/<nombre>/` (workspace) o `~/.gemini/config/plugins/<nombre>/`. Hace falta `plugin.json` (`name`, esquema `https://antigravity.google/schemas/v1/plugin.json`). Puede llevar `skills/`, `rules/`, `agents/`, `mcp_config.json`, `hooks.json`. | [Plugins](https://antigravity.google/docs/plugins/). |
| Rule | `.agents/rules/*.md` con `trigger`: `always_on`, `model_decision`, `glob` o `manual`. Sin un `trigger` válido se descarta en silencio. | [Rules](https://antigravity.google/docs/rules/) y [Rules del IDE](https://www.antigravity.google/docs/ide/rules). |
| MCP | Workspace `.agents/mcp_config.json`. Global `~/.gemini/config/mcp_config.json`. Objeto `mcpServers`. | [MCP](https://www.antigravity.google/docs/mcp/) y [MCP en el IDE](https://www.antigravity.google/docs/ide/mcp/). |

## Qué no usamos

Los workflows (`.agents/workflows/<nombre>.md`, comando `/<nombre>`) dejan de ejecutarse el **19 de octubre de 2026**. La guía de migración lo dice así: los workflows actuales dejan de funcionar ese día. Esta extensión no escribe `.agents/workflows/gimp.md`.

`@gimp` como participante de chat (`vscode.chat.createChatParticipant`) en el panel de Antigravity **no está verificado y es muy probable que no exista**. Ninguna página de antigravity.google documenta esa API. En el foro oficial, desde enero de 2026, autores de extensiones piden siquiera un comando para escribir en el chat del agente y no hay respuesta técnica ([hilo](https://discuss.ai.google.dev/t/antigravity-built-in-command-for-sending-a-query-via-a-chat-to-the-model/120211)). El camino es `/gimp`.

No hay API de extensión para registrar un MCP. Escribir el JSON es lo que hay. Si el panel recarga el archivo en caliente o hace falta reiniciar: **no verificado**. Un issue del CLI (no del IDE) dice que a veces ignoraba la config de proyecto ([antigravity-cli#60](https://github.com/google-antigravity/antigravity-cli/issues/60)).

## Qué escribe la orden

**GIMP Studio: Instalar agente en el workspace**, cuando `vscode.env.appName` contiene `Antigravity` (si no, pregunta):

- `.agents/skills/{studio,open,edit,color,piel,seleccion,nitidez,composicion,dtf,review,export,gimp}/SKILL.md`
- `.agents/skills/studio/references/*.md` (copia de `rules/`)
- `.agents/rules/gimp-studio.md` con `trigger: model_decision`
- `.agents/plugins/gimp-studio/` con `plugin.json`, su `mcp_config.json` (solo el servidor `gimp`), `rules/gimp-studio.md` y una copia de las skills, incluida `/gimp`

El `mcp_config.json` del plugin es un archivo nuevo, solo con `gimp`. No es la config del usuario.

La config del usuario no se toca en ese paso. Después la extensión pregunta:

1. Workspace (`.agents/mcp_config.json`)
2. Global (`~/.gemini/config/mcp_config.json`)
3. No fusionar (el plugin ya declara `gimp`; así se evita un servidor duplicado)

Si eliges fusionar, calcula el resultado, lo enseña en un aviso modal y **espera** el botón Fusionar. Si el archivo ya existe, copia antes a `mcp_config.json.bak-<marca de tiempo>` y luego escribe. Otras claves de `mcpServers` se conservan. Si `gimp` ya era `gimp-mcp` con `["serve"]`, no escribe. Un JSON que no es un objeto no se reescribe. Puedes cancelar y no pasa nada.

`/gimp` puede quedar dos veces: en `.agents/skills/gimp` y dentro del plugin. Las dos copias dicen lo mismo. Si el panel se lia, quédate con una.

## Probar

1. [install.md](install.md): `pipx install twelvetake-gimp-studio-mcp` (o `pip install --user`), `gimp-mcp install-plugin`, reinicia GIMP, `gimp-mcp doctor`.
2. Instala el `.vsix` en Antigravity.
3. Abre una carpeta. Paleta: **GIMP Studio: Instalar agente en el workspace**.
4. Comprueba `.agents/skills/gimp/SKILL.md`, `.agents/plugins/gimp-studio/plugin.json` y que **no** aparece `.agents/workflows/gimp.md`.
5. Si fusionas el MCP, el aviso tiene que mostrar el resumen y, si el archivo existía, dejar el `.bak-`. Otras claves siguen.
6. En el agente: `/gimp` y un brief corto. El flujo tiene que pasar por revisión (`get_bitmap`) y por exportación. Si el MCP no aparece, refresca o reinicia el panel (la recarga en caliente no está verificada).
7. **GIMP Studio: Doctor**. Si falta `gimp-mcp`, el botón **Instalar** abre la terminal; no instala solo.

TODO en un Antigravity real: el `appName` exacto (Help → About), que `/gimp` salga tras instalar, si hace falta reiniciar para el MCP, y que `@gimp` no aparezca. Nada de eso se ha corrido aquí.

## Fuentes

Consultadas el 2026-10-10:

- https://antigravity.google/docs/migration/workflows-to-skills/
- https://antigravity.google/docs/skills/
- https://antigravity.google/docs/plugins/
- https://antigravity.google/docs/rules/
- https://www.antigravity.google/docs/ide/rules
- https://www.antigravity.google/docs/mcp/
- https://www.antigravity.google/docs/ide/mcp/
- https://discuss.ai.google.dev/t/antigravity-built-in-command-for-sending-a-query-via-a-chat-to-the-model/120211
