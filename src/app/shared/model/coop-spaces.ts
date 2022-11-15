export interface CoopSpace {
  id?: number;
  name: string;
  company: string;
  mandant: string;
  member: string[];
  role: CoopSpaceRole;
}

export enum CoopSpaceRole {
  Viewer = 'VIEWER',
  Editor = 'EDITOR',
  Owner = 'OWNER',
}
