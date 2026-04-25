import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type Database from 'better-sqlite3';
import { openDb } from './db.js';
import { createHandoff } from './tools/create.js';
import { loadHandoff } from './tools/load.js';
import { listHandoffs } from './tools/list.js';
import { searchHandoffs } from './tools/search.js';
import { threadHandoff } from './tools/thread.js';
import type { ClientInfo } from './lib/client-info.js';
import { UNKNOWN_CLIENT } from './lib/client-info.js';

const VERSION = '0.1.0';

export function ok<T>(data: T) {
  // MCP requires `structuredContent` to be a JSON object (record), not an array
  // or scalar. Wrap non-objects in `{ items: ... }` so strict clients don't
  // reject the tool result.
  const structured =
    data !== null && typeof data === 'object' && !Array.isArray(data)
      ? (data as any)
      : { items: data };
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: structured,
  };
}

function err(message: string) {
  return {
    content: [{ type: 'text' as const, text: `Error: ${message}` }],
    isError: true,
  };
}

export function buildServer(db: Database.Database): McpServer {
  const mcp = new McpServer(
    { name: 'passoff', version: VERSION },
    { capabilities: { tools: {} } },
  );

  const getClient = (): ClientInfo => {
    const info = mcp.server.getClientVersion();
    if (!info) return UNKNOWN_CLIENT;
    return { name: info.name, version: info.version };
  };

  mcp.registerTool(
    'passoff_create',
    {
      description:
        'Create a context handoff for another AI agent. Use this when the user types /passoff, asks to hand off, pass off, or transfer context to another AI. Write a structured markdown body with sections: Current State, Decisions Made (with rationale), Open Questions, Next Steps, Relevant Files. Be terse but specific — the receiving AI has no context. Set from_model to your model id (e.g. "claude-opus-4-7", "gpt-5").',
      inputSchema: {
        title: z.string().min(1).max(120),
        content: z.string().min(1),
        tags: z.array(z.string()).optional(),
        parent_id: z.string().optional(),
        project: z.string().optional(),
        from_model: z.string().optional(),
      },
    },
    async input => {
      try {
        const r = createHandoff(db, input as any, getClient());
        return ok(r);
      } catch (e: any) {
        return err(e.message ?? String(e));
      }
    },
  );

  mcp.registerTool(
    'passoff_load',
    {
      description:
        'Load a previously created handoff. Use when the user asks to load a handoff, pick up where another AI left off, or starts a session by referencing prior context. Pass `latest: true` to grab the most recent active (non-archived) handoff, or `id` for a specific one. Calling with `latest: true` repeatedly returns the same handoff until it is archived, so a session can resume cleanly after a restart.',
      inputSchema: {
        id: z.string().optional(),
        latest: z.boolean().optional(),
        project: z.string().optional(),
      },
    },
    async input => {
      try {
        const r = loadHandoff(db, input as any, getClient());
        return ok(r);
      } catch (e: any) {
        return err(e.message ?? String(e));
      }
    },
  );

  mcp.registerTool(
    'passoff_list',
    {
      description:
        'List recent handoffs in the current project (metadata only, no body). Useful for discovery before loading a specific handoff.',
      inputSchema: {
        project: z.string().optional(),
        status: z.enum(['open', 'loaded', 'archived', 'all']).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      },
    },
    async input => {
      try {
        return ok(listHandoffs(db, input as any));
      } catch (e: any) {
        return err(e.message ?? String(e));
      }
    },
  );

  mcp.registerTool(
    'passoff_search',
    {
      description:
        'Full-text search across handoffs in the current project. Returns ranked hits with snippets.',
      inputSchema: {
        query: z.string().min(1),
        project: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
      },
    },
    async input => {
      try {
        return ok(searchHandoffs(db, input as any));
      } catch (e: any) {
        return err(e.message ?? String(e));
      }
    },
  );

  mcp.registerTool(
    'passoff_thread',
    {
      description:
        'Show the lineage chain of a handoff — ancestors, descendants, or both. Useful for tracing how a decision evolved across multiple AI agents.',
      inputSchema: {
        id: z.string(),
        direction: z.enum(['ancestors', 'descendants', 'both']).optional(),
      },
    },
    async input => {
      try {
        return ok(threadHandoff(db, input as any));
      } catch (e: any) {
        return err(e.message ?? String(e));
      }
    },
  );

  return mcp;
}

export async function runServer(): Promise<void> {
  const db = openDb();
  const mcp = buildServer(db);
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}
