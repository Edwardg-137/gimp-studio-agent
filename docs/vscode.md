# VS Code

El `engines.vscode` es `^1.101.0`, la versión en la que entra `vscode.lm.registerMcpServerDefinitionProvider` (`@types/vscode` 1.101). Guía: [MCP en extensiones](https://code.visualstudio.com/api/extension-guides/ai/mcp). El archivo de usuario está en [MCP configuration](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration): `.vscode/mcp.json`, clave `servers`, `type` `stdio`.

## Qué hace la extensión

1. Al activarse registra el servidor MCP `gimp` con `contributes.mcpServerDefinitionProviders` (`id` `gimp-studio`) y `vscode.lm.registerMcpServerDefinitionProvider`, si esa función existe.
2. Si no existe, fusiona el servidor en `.vscode/mcp.json` del workspace abierto. No borra otras entradas. Añade `"type": "stdio"` porque el esquema de VS Code lo pide.
3. Crea el participante de chat `@gimp` (`vscode.chat.createChatParticipant`) si `vscode.chat` existe. Subcomandos: `/editar`, `/dtf`, `/revisar`, `/exportar`, `/doctor`. Sin subcomando usa la skill `studio`.
4. El participante manda la skill como instrucciones a `vscode.lm` (`request.model.sendRequest`) y le pasa las herramientas del MCP cuyo nombre es el de gimp-studio-mcp o un nombre del host que contiene `gimp` y termina en esa herramienta.
5. **GIMP Studio: Doctor** y la activación ejecutan `gimp-mcp doctor`. Si falta el binario, la notificación tiene el botón **Instalar**.

## Probar

1. Instala el MCP como en [install.md](install.md) y reinicia GIMP.
2. Instala el `.vsix` (**Extensions: Install from VSIX…**) y recarga la ventana.
3. Abre el chat, elige `@gimp` y escribe un brief. Para un subcomando: `@gimp /revisar`.
4. En el selector de herramientas del chat debe aparecer el servidor `gimp`. Si el primer turno dice que no ve herramientas, reintenta: VS Code descubre el servidor al enviar un mensaje.
5. `@gimp /doctor` debe mostrar la salida de `gimp-mcp doctor`.
6. Paleta de comandos: **GIMP Studio: Doctor**.

El motor declarado es VS Code `^1.101.0`. Las APIs de chat y de MCP se comprueban en tiempo de ejecución; si faltan, la activación sigue y queda el comando de instalar el agente en el workspace.
