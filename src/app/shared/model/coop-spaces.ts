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
  Guest = 'GUEST',
  User = 'USER',
  Admin = 'ADMIN',
}
