export interface AssetJson {
  assetPropName?: string;
  assetPropByteSize?: number; // Approximately 8 million TB.
  assetPropDescription?: string;
  assetPropContentType?: string;
  assetPropVersion?: string;
  assetPropId?: string;
  agrovocKeywords?: string[];
  latitude?: string;
  longitude?: string;
  dateRange?: string;
  openApiDescription?: string;
  dataAddressType?: string;
  dataAddressRegion?: string;
  dataAddressBucketName?: string;
  dataAddressAssetName?: string;
  dataAddressKeyName?: string;
}
