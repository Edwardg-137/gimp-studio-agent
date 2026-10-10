import * as fs from "node:fs";
import * as path from "node:path";
import { execFile } from "node:child_process";
import * as vscode from "vscode";
import * as os from "node:os";
import {
  BUNDLED_SKILLS,
  buildInstructions,
  detectIde,
  hostCapabilities,
  isGimpMcpTool,
  planConfirmedMcpWrite,
  planWorkspaceInstall,
  readDoctor,
  shellInstall,
  skillsForTurn,
  type IdeKind,
} from "./logic";

const MCP_PROVIDER_ID = "gimp-studio";
const MAX_TOOL_ROUNDS = 6;

export function activate(context: vscode.ExtensionContext): void {
  const caps = hostCapabilities({
    chatCreate: vscode.chat?.createChatParticipant,
    mcpRegister: vscode.lm?.registerMcpServerDefinitionProvider,
    selectModels: vscode.lm?.selectChatModels,
  });

  if (caps.mcpProvider && vscode.McpStdioServerDefinition) {
    context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider(MCP_PROVIDER_ID, {
      provideMcpServerDefinitions() {
        return [gimpServerDefinition()];
      },
    }));
  } else if (detectIde(vscode.env.appName) === "vscode") {
    // Sin la API de proveedor: el registro de VS Code es `.vscode/mcp.json`.
    void writeWorkspaceMcp("vscode").catch((err: unknown) => {
      console.error("gimp-studio: no pude escribir .vscode/mcp.json", err);
    });
  }

  if (caps.chat) {
    const participant = vscode.chat.createChatParticipant("gimp-studio-agent.gimp", (request, chatContext, stream, token) => {
      return handleChat(context, request, chatContext, stream, token);
    });
    participant.iconPath = new vscode.ThemeIcon("symbol-color");
    context.subscriptions.push(participant);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("gimp-studio.doctor", () => presentDoctor(true)),
    vscode.commands.registerCommand("gimp-studio.installAgent", () => installAgent(context, caps.mcpProvider)),
  );

  void presentDoctor(false);
}

function gimpServerDefinition(): vscode.McpStdioServerDefinition {
  const Ctor = vscode.McpStdioServerDefinition;
  // @types/vscode 1.101: (label, command, args). La guía web a veces muestra un objeto
  // (https://code.visualstudio.com/api/extension-guides/ai/mcp). `length` distingue ambos.
  if (Ctor.length <= 1) {
    return new (Ctor as unknown as new (opts: object) => vscode.McpStdioServerDefinition)({
      label: "gimp",
      command: "gimp-mcp",
      args: ["serve"],
    });
  }
  return new Ctor("gimp", "gimp-mcp", ["serve"]);
}

async function handleChat(
  context: vscode.ExtensionContext,
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
): Promise<vscode.ChatResult | void> {
  try {
    const names = skillsForTurn(request.command, request.prompt);
    if (names[0] === "doctor") {
      const report = await collectDoctor();
      stream.markdown(report.markdown);
      await offerInstall(report);
      return;
    }
    const body = names.map((name) => readBundledSkill(context, name)).join("\n\n");
    if (!request.model || typeof request.model.sendRequest !== "function") {
      stream.markdown("Este chat no trae un modelo de lenguaje. Ejecuta **GIMP Studio: Instalar agente en el workspace** e invoca `/gimp` en la caja de agente del IDE.");
      return;
    }
    await runModel(request, chatContext, stream, token, buildInstructions(body));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    stream.markdown(`No pude completar el turno: ${message}`);
    return { errorDetails: { message } };
  }
}

async function runModel(
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  instructions: string,
): Promise<void> {
  const tools = (vscode.lm?.tools ?? [])
    .filter((tool) => isGimpMcpTool(tool.name))
    .map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema }));
  if (!tools.length) {
    stream.markdown("No veo herramientas del MCP `gimp` en este turno. Si el servidor acaba de registrarse, reintenta; en el selector de herramientas debe aparecer **gimp**.\n\n");
  }
  const history = historyText(chatContext.history);
  const messages: vscode.LanguageModelChatMessage[] = [
    vscode.LanguageModelChatMessage.User(`${instructions}\n\nHistorial reciente:\n${history}\n\nPedido:\n${request.prompt}`),
  ];
  const TextPart = vscode.LanguageModelTextPart;
  const CallPart = vscode.LanguageModelToolCallPart;
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (token.isCancellationRequested) return;
    const response = await request.model.sendRequest(messages, {
      justification: "El participante @gimp sigue las skills de GIMP Studio y llama al MCP gimp.",
      tools: tools.length ? tools : undefined,
    }, token);
    const textParts: vscode.LanguageModelTextPart[] = [];
    const calls: vscode.LanguageModelToolCallPart[] = [];
    for await (const chunk of response.stream) {
      if (TextPart && chunk instanceof TextPart) {
        stream.markdown(chunk.value);
        textParts.push(chunk);
      } else if (CallPart && chunk instanceof CallPart) {
        calls.push(chunk);
      }
    }
    if (!calls.length || !vscode.lm?.invokeTool) return;
    messages.push(vscode.LanguageModelChatMessage.Assistant([...textParts, ...calls]));
    const results: vscode.LanguageModelToolResultPart[] = [];
    for (const call of calls) {
      let content: vscode.LanguageModelToolResult["content"];
      try {
        const result = await vscode.lm.invokeTool(call.name, {
          input: call.input,
          toolInvocationToken: request.toolInvocationToken,
        }, token);
        content = result.content;
      } catch (err) {
        content = [new vscode.LanguageModelTextPart(err instanceof Error ? err.message : String(err))];
      }
      results.push(new vscode.LanguageModelToolResultPart(call.callId, content));
    }
    messages.push(vscode.LanguageModelChatMessage.User(results));
  }
  stream.markdown("\n\nLlegué al tope de rondas de herramientas. Sigue el pedido en otro mensaje.\n");
}

function historyText(history: readonly (vscode.ChatRequestTurn | vscode.ChatResponseTurn)[]): string {
  const lines: string[] = [];
  for (const turn of history.slice(-6)) {
    if ("prompt" in turn && typeof turn.prompt === "string") lines.push(`Usuario: ${turn.prompt}`);
    else if ("response" in turn) {
      const text = turn.response
        .map((part) => ("value" in part && typeof part.value === "string" ? part.value : ""))
        .join("");
      if (text) lines.push(`Agente: ${text.slice(0, 800)}`);
    }
  }
  return lines.join("\n") || "(vacío)";
}

function readBundledRules(context: vscode.ExtensionContext): Record<string, string> {
  const dir = path.join(context.extensionPath, "rules");
  const out: Record<string, string> = {};
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith(".md")) out[name] = fs.readFileSync(path.join(dir, name), "utf8");
  }
  return out;
}

function readBundledSkill(context: vscode.ExtensionContext, name: string): string {
  const file = path.join(context.extensionPath, "skills", name, "SKILL.md");
  if (!fs.existsSync(file)) throw new Error(`No está la skill ${name} en la extensión.`);
  return fs.readFileSync(file, "utf8");
}

interface DoctorReport {
  markdown: string;
  missingBinary: boolean;
  bridgeNotInstalled: boolean;
  bridgeBroken: boolean;
  hasPipx: boolean;
}

async function collectDoctor(): Promise<DoctorReport> {
  const hasPipx = await commandExists("pipx");
  const probe = await run("gimp-mcp", ["doctor"]);
  if (probe.missing) {
    return {
      markdown: "No está `gimp-mcp` en el PATH. Hace falta el paquete `twelvetake-gimp-studio-mcp`.",
      missingBinary: true,
      bridgeNotInstalled: false,
      bridgeBroken: false,
      hasPipx,
    };
  }
  const output = `${probe.stdout}\n${probe.stderr}`.trim();
  const reading = readDoctor(output, probe.code);
  const lines = [
    "```",
    output || "(sin salida)",
    "```",
    "",
  ];
  if (reading.bridgeNotInstalled) {
    lines.push("Falta el puente dentro de GIMP. Tras instalarlo, reinicia GIMP.");
  } else if (reading.bridgeBroken) {
    lines.push("El puente está instalado pero no responde, o GIMP lo ignora. Reinstálalo y reinicia GIMP.");
  } else if (reading.gimpNotRunning && !reading.problemsFound) {
    lines.push("El puente está instalado. No hay GIMP en marcha (modo live); el servidor puede arrancar GIMP headless.");
  } else if (!reading.problemsFound) {
    lines.push("Doctor en orden.");
  }
  return {
    markdown: lines.join("\n"),
    missingBinary: false,
    bridgeNotInstalled: reading.bridgeNotInstalled,
    bridgeBroken: reading.bridgeBroken,
    hasPipx,
  };
}

async function presentDoctor(always: boolean): Promise<void> {
  try {
    const report = await collectDoctor();
    const channel = vscode.window.createOutputChannel("GIMP Studio");
    channel.appendLine(report.markdown.replace(/```/g, ""));
    if (always) {
      channel.show(true);
      vscode.window.showInformationMessage("GIMP Studio: doctor terminado. La salida está en el canal GIMP Studio.");
    }
    await offerInstall(report);
  } catch (err) {
    console.error("gimp-studio doctor", err);
  }
}

async function offerInstall(report: DoctorReport): Promise<void> {
  if (report.missingBinary) {
    const choice = await vscode.window.showWarningMessage(
      "No está gimp-mcp en el PATH. Instala twelvetake-gimp-studio-mcp (no se instala nada hasta que pulses Instalar).",
      "Instalar",
    );
    if (choice === "Instalar") openInstallTerminal(shellInstall(report.hasPipx, false));
    return;
  }
  if (report.bridgeNotInstalled || report.bridgeBroken) {
    const choice = await vscode.window.showWarningMessage(
      report.bridgeNotInstalled
        ? "Falta el puente de GIMP. gimp-mcp doctor lo reporta como NOT INSTALLED. Reinicia GIMP después de instalarlo."
        : "El puente de GIMP no responde o no es ejecutable. Revisa la salida de gimp-mcp doctor y reinicia GIMP.",
      "Instalar",
    );
    if (choice === "Instalar") openInstallTerminal(shellInstall(report.hasPipx, true));
  }
}

function openInstallTerminal(command: string): void {
  const term = vscode.window.createTerminal({ name: "GIMP Studio" });
  term.show();
  term.sendText(command);
  term.sendText("echo 'Reinicia GIMP para cargar el puente.'");
}

function commandExists(cmd: string): Promise<boolean> {
  return run(cmd, ["--version"]).then((res) => !res.missing);
}

function run(cmd: string, args: string[]): Promise<{ code: number | null; stdout: string; stderr: string; missing: boolean }> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: 20000, maxBuffer: 1_000_000 }, (error, stdout, stderr) => {
      const err = error as NodeJS.ErrnoException | null;
      resolve({
        missing: err?.code === "ENOENT",
        code: err ? (typeof err.code === "number" ? err.code : 1) : 0,
        stdout: stdout ?? "",
        stderr: stderr ?? "",
      });
    });
  });
}

async function installAgent(context: vscode.ExtensionContext, mcpApi: boolean): Promise<void> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    vscode.window.showErrorMessage("Abre una carpeta para instalar el agente GIMP Studio.");
    return;
  }
  let ide = detectIde(vscode.env.appName);
  if (ide === "unknown") {
    const pick = await vscode.window.showQuickPick(
      [
        { label: "Antigravity", id: "antigravity" as const },
        { label: "Cursor", id: "cursor" as const },
        { label: "VS Code", id: "vscode" as const },
      ],
      { placeHolder: `No reconozco «${vscode.env.appName}». Elige el IDE (Help → About para comprobar el nombre).` },
    );
    if (!pick) return;
    ide = pick.id;
  }
  if (ide === "vscode" && mcpApi) {
    vscode.window.showInformationMessage("En este VS Code el agente es @gimp en el chat. El MCP gimp lo registra la extensión.");
    return;
  }
  const skills: Record<string, string> = {};
  for (const name of BUNDLED_SKILLS) skills[name] = readBundledSkill(context, name);
  const rules = readBundledRules(context);
  const mcpRaw = ide === "antigravity" ? "" : readIfExists(path.join(folder.uri.fsPath, mcpRelative(ide)));
  let planned;
  try {
    planned = planWorkspaceInstall({
      ide,
      skills,
      mcpRaw,
      writeMcp: ide !== "antigravity",
      rules,
    });
  } catch (err) {
    vscode.window.showErrorMessage(err instanceof Error ? err.message : String(err));
    return;
  }
  for (const file of planned) {
    const target = path.join(folder.uri.fsPath, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.contents);
  }
  if (ide === "antigravity") await confirmAntigravityMcp(folder.uri.fsPath);
  const how = ide === "antigravity" || ide === "cursor" ? " Invócalo con /gimp en la caja de agente." : "";
  vscode.window.showInformationMessage(`GIMP Studio escribió ${planned.length} archivos en el workspace.${how}`);
}

function readIfExists(file: string): string {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

async function confirmAntigravityMcp(workspaceFs: string): Promise<void> {
  const pick = await vscode.window.showQuickPick(
    [
      { label: "Workspace", description: ".agents/mcp_config.json", target: "workspace" as const },
      { label: "Global", description: "~/.gemini/config/mcp_config.json", target: "global" as const },
      { label: "No fusionar", description: "El plugin ya declara el servidor gimp", target: "skip" as const },
    ],
    { placeHolder: "Antigravity no tiene API de MCP. ¿Fusionar gimp en un mcp_config.json?" },
  );
  if (!pick || pick.target === "skip") return;
  const configPath = pick.target === "global"
    ? path.join(os.homedir(), ".gemini", "config", "mcp_config.json")
    : path.join(workspaceFs, ".agents", "mcp_config.json");
  const exists = fs.existsSync(configPath);
  const raw = exists ? fs.readFileSync(configPath, "utf8") : "";
  let plan;
  try {
    plan = planConfirmedMcpWrite({
      configPath,
      raw,
      exists,
      shape: "mcpServers",
      stamp: new Date().toISOString().replace(/[:.]/g, ""),
    });
  } catch (err) {
    vscode.window.showErrorMessage(err instanceof Error ? err.message : String(err));
    return;
  }
  if (!plan.changed) {
    vscode.window.showInformationMessage("La entrada gimp ya está en ese archivo. No se ha modificado.");
    return;
  }
  const choice = await vscode.window.showWarningMessage(
    `¿Fusionar el servidor gimp en ${configPath}?`,
    { modal: true, detail: plan.summary },
    "Fusionar",
  );
  if (choice !== "Fusionar") return;
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  if (plan.backupPath && exists) fs.copyFileSync(configPath, plan.backupPath);
  fs.writeFileSync(configPath, plan.next);
}

function mcpRelative(ide: IdeKind): string {
  if (ide === "antigravity") return ".agents/mcp_config.json";
  if (ide === "cursor") return ".cursor/mcp.json";
  return ".vscode/mcp.json";
}

async function writeWorkspaceMcp(ide: IdeKind): Promise<void> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) return;
  const rel = mcpRelative(ide);
  const abs = path.join(folder.uri.fsPath, rel);
  const raw = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
  const next = planWorkspaceInstall({ ide, skills: {}, mcpRaw: raw, writeMcp: true });
  for (const file of next) {
    const target = path.join(folder.uri.fsPath, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.contents);
  }
}

export function deactivate(): void { }
