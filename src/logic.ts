/**
 * Lógica sin vscode: fusión MCP, lectura de `gimp-mcp doctor`, skills y rutas.
 *
 * Rutas de Antigravity confirmadas en la documentación oficial (no inventadas):
 * - Workflows de workspace: `.agents/workflows/<nombre>.md`
 *   Fuente: https://antigravity.google/docs/migration/workflows-to-skills/
 *   (la página https://antigravity.google/docs/ide/workflows/ no nombra el directorio).
 *   Esos workflows dejan de ejecutarse el 2026-10-19.
 * - Skills de workspace: `.agents/skills/<nombre>/SKILL.md`, comando `/<nombre>`.
 *   Misma guía de migración. Si coexisten, la skill gana al workflow.
 * - Rules de workspace: `.agents/rules/*.md` con frontmatter `trigger`
 *   (`always_on` | `model_decision` | `glob` | `manual`).
 *   Fuente: https://antigravity.google/docs/rules/
 *   También https://www.antigravity.google/docs/ide/rules (`.agents/rules`).
 * - MCP de workspace: `.agents/mcp_config.json`, objeto `mcpServers`.
 *   Global: `~/.gemini/config/mcp_config.json`.
 *   Fuente: https://www.antigravity.google/docs/mcp/
 *   y https://www.antigravity.google/docs/ide/mcp/
 *
 * Cursor (oficial):
 * - Skills: `.cursor/skills/<nombre>/SKILL.md`, comando `/<nombre>`.
 *   https://cursor.com/docs/skills
 * - MCP: `.cursor/mcp.json`, objeto `mcpServers`. https://cursor.com/docs/mcp
 * - Rules: `.cursor/rules/*.mdc`. https://cursor.com/docs/rules
 *
 * VS Code, si no hay API de proveedor MCP: `.vscode/mcp.json`, objeto `servers`
 * y `type: "stdio"`. https://code.visualstudio.com/docs/copilot/reference/mcp-configuration
 */

/** Nombres publicados por gimp-studio-mcp (src/gimp_mcp/tools, 119). */
export const GIMP_TOOL_NAMES: readonly string[] = [
  "status", "list_images", "set_active_image", "gimp_exec", "reset_namespace",
  "get_metadata", "new_image", "open_image", "export_image",
  "create_layer", "layer_from_file", "duplicate_layer", "delete_layer",
  "reorder_layer", "set_opacity", "set_blend_mode", "set_visible", "rename_layer",
  "merge_down", "flatten", "group_create", "group_add", "group_ungroup",
  "move_layer", "offset_layer", "offset_content", "seam_check",
  "add_mask", "apply_mask", "remove_mask", "add_alpha", "lock_alpha",
  "luminance_to_alpha", "color_to_alpha", "cutout_color", "threshold_alpha",
  "select_rect", "select_ellipse", "select_by_color", "fuzzy_select", "select_all",
  "select_none", "select_invert", "select_grow", "select_shrink", "select_feather",
  "select_border", "selection_to_channel", "select_from_alpha", "select_from_path",
  "foreground_select",
  "set_fg", "set_bg", "set_brush", "set_paint_opacity", "fill", "bucket_fill",
  "gradient", "stroke_selection", "pencil", "paintbrush",
  "create_text_layer", "set_text_props", "outline_text", "check_fonts", "substitute_font",
  "levels", "curves", "brightness_contrast", "hue_saturation", "color_balance",
  "desaturate", "invert", "posterize", "threshold", "normalize",
  "apply_filter", "gaussian_blur", "unsharp_mask", "drop_shadow",
  "print_geometry", "trim_to_content", "white_underbase", "edge_choke", "edge_spread",
  "knockout_background", "list_shirt_presets", "clean_for_dtf", "despill",
  "halftone_separation", "gang_sheet", "bleed_and_safe", "export_dtf_png",
  "get_profile", "assign_profile", "convert_profile", "soft_proof", "to_grayscale",
  "to_rgb", "list_profiles",
  "get_bitmap", "read_region", "color_at", "histogram", "list_gegl_ops", "describe_op",
  "list_procedures", "list_fonts", "list_brushes", "list_patterns", "list_gradients",
  "list_palettes",
  "checkpoint", "restore", "list_checkpoints", "undo_group_begin", "undo_group_end",
  "undo", "redo",
];

const TOOL_SET = new Set(GIMP_TOOL_NAMES);

export const BUNDLED_SKILLS = ["studio", "open", "edit", "dtf", "review", "export"] as const;

export const GIMP_MCP_ENTRY = { command: "gimp-mcp", args: ["serve"] as const };

export function skillForCommand(command: string | undefined): string {
  switch (command) {
    case "editar": return "edit";
    case "dtf": return "dtf";
    case "revisar": return "review";
    case "exportar": return "export";
    case "doctor": return "doctor";
    default: return "studio";
  }
}

/** Nombre exacto del MCP, o un nombre del host que contiene "gimp" y termina en esa herramienta. */
export function isGimpMcpTool(name: string): boolean {
  if (TOOL_SET.has(name)) return true;
  const lower = name.toLowerCase();
  if (!lower.includes("gimp")) return false;
  for (const tool of GIMP_TOOL_NAMES) {
    if (lower.endsWith("_" + tool) || lower.endsWith("/" + tool) || lower.endsWith("." + tool)) {
      return true;
    }
  }
  return false;
}

export function buildInstructions(skillBody: string): string {
  return [
    "Eres el agente GIMP Studio. Requiere el servidor MCP llamado gimp (comando gimp-mcp, argumentos serve).",
    "Usa las herramientas estructuradas de ese servidor. gimp_exec solo si ninguna herramienta estructurada cubre el caso, y dilo antes de llamarla.",
    "No inventes nombres de herramientas. Si una operación falla, para y muestra el error.",
    "En el flujo studio no saltes review ni export.",
    "",
    skillBody.trim(),
  ].join("\n");
}

export interface DoctorReading {
  bridgeNotInstalled: boolean;
  bridgeBroken: boolean;
  gimpNotRunning: boolean;
  problemsFound: boolean;
}

export function readDoctor(output: string, exitCode: number | null): DoctorReading {
  const bridgeNotInstalled = /bridge\s*:\s*NOT INSTALLED/i.test(output);
  const bridgeBroken = /NOT executable/i.test(output) || /UNREACHABLE/i.test(output);
  const gimpNotRunning = /live bridge\s*:\s*none\b/i.test(output);
  const problemsFound = exitCode !== 0 || bridgeNotInstalled || bridgeBroken || /PROBLEMS FOUND/i.test(output);
  return { bridgeNotInstalled, bridgeBroken, gimpNotRunning, problemsFound };
}

/** Comando de terminal. No se ejecuta solo: la extensión lo manda tras el clic en Instalar. */
export function shellInstall(hasPipx: boolean, bridgeOnly: boolean): string {
  if (bridgeOnly) return "gimp-mcp install-plugin";
  const install = hasPipx
    ? "pipx install twelvetake-gimp-studio-mcp"
    : "pip install --user twelvetake-gimp-studio-mcp";
  return `${install} && gimp-mcp install-plugin`;
}

export type McpShape = "mcpServers" | "vscode";

export function mergeMcpConfig(raw: string, shape: McpShape): string {
  const trimmed = raw.trim();
  const parsed: unknown = trimmed ? JSON.parse(trimmed) : {};
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("La config MCP no es un objeto JSON.");
  }
  const doc = parsed as Record<string, unknown>;
  if (shape === "vscode") {
    const servers = record(doc.servers);
    const prev = record(servers.gimp);
    servers.gimp = {
      ...prev,
      type: typeof prev.type === "string" ? prev.type : "stdio",
      command: GIMP_MCP_ENTRY.command,
      args: [...GIMP_MCP_ENTRY.args],
    };
    doc.servers = servers;
  } else {
    const servers = record(doc.mcpServers);
    const prev = record(servers.gimp);
    servers.gimp = {
      ...prev,
      command: GIMP_MCP_ENTRY.command,
      args: [...GIMP_MCP_ENTRY.args],
    };
    doc.mcpServers = servers;
  }
  return JSON.stringify(doc, null, 2) + "\n";
}

function record(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

export type IdeKind = "antigravity" | "cursor" | "vscode";

export function detectIde(appName: string): IdeKind | "unknown" {
  const n = appName.toLowerCase();
  if (n.includes("antigravity")) return "antigravity";
  if (n.includes("cursor")) return "cursor";
  if (n.includes("visual studio code") || n === "vscode" || n === "code") return "vscode";
  return "unknown";
}

export interface HostApis {
  chatCreate?: unknown;
  mcpRegister?: unknown;
  selectModels?: unknown;
}

export function hostCapabilities(api: HostApis): { chat: boolean; mcpProvider: boolean; lm: boolean } {
  return {
    chat: typeof api.chatCreate === "function",
    mcpProvider: typeof api.mcpRegister === "function",
    lm: typeof api.selectModels === "function",
  };
}

export function withSkillName(markdown: string, name: string): string {
  if (!markdown.startsWith("---\n")) {
    return `---\nname: ${name}\ndescription: Skill ${name} de GIMP Studio.\n---\n\n${markdown}`;
  }
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) {
    return `---\nname: ${name}\ndescription: Skill ${name} de GIMP Studio.\n---\n\n${markdown}`;
  }
  const head = markdown.slice(4, end);
  const rest = markdown.slice(end + 4).replace(/^\n/, "");
  const next = /^name:/m.test(head)
    ? head.replace(/^name:.*$/m, `name: ${name}`)
    : `name: ${name}\n${head}`;
  return `---\n${next}\n---\n\n${rest}`;
}

export interface PlannedFile {
  path: string;
  contents: string;
}

export function planWorkspaceInstall(input: {
  ide: IdeKind;
  skills: Record<string, string>;
  mcpRaw: string;
  writeMcp: boolean;
  /** Textos de rules/ del paquete. Se copian como referencias de la skill studio. */
  rules?: Record<string, string>;
}): PlannedFile[] {
  const files: PlannedFile[] = [];
  if (input.ide === "vscode") {
    if (input.writeMcp) {
      files.push({ path: ".vscode/mcp.json", contents: mergeMcpConfig(input.mcpRaw, "vscode") });
    }
    return files;
  }
  const studio = input.skills.studio;
  if (!studio) throw new Error("Falta skills/studio/SKILL.md en la extensión.");
  const skillRoot = input.ide === "antigravity" ? ".agents/skills" : ".cursor/skills";
  for (const name of BUNDLED_SKILLS) {
    const body = input.skills[name];
    if (!body) throw new Error(`Falta la skill ${name}.`);
    files.push({ path: `${skillRoot}/${name}/SKILL.md`, contents: withSkillName(body, name) });
  }
  for (const [name, body] of Object.entries(input.rules ?? {})) {
    files.push({ path: `${skillRoot}/studio/references/${name}`, contents: body });
  }
  files.push({
    path: `${skillRoot}/gimp/SKILL.md`,
    contents: withSkillName(studio, "gimp").replace(
      /^description:.*$/m,
      "description: Entrada /gimp del agente GIMP Studio. Sigue el flujo studio (abrir, editar o DTF, revisar, exportar) con el MCP gimp.",
    ),
  });
  if (input.ide === "antigravity") {
    const steps = studio.replace(/^---\n[\s\S]*?\n---\n*/, "");
    files.push({
      path: ".agents/workflows/gimp.md",
      contents: [
        "---",
        "name: gimp",
        "description: Entrada /gimp. Flujo studio sobre el MCP gimp (gimp-mcp serve). No salta review ni export.",
        "---",
        "",
        steps.trim(),
        "",
      ].join("\n"),
    });
    files.push({ path: ".agents/rules/gimp-studio.md", contents: antigravityRule() });
    if (input.writeMcp) {
      files.push({ path: ".agents/mcp_config.json", contents: mergeMcpConfig(input.mcpRaw, "mcpServers") });
    }
  } else {
    files.push({ path: ".cursor/rules/gimp-studio.mdc", contents: cursorRule() });
    if (input.writeMcp) {
      files.push({ path: ".cursor/mcp.json", contents: mergeMcpConfig(input.mcpRaw, "mcpServers") });
    }
  }
  return files;
}

function antigravityRule(): string {
  return [
    "---",
    "trigger: model_decision",
    "description: \"Aplicar cuando el usuario pida editar, revisar o exportar una imagen con GIMP, o producir DTF. Requiere el MCP gimp (gimp-mcp serve). Entrada /gimp.\"",
    "---",
    "",
    "# GIMP Studio",
    "",
    "- Servidor MCP `gimp`: comando `gimp-mcp`, argumentos `serve`. No reimplementes sus herramientas.",
    "- Prefiere herramientas estructuradas. `gimp_exec` solo como escape, y dilo antes.",
    "- Antes de borrar, aplanar, knockout o exportar: `checkpoint`. `undo` no revierte en GIMP 3.",
    "- Un brief completo sigue la skill `studio`: plan, MCP, `review` (`get_bitmap`) y `export`.",
    "- Detalle en `.agents/skills/` (studio, open, edit, dtf, review, export).",
    "",
  ].join("\n");
}

function cursorRule(): string {
  return [
    "---",
    "description: Edición de imágenes con GIMP vía el MCP gimp (gimp-mcp serve). Usar al pedir editar, DTF, revisar o exportar. Entrada /gimp.",
    "alwaysApply: false",
    "---",
    "",
    "# GIMP Studio",
    "",
    "- Servidor MCP `gimp`: comando `gimp-mcp`, argumentos `serve`.",
    "- Prefiere herramientas estructuradas. `gimp_exec` solo como escape documentado.",
    "- Antes de operaciones destructivas: `checkpoint`. No uses `undo` para revertir.",
    "- Sigue `.cursor/skills/studio/SKILL.md`. No saltes review ni export.",
    "",
  ].join("\n");
}
