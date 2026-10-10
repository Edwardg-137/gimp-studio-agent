import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const logic = require("../out/logic.js");

test("el catálogo nombra las 119 herramientas del MCP", () => {
  assert.equal(logic.GIMP_TOOL_NAMES.length, 119);
  assert.equal(new Set(logic.GIMP_TOOL_NAMES).size, 119);
  assert.ok(logic.GIMP_TOOL_NAMES.includes("gimp_exec"));
  assert.ok(logic.GIMP_TOOL_NAMES.includes("get_bitmap"));
  assert.ok(logic.GIMP_TOOL_NAMES.includes("export_dtf_png"));
});

test("slash commands de @gimp eligen skill", () => {
  assert.equal(logic.skillForCommand(undefined), "studio");
  assert.equal(logic.skillForCommand("editar"), "edit");
  assert.equal(logic.skillForCommand("dtf"), "dtf");
  assert.equal(logic.skillForCommand("revisar"), "review");
  assert.equal(logic.skillForCommand("exportar"), "export");
  assert.equal(logic.skillForCommand("doctor"), "doctor");
});

test("filtra herramientas del MCP gimp y no otras", () => {
  assert.equal(logic.isGimpMcpTool("open_image"), true);
  assert.equal(logic.isGimpMcpTool("mcp_gimp_open_image"), true);
  assert.equal(logic.isGimpMcpTool("gimp/knockout_background"), true);
  assert.equal(logic.isGimpMcpTool("mcp_other_open_image"), false);
  assert.equal(logic.isGimpMcpTool("weather"), false);
});

test("lee la salida real de gimp-mcp doctor", () => {
  const missing = logic.readDoctor(
    "bridge       : NOT INSTALLED — run `gimp-mcp install-plugin`\nPROBLEMS FOUND\n",
    1,
  );
  assert.equal(missing.bridgeNotInstalled, true);
  assert.equal(missing.problemsFound, true);

  const down = logic.readDoctor(
    "bridge       : INSTALLED (/x) v1\nlive bridge  : endpoint present but UNREACHABLE (timeout)\n",
    1,
  );
  assert.equal(down.bridgeNotInstalled, false);
  assert.equal(down.bridgeBroken, true);

  const idle = logic.readDoctor(
    "bridge       : INSTALLED (/x) v1\nlive bridge  : none (no endpoint at /tmp/x - start GIMP to test live)\n\nOK\n",
    0,
  );
  assert.equal(idle.gimpNotRunning, true);
  assert.equal(idle.problemsFound, false);
  assert.equal(idle.bridgeNotInstalled, false);
});

test("el comando de instalación no corre solo y elige pipx o pip", () => {
  assert.equal(
    logic.shellInstall(true, false),
    "pipx install twelvetake-gimp-studio-mcp && gimp-mcp install-plugin",
  );
  assert.equal(
    logic.shellInstall(false, false),
    "pip install --user twelvetake-gimp-studio-mcp && gimp-mcp install-plugin",
  );
  assert.equal(logic.shellInstall(true, true), "gimp-mcp install-plugin");
});

test("fusiona el MCP sin borrar otras entradas ni el env", () => {
  const raw = JSON.stringify({
    extra: true,
    mcpServers: {
      other: { command: "echo", args: ["hi"] },
      gimp: { command: "old", args: ["x"], env: { A: "1" } },
    },
  });
  const out = JSON.parse(logic.mergeMcpConfig(raw, "mcpServers"));
  assert.equal(out.extra, true);
  assert.equal(out.mcpServers.other.command, "echo");
  assert.deepEqual(out.mcpServers.other.args, ["hi"]);
  assert.equal(out.mcpServers.gimp.command, "gimp-mcp");
  assert.deepEqual(out.mcpServers.gimp.args, ["serve"]);
  assert.equal(out.mcpServers.gimp.env.A, "1");
});

test("el mcp.json de VS Code gana type stdio y conserva servers ajenos", () => {
  const out = JSON.parse(logic.mergeMcpConfig(
    JSON.stringify({ servers: { other: { type: "stdio", command: "node" } } }),
    "vscode",
  ));
  assert.equal(out.servers.other.command, "node");
  assert.equal(out.servers.gimp.type, "stdio");
  assert.equal(out.servers.gimp.command, "gimp-mcp");
  assert.deepEqual(out.servers.gimp.args, ["serve"]);
});

test("un JSON que no es objeto no se reescribe", () => {
  assert.throws(() => logic.mergeMcpConfig("[1]", "mcpServers"), /objeto JSON/);
  assert.throws(() => logic.mergeMcpConfig("{", "vscode"), SyntaxError);
});

test("detecta el IDE por appName y las APIs por tipo", () => {
  assert.equal(logic.detectIde("Antigravity IDE"), "antigravity");
  assert.equal(logic.detectIde("Cursor"), "cursor");
  assert.equal(logic.detectIde("Visual Studio Code"), "vscode");
  assert.equal(logic.detectIde("Algo"), "unknown");
  const caps = logic.hostCapabilities({
    chatCreate: () => {},
    mcpRegister: undefined,
    selectModels: () => {},
  });
  assert.deepEqual(caps, { chat: true, mcpProvider: false, lm: true });
});

test("el plan de Antigravity escribe workflow, skill /gimp, rule y fusiona el MCP", () => {
  const skills = Object.fromEntries(logic.BUNDLED_SKILLS.map((name) => [
    name,
    `---\nname: ${name}\ndescription: d\n---\n\n# ${name}\n`,
  ]));
  const files = logic.planWorkspaceInstall({
    ide: "antigravity",
    skills,
    mcpRaw: JSON.stringify({ mcpServers: { otro: { command: "x", args: [] } } }),
    writeMcp: true,
    rules: { "seguridad.md": "# s\n" },
  });
  const paths = files.map((f) => f.path);
  assert.ok(paths.includes(".agents/workflows/gimp.md"));
  assert.ok(paths.includes(".agents/skills/gimp/SKILL.md"));
  assert.ok(paths.includes(".agents/rules/gimp-studio.md"));
  assert.ok(paths.includes(".agents/mcp_config.json"));
  assert.ok(paths.includes(".agents/skills/studio/references/seguridad.md"));
  assert.equal(paths.some((p) => p.startsWith(".cursor/")), false);
  const rule = files.find((f) => f.path.endsWith("gimp-studio.md")).contents;
  assert.match(rule, /trigger: model_decision/);
  const mcp = JSON.parse(files.find((f) => f.path.endsWith("mcp_config.json")).contents);
  assert.equal(mcp.mcpServers.otro.command, "x");
  assert.equal(mcp.mcpServers.gimp.command, "gimp-mcp");
  const gimpSkill = files.find((f) => f.path.endsWith("skills/gimp/SKILL.md")).contents;
  assert.match(gimpSkill, /^name: gimp$/m);
});

test("las skills cumplen el contrato y citan herramientas reales", () => {
  const root = path.join(import.meta.dirname, "..");
  const names = ["studio", "open", "edit", "dtf", "review", "export"];
  const mentioned = new Set();
  for (const name of names) {
    const text = fs.readFileSync(path.join(root, "skills", name, "SKILL.md"), "utf8");
    for (const heading of ["Cuándo usar", "Pasos", "Verificaciones", "Oficio"]) {
      assert.ok(text.includes(heading), `${name} sin ${heading}`);
    }
    assert.match(text, /MCP `gimp`|servidor MCP `gimp`/);
    for (const hit of text.matchAll(/`([a-z][a-z0-9_]*)`/g)) mentioned.add(hit[1]);
  }
  const studio = fs.readFileSync(path.join(root, "skills/studio/SKILL.md"), "utf8");
  assert.match(studio, /No saltes el paso 6 ni el 7/);
  for (const tool of ["status", "open_image", "checkpoint", "get_bitmap", "gimp_exec", "knockout_background", "export_dtf_png", "export_image"]) {
    assert.ok(mentioned.has(tool), tool);
    assert.ok(logic.GIMP_TOOL_NAMES.includes(tool));
  }
  for (const invented of ["gimp_open", "open_document", "save_image", "run_python"]) {
    assert.equal(mentioned.has(invented), false);
  }
  const skills = Object.fromEntries(names.map((name) => [
    name,
    fs.readFileSync(path.join(root, "skills", name, "SKILL.md"), "utf8"),
  ]));
  const planned = logic.planWorkspaceInstall({
    ide: "antigravity",
    skills,
    mcpRaw: "",
    writeMcp: false,
  });
  const workflow = planned.find((f) => f.path === ".agents/workflows/gimp.md").contents;
  assert.ok(workflow.length < 12000, "el workflow pasa el límite de 12000 caracteres de Antigravity");
});

test("el plan de Cursor no toca rutas de Antigravity", () => {
  const skills = Object.fromEntries(logic.BUNDLED_SKILLS.map((name) => [name, `# ${name}\n`]));
  const files = logic.planWorkspaceInstall({
    ide: "cursor",
    skills,
    mcpRaw: "",
    writeMcp: true,
  });
  const paths = files.map((f) => f.path);
  assert.ok(paths.includes(".cursor/skills/gimp/SKILL.md"));
  assert.ok(paths.includes(".cursor/mcp.json"));
  assert.ok(paths.includes(".cursor/rules/gimp-studio.mdc"));
  assert.equal(paths.some((p) => p.startsWith(".agents/")), false);
});
