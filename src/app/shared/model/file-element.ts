import { GeneralPurposeAsset } from './general-purpose-asset';

export interface FileElement {
  id?: string; // TODO do I need that?
  name?: string; // TODO do I need that?
  parent?: string; // TODO do I need that?
  asset?: GeneralPurposeAsset;
  isFolder: boolean;
}
