export interface Policy {
  id?: number;
  name: string;
  type: PolicyType;
}

export enum PolicyType {
  Contract = "CONTRACT",
  Access = "ACCESS",
}
