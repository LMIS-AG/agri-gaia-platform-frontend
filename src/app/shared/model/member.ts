import { CoopSpaceRole } from './coop-spaces';

export interface Member {
  id?: number;
  name?: string;
  company?: string;
  email?: string;
  role: CoopSpaceRole;
  username: string;
}
