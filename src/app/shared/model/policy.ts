export interface Policy {
  id?: number;
  name: string;
  policyType: PolicyType;
}

export enum PolicyType {
  Contract = "CONTRACT",
  Access = "ACCESS",
}
