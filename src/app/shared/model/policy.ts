export interface Policy {
  id?: number;
  name: string;
  type: PolicyType;
  inUse: boolean;
}

export enum PolicyType {
  Contract = 'CONTRACT',
  Access = 'ACCESS',
}
