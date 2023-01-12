import { Member } from './member';

export interface CoopSpace {
  id?: number;
  name: string;
  company: string;
  mandant: string;
  members: Member[];
  role: CoopSpaceRole;
}

export enum CoopSpaceRole {
  None = 'NONE',  // MinIO admins can see CoopSpaces they are not a member of.
  Guest = 'GUEST',
  User = 'USER',
  Admin = 'ADMIN',
}
