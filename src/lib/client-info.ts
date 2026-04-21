export interface ClientInfo {
  name: string;
  version?: string;
}

export const UNKNOWN_CLIENT: ClientInfo = { name: 'unknown', version: undefined };
