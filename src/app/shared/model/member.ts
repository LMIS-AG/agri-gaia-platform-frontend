import { CoopSpaceRole } from './coop-spaces';

export interface Member {
  id?: number;
  name: string;
  company: string;
  role: CoopSpaceRole;
}
// TODO link between member and coopSpace in model is currently missing; adjust role in future
