export type HandoffStatus = 'open' | 'loaded' | 'archived';

export interface HandoffRow {
  id: string;
  project: string;
  title: string;
  content: string;
  tags: string | null;
  from_client: string;
  from_client_ver: string | null;
  from_model: string | null;
  to_client: string | null;
  to_client_ver: string | null;
  to_model: string | null;
  parent_id: string | null;
  created_at: number;
  loaded_at: number | null;
  status: HandoffStatus;
}

export interface Handoff extends Omit<HandoffRow, 'tags'> {
  tags: string[];
}

export function rowToHandoff(row: HandoffRow): Handoff {
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}
