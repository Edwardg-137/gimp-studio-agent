# gimp-studio-agent

Capa de agente, versión 0.1, encima de [gimp-studio-mcp](https://github.com/TwelveTake-Studios/gimp-studio-mcp) (`twelvetake-gimp-studio-mcp`, comando `gimp-mcp`). No es un fork: no reimplementa las herramientas del MCP.

Es una extensión de VS Code (y de forks que carguen extensiones). En VS Code el agente es el participante `@gimp`. En Antigravity y Cursor, la orden **GIMP Studio: Instalar agente en el workspace** deja las skills para invocarlas con `/gimp`.

El diseño está en [CONTEXTO.md](CONTEXTO.md). Instalación del MCP: [docs/install.md](docs/install.md).

| Cliente | Guía |
| --- | --- |
| VS Code | [docs/vscode.md](docs/vscode.md) |
| Antigravity | [docs/antigravity.md](docs/antigravity.md) |
| Cursor | [docs/cursor.md](docs/cursor.md) |

Skills en `skills/` (`studio` orquesta y no salta `review` ni `export`). Oficio en `rules/`. Plantilla MCP: [mcp.example.json](mcp.example.json).

Licencia MIT. El servidor base es de TwelveTake Studios LLC, también MIT.
