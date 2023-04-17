import { GeneralPurposeAsset } from './general-purpose-asset';

export interface FileElement {
  id?: string; // TODO necessary?
  name: string;
  parent?: string; // TODO necessary?
  asset?: GeneralPurposeAsset;
  isFolder: boolean;
}
