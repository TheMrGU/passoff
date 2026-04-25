#!/usr/bin/env node
// One-shot installer: wire the Passoff MCP into every detected AI client on this machine.
// Run with: npm run setup
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = join(ROOT, 'dist', 'index.js');
const HOME = homedir();

function step(msg) {
  console.log(`\n▶ ${msg}`);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function skip(msg) {
  console.log(`  · ${msg}`);
}
function warn(msg) {
  console.log(`  ! ${msg}`);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: platform() === 'win32', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}`);
}

function ensureBuild() {
  step('Installing dependencies and building');
  if (!existsSync(join(ROOT, 'node_modules'))) {
    run('npm', ['install'], { cwd: ROOT });
  } else {
    skip('node_modules present, skipping npm install');
  }
  run('npm', ['run', 'build'], { cwd: ROOT });
  ok(`built → ${ENTRY}`);
}

function hasCommand(cmd) {
  const probe = platform() === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
  try {
    execSync(probe, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function wireClaudeCode() {
  step('Claude Code');
  if (!hasCommand('claude')) {
    skip('`claude` CLI not on PATH — skipping (install Claude Code from claude.com/download)');
    return;
  }
  try {
    // remove existing registration so this re-runs cleanly
    spawnSync('claude', ['mcp', 'remove', 'passoff'], { stdio: 'ignore', shell: platform() === 'win32' });
    run('claude', ['mcp', 'add', 'passoff', '--', 'node', ENTRY, 'serve']);
    ok('registered MCP server "passoff"');
  } catch (e) {
    warn(`claude mcp add failed: ${e.message}`);
  }
}

function wireJsonConfig(label, path) {
  step(label);
  mkdirSync(dirname(path), { recursive: true });
  let cfg = {};
  if (existsSync(path)) {
    try {
      cfg = JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
      warn(`${path} exists but isn't valid JSON — writing backup and overwriting`);
      writeFileSync(`${path}.bak-${Date.now()}`, readFileSync(path));
      cfg = {};
    }
  }
  cfg.mcpServers = cfg.mcpServers || {};
  cfg.mcpServers.passoff = { command: 'node', args: [ENTRY, 'serve'] };
  writeFileSync(path, JSON.stringify(cfg, null, 2));
  ok(`wrote ${path}`);
}

function wireCodex() {
  step('Codex (~/.codex/config.toml)');
  const path = join(HOME, '.codex', 'config.toml');
  mkdirSync(dirname(path), { recursive: true });
  const existing = existsSync(path) ? readFileSync(path, 'utf-8') : '';
  const marker = '[mcp_servers.passoff]';
  const entryToml = ENTRY.replace(/\\/g, '\\\\');
  const block = `\n${marker}\ncommand = "node"\nargs = ["${entryToml}", "serve"]\n`;

  let next;
  if (existing.includes(marker)) {
    // replace the existing block (from the marker to the next section header or EOF)
    next = existing.replace(/\[mcp_servers\.passoff\][\s\S]*?(?=\n\[|\n*$)/, block.trim());
  } else {
    next = existing.trimEnd() + (existing ? '\n' : '') + block;
  }
  writeFileSync(path, next);
  ok(`wrote ${path}`);
}

function installSlashCommands() {
  step('Slash commands (/passoff, /passoff-load, /passoff-list, /passoff-search)');
  run('node', [ENTRY, 'install']);
}

function main() {
  console.log('Passoff — one-shot setup');
  console.log(`Install root: ${ROOT}`);

  ensureBuild();
  wireClaudeCode();
  wireJsonConfig('Cursor (~/.cursor/mcp.json)', join(HOME, '.cursor', 'mcp.json'));
  wireJsonConfig('Windsurf (~/.codeium/windsurf/mcp_config.json)', join(HOME, '.codeium', 'windsurf', 'mcp_config.json'));
  wireCodex();
  installSlashCommands();

  console.log('\nAll done. Restart each AI client to pick up the changes.');
  console.log('Then try `/passoff`, `/passoff-load`, `/passoff-list`, or `/passoff-search` (Codex uses `/passoff:create`, etc.).');
}

main();
