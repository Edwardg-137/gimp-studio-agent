# Instalar el MCP

La extensión no instala nada hasta que pulses **Instalar**. Estos pasos se pueden seguir a mano.

## 1. Servidor

Hace falta Python 3.10+ y GIMP 3.x.

Si `pipx` está en el PATH:

```bash
pipx install twelvetake-gimp-studio-mcp
```

Si no hay `pipx`:

```bash
pip install --user twelvetake-gimp-studio-mcp
```

Comprueba que el comando existe:

```bash
command -v gimp-mcp
gimp-mcp version
```

## 2. Puente dentro de GIMP

El “plugin” del upstream es el puente en GIMP, no esta extensión.

```bash
gimp-mcp install-plugin
```

Reinicia GIMP. El puente arranca con GIMP y publica un endpoint en loopback.

## 3. Doctor

```bash
gimp-mcp doctor
```

Salida sana: una línea `bridge       : INSTALLED` y, con GIMP abierto, `live bridge  : REACHABLE`.

Si ves `bridge       : NOT INSTALLED`, el puente no está. Vuelve al paso 2 y reinicia GIMP.

`live bridge  : none` significa que no hay GIMP en marcha. No es lo mismo que un puente sin instalar: el servidor puede levantar GIMP headless.

`NOT executable` o `UNREACHABLE`: el puente está pero GIMP no lo usa o no responde. Repite `gimp-mcp install-plugin` y reinicia GIMP.

La extensión hace esta lectura al activarse y con **GIMP Studio: Doctor**.

## 4. Registrar el servidor

El cliente MCP debe arrancar:

```json
{
  "mcpServers": {
    "gimp": {
      "command": "gimp-mcp",
      "args": ["serve"]
    }
  }
}
```

Esa es la plantilla [mcp.example.json](../mcp.example.json). VS Code usa otro archivo, `.vscode/mcp.json`, con la clave `servers` y `"type": "stdio"`. Lo escriben la extensión (si el IDE no tiene la API de proveedores MCP) o la orden de instalar el agente. No borra otras entradas.

## Variables

| Variable | Efecto |
| --- | --- |
| `GIMP_MCP_HEADLESS=1` | No se engancha a un GIMP visible: arranca `gimp -i`. |
| `GIMP_MCP_NO_EXEC=1` | No registra `gimp_exec`. El resto de herramientas sigue. |
| `GIMP_MCP_DISABLED` | El puente dentro de GIMP no sirve. |
| `GIMP_MCP_ENDPOINT_FILE` | Ruta explícita del endpoint. |
| `GIMP_MCP_PORT` | Puerto fijo en vez de uno efímero. |

Detalle de amenazas: [SECURITY.md del MCP](https://github.com/TwelveTake-Studios/gimp-studio-mcp/blob/main/SECURITY.md).
