#!/usr/bin/env node
import { Command } from 'commander';
import { runServer } from './server.js';
import { cliList } from './cli/list.js';
import { cliShow } from './cli/show.js';
import { cliThread } from './cli/thread.js';
import { cliArchive } from './cli/archive.js';
import { cliDelete } from './cli/delete.js';
import { cliClear } from './cli/clear.js';
import { cliDoctor } from './cli/doctor.js';
import { cliInstall } from './cli/install.js';
import { cliUninstall } from './cli/uninstall.js';

const program = new Command();

program
  .name('passoff')
  .description('Context Passoff — structured handoffs between AI coding agents via MCP')
  .version('0.1.0');

program
  .command('serve')
  .description('Run the MCP server over stdio (invoked by MCP clients)')
  .action(async () => {
    await runServer();
  });

program
  .command('list')
  .description('List recent handoffs in the current project')
  .option('-p, --project <slug>', 'project slug (defaults to cwd/git root)')
  .option('-s, --status <status>', 'open | loaded | archived | all')
  .option('-n, --limit <n>', 'max rows to show', '10')
  .action((opts: any) => cliList(opts));

program
  .command('show <id>')
  .description("Print a handoff's full markdown content")
  .action((id: string) => cliShow(id));

program
  .command('thread <id>')
  .description('Show the lineage chain of a handoff')
  .option('-d, --direction <dir>', 'ancestors | descendants | both', 'both')
  .action((id: string, opts: any) => cliThread(id, opts));

program
  .command('archive <id>')
  .description('Mark a handoff as archived')
  .action((id: string) => cliArchive(id));

program
  .command('delete <id>')
  .description('Hard delete a handoff (asks confirmation)')
  .option('-y, --yes', 'skip confirmation')
  .action(async (id: string, opts: any) => {
    await cliDelete(id, opts);
  });

program
  .command('clear')
  .description('Archive all open handoffs in a project (asks confirmation)')
  .option('-p, --project <slug>', 'project slug (defaults to cwd/git root)')
  .option('-y, --yes', 'skip confirmation')
  .action(async (opts: any) => {
    await cliClear(opts);
  });

program
  .command('doctor')
  .description('Print diagnostic info: DB path, version, row counts, MCP config hints')
  .action(() => cliDoctor());

program
  .command('install')
  .description('Install passoff command templates for Claude Code, Cursor, and/or Codex')
  .option('-c, --client <name>', 'claude | cursor | codex | all', 'all')
  .option('-s, --scope <scope>', 'user | project', 'user')
  .option('-p, --project <dir>', 'project directory (for --scope project)')
  .action((opts: any) => cliInstall(opts));

program
  .command('uninstall')
  .description('Remove passoff command templates installed by passoff install')
  .option('-c, --client <name>', 'claude | cursor | codex | all', 'all')
  .option('-s, --scope <scope>', 'user | project', 'user')
  .option('-p, --project <dir>', 'project directory (for --scope project)')
  .action((opts: any) => cliUninstall(opts));

await program.parseAsync(process.argv);
