export interface PublishableAsset {
  assetPropName?: string;
  assetPropByteSize?: number; // Approximately 8 million TB.
  assetPropDescription?: string;
  assetPropContentType?: string;
  assetPropVersion?: string;
  assetPropId?: string;
  agrovocKeywords?: string[];
  geonamesUri?: string;
  dateRange?: string;
  dataAddressType?: string;
  dataAddressRegion?: string;
  dataAddressBucketName?: string;
  dataAddressAssetName?: string;
  dataAddressKeyName?: string;
}
