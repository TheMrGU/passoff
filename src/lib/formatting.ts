import type { ListItem } from '../tools/list.js';
import type { Handoff } from '../types.js';

function pad(s: string, n: number): string {
  if (s.length >= n) return s.slice(0, n - 1) + '…';
  return s + ' '.repeat(n - s.length);
}

export function formatTime(ms: number): string {
  return new Date(ms).toISOString().replace('T', ' ').slice(0, 16);
}

export function formatList(items: ListItem[]): string {
  if (items.length === 0) return '(no handoffs)';
  const header = `${pad('ID', 13)}${pad('CREATED', 18)}${pad('STATUS', 10)}${pad('FROM → TO', 26)}TITLE`;
  const sep = '-'.repeat(header.length);
  const lines = items.map(i => {
    const from = i.from_client;
    const to = i.to_client ?? '—';
    return (
      pad(i.id, 13) +
      pad(formatTime(i.created_at), 18) +
      pad(i.status, 10) +
      pad(`${from} → ${to}`, 26) +
      i.title
    );
  });
  return [header, sep, ...lines].join('\n');
}

export function formatHandoff(h: Handoff): string {
  const lines: string[] = [
    `# ${h.title}`,
    '',
    `id:          ${h.id}`,
    `project:     ${h.project}`,
    `status:      ${h.status}`,
    `from:        ${h.from_client}${h.from_client_ver ? ` (${h.from_client_ver})` : ''}${h.from_model ? ` / ${h.from_model}` : ''}`,
    `to:          ${h.to_client ?? '—'}${h.to_client_ver ? ` (${h.to_client_ver})` : ''}${h.to_model ? ` / ${h.to_model}` : ''}`,
    `created_at:  ${formatTime(h.created_at)}`,
  ];
  if (h.loaded_at) lines.push(`loaded_at:   ${formatTime(h.loaded_at)}`);
  if (h.parent_id) lines.push(`parent_id:   ${h.parent_id}`);
  if (h.tags.length) lines.push(`tags:        ${h.tags.join(', ')}`);
  lines.push('', '---', '', h.content);
  return lines.join('\n');
}

export function formatThread(chain: Handoff[], anchorId: string): string {
  const lines: string[] = [];
  chain.forEach((h, i) => {
    const marker = h.id === anchorId ? '●' : '○';
    const arrow = i === 0 ? '  ' : '│ ';
    lines.push(`${arrow}`);
    const edge = i === 0 ? '┌─' : '├─';
    const arc = h.to_client ? `  ${h.from_client} → ${h.to_client}` : `  ${h.from_client}`;
    lines.push(`${edge}${marker} ${h.id}  ${h.title}`);
    lines.push(`│${arc}  [${h.status}]`);
  });
  return lines.join('\n');
}
