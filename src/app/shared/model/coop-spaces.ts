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

export function fromStringToCoopSpaceRole(role: string): CoopSpaceRole {
  switch (role) {
    case 'GUEST':
      return CoopSpaceRole.Guest;
    case 'USER':
      return CoopSpaceRole.User;
    case 'ADMIN':
      return CoopSpaceRole.Admin;
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}
