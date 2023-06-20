import {Constraint} from "./constraint";

export interface Policy {
  id?: number;
  name: string;
  policyType: PolicyType;
  permissions: Constraint[],
}

export enum PolicyType {
  Contract = "CONTRACT",
  Access = "ACCESS",
}
