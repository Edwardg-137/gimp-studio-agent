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
  assert.equal(logic.skillForCommand("color"), "color");
  assert.equal(logic.skillForCommand("piel"), "piel");
  assert.equal(logic.skillForCommand("seleccion"), "seleccion");
  assert.equal(logic.skillForCommand("nitidez"), "nitidez");
  assert.equal(logic.skillForCommand("composicion"), "composicion");
  assert.equal(logic.skillForCommand("dtf"), "dtf");
  assert.equal(logic.skillForCommand("revisar"), "review");
  assert.equal(logic.skillForCommand("exportar"), "export");
  assert.equal(logic.skillForCommand("doctor"), "doctor");
});

test("un brief en lenguaje natural cierra con review y export", () => {
  const piel = logic.routeBrief("suaviza la piel y quita un grano");
  assert.ok(piel.includes("piel"));
  assert.deepEqual(piel.slice(-2), ["review", "export"]);
  const dtf = logic.routeBrief("prepara el logo para una camiseta");
  assert.ok(dtf.includes("dtf"));
  assert.deepEqual(dtf.slice(-2), ["review", "export"]);
  const n = logic.routeBrief("hazla más nítida");
  assert.ok(n.includes("nitidez"));
  assert.equal(logic.skillsForTurn(undefined, "suaviza la piel")[0], "studio");
  assert.ok(logic.skillsForTurn(undefined, "suaviza la piel").includes("piel"));
  assert.deepEqual(logic.skillsForTurn("editar", "también el color"), ["edit"]);
  assert.deepEqual(logic.skillsForTurn("doctor", "x"), ["doctor"]);
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

test("el plan de Antigravity escribe skills /gimp y plugin, no workflows ni el mcp del usuario", () => {
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
  assert.equal(paths.includes(".agents/workflows/gimp.md"), false);
  assert.equal(paths.includes(".agents/mcp_config.json"), false);
  assert.ok(paths.includes(".agents/skills/gimp/SKILL.md"));
  assert.ok(paths.includes(".agents/rules/gimp-studio.md"));
  assert.ok(paths.includes(".agents/skills/studio/references/seguridad.md"));
  assert.ok(paths.includes(".agents/plugins/gimp-studio/plugin.json"));
  assert.ok(paths.includes(".agents/plugins/gimp-studio/skills/gimp/SKILL.md"));
  assert.ok(paths.includes(".agents/plugins/gimp-studio/mcp_config.json"));
  assert.equal(paths.some((p) => p.startsWith(".cursor/")), false);
  const rule = files.find((f) => f.path === ".agents/rules/gimp-studio.md").contents;
  assert.match(rule, /trigger: model_decision/);
  const plugin = JSON.parse(files.find((f) => f.path.endsWith("plugin.json")).contents);
  assert.equal(plugin.name, "gimp-studio");
  const mcp = JSON.parse(files.find((f) => f.path.endsWith("plugins/gimp-studio/mcp_config.json")).contents);
  assert.deepEqual(Object.keys(mcp.mcpServers), ["gimp"]);
  assert.equal(mcp.mcpServers.gimp.command, "gimp-mcp");
  assert.equal(mcp.mcpServers.otro, undefined);
  const gimpSkill = files.find((f) => f.path === ".agents/skills/gimp/SKILL.md").contents;
  assert.match(gimpSkill, /^name: gimp$/m);
});

test("la fusión confirmada conserva servidores y deja copia si el archivo existe", () => {
  const raw = JSON.stringify({
    extra: true,
    mcpServers: {
      other: { command: "echo", args: ["hi"] },
      gimp: { command: "old", args: ["x"], env: { A: "1" } },
    },
  });
  const plan = logic.planConfirmedMcpWrite({
    configPath: "/tmp/mcp_config.json",
    raw,
    exists: true,
    shape: "mcpServers",
    stamp: "20261010T000000",
  });
  const out = JSON.parse(plan.next);
  assert.equal(out.extra, true);
  assert.equal(out.mcpServers.other.command, "echo");
  assert.equal(out.mcpServers.gimp.command, "gimp-mcp");
  assert.deepEqual(out.mcpServers.gimp.args, ["serve"]);
  assert.equal(out.mcpServers.gimp.env.A, "1");
  assert.equal(plan.changed, true);
  assert.equal(plan.backupPath, "/tmp/mcp_config.json.bak-20261010T000000");
  assert.match(plan.summary, /other/);
  assert.match(plan.summary, /Hay que escribir/);
});

test("si gimp ya está bien no escribe, y sin archivo no hay copia", () => {
  const raw = JSON.stringify({ mcpServers: { gimp: { command: "gimp-mcp", args: ["serve"] } } });
  const plan = logic.planConfirmedMcpWrite({
    configPath: "/tmp/a.json",
    raw,
    exists: false,
    shape: "mcpServers",
    stamp: "s",
  });
  assert.equal(plan.changed, false);
  assert.equal(plan.backupPath, null);
  assert.match(plan.summary, /No hace falta escribir/);
  assert.match(plan.summary, /no hay copia/);
});

test("en VS Code la entrada gimp no está lista hasta tener type stdio", () => {
  const raw = JSON.stringify({ servers: { gimp: { command: "gimp-mcp", args: ["serve"] } } });
  const plan = logic.planConfirmedMcpWrite({
    configPath: "/tmp/v.json",
    raw,
    exists: true,
    shape: "vscode",
    stamp: "s",
  });
  assert.equal(plan.changed, true);
  assert.equal(plan.backupPath, "/tmp/v.json.bak-s");
  const out = JSON.parse(plan.next);
  assert.equal(out.servers.gimp.type, "stdio");
  const ready = logic.planConfirmedMcpWrite({
    configPath: "/tmp/v.json",
    raw: plan.next,
    exists: true,
    shape: "vscode",
    stamp: "s2",
  });
  assert.equal(ready.changed, false);
});

test("un JSON que no es objeto no se planifica para fusionar", () => {
  assert.throws(() => logic.planConfirmedMcpWrite({
    configPath: "/tmp/x",
    raw: "[1]",
    exists: true,
    shape: "mcpServers",
    stamp: "s",
  }), /objeto JSON/);
  assert.throws(() => logic.planConfirmedMcpWrite({
    configPath: "/tmp/x",
    raw: "{",
    exists: true,
    shape: "mcpServers",
    stamp: "s",
  }), SyntaxError);
});

test("las skills cumplen el contrato y citan herramientas reales", () => {
  const root = path.join(import.meta.dirname, "..");
  const names = [...logic.BUNDLED_SKILLS];
  const mentioned = new Set();
  for (const name of names) {
    const text = fs.readFileSync(path.join(root, "skills", name, "SKILL.md"), "utf8");
    for (const heading of ["Cuándo usar", "Diagnóstico", "Pasos", "Verificaciones", "Errores comunes", "Oficio"]) {
      assert.ok(text.includes(heading), `${name} sin ${heading}`);
    }
    assert.match(text, /MCP `gimp`|servidor MCP `gimp`/);
    for (const hit of text.matchAll(/`([a-z][a-z0-9_]*)`/g)) mentioned.add(hit[1]);
  }
  const studio = fs.readFileSync(path.join(root, "skills/studio/SKILL.md"), "utf8");
  assert.match(studio, /No saltes el paso 4 ni el 5/);
  for (const tool of ["status", "open_image", "checkpoint", "get_bitmap", "gimp_exec", "knockout_background", "export_dtf_png", "export_image", "apply_filter", "set_blend_mode"]) {
    assert.ok(mentioned.has(tool), tool);
    assert.ok(logic.GIMP_TOOL_NAMES.includes(tool));
  }
  for (const invented of ["gimp_open", "open_document", "save_image", "run_python"]) {
    assert.equal(mentioned.has(invented), false);
  }
  const snippets = fs.readFileSync(path.join(root, "rules/gimp-exec-snippets.md"), "utf8");
  for (const fragment of ["crop", "straighten", "scale", "canvas", "perspective", "rotate90", "flip", "jpeg", "new_from_visible", "heal", "newsprint"]) {
    assert.match(snippets, new RegExp(`^## ${fragment}$`, "m"));
  }
  assert.match(snippets, /GIMP_MCP_NO_EXEC/);
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
  assert.equal(planned.some((f) => f.path === ".agents/workflows/gimp.md"), false);
  assert.ok(planned.some((f) => f.path === ".agents/skills/gimp/SKILL.md"));
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

test("los JSON de Claude Code son válidos y coinciden", () => {
  const read = (p) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", p), "utf8"));
  const plugin = read(".claude-plugin/plugin.json");
  const market = read(".claude-plugin/marketplace.json");
  assert.deepEqual(read(".mcp.json").mcpServers.gimp, { type: "stdio", command: "gimp-mcp", args: ["serve"] });
  assert.equal(market.plugins[0].name, plugin.name);
});
