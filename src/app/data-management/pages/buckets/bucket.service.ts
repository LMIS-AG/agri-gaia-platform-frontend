import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, map, Observable, Subscription, timeout } from 'rxjs';
import { Bucket } from 'src/app/shared/model/bucket';
import { PublishableAsset } from 'src/app/shared/model/publishable-asset';
import { STSRequest } from 'src/app/shared/model/stsRequest';
import { environment } from 'src/environments/environment';
import { GeneralPurposeAsset } from '../../../shared/model/general-purpose-asset';

@Injectable({
  providedIn: 'root',
})
export class BucketService {
  constructor(private http: HttpClient) {}

  public getAll(): Observable<Bucket[]> {
    return this.http.get<Bucket[]>(environment.backend.url + '/buckets');
  }

  public getAssetsByBucketName(name: string, folder: string): Observable<GeneralPurposeAsset[]> {
    const base64encodedFolderName = btoa(folder);
    return this.http.get<GeneralPurposeAsset[]>(`${environment.backend.url}/buckets/${name}/${base64encodedFolderName}`);
  }

  public publishAsset(bucketName: string, assetName: string, policyName: string, asset: PublishableAsset): Observable<HttpResponse<unknown>> {
    return this.http.post(`${environment.backend.url}/edc/publish/${bucketName}/${assetName}/${policyName}`, asset, {
      observe: 'response',
    });
  }

  public unpublishAsset(bucket: string, name: string): Observable<HttpResponse<unknown>> {
    return this.http.delete(`${environment.backend.url}/edc/unpublish/${bucket}/${name}`, { observe: 'response' });
  }

  public downloadAsset(bucket: string, name: string): Observable<Blob> {
    const base64EncodedFileName = btoa(name)
    return this.http.post(`${environment.backend.url}/buckets/downloadAsset/${bucket}/${base64EncodedFileName}`, {bucket, name}, { observe: 'response', responseType: 'blob' }).pipe(
      map((response: HttpResponse<Blob>) => (response.body as Blob))
    );
  }

  public downloadFolder(bucket: string, folderName: string): Observable<Blob> {
    const base64EncodedFolderName = btoa(folderName)

    return this.http.post(`${environment.backend.url}/buckets/downloadFolder/${bucket}/${base64EncodedFolderName}`, {bucket, folderName}, { observe: 'response', responseType: 'blob' }).pipe(
      map((response: HttpResponse<Blob>) => (response.body as Blob))
    );
  }

  public deleteAsset(bucket: string, name: string): Observable<HttpResponse<unknown>> {
    const base64EncodedFileName = btoa(name);
    return this.http.delete(`${environment.backend.url}/buckets/delete/${bucket}/${base64EncodedFileName}`, {
      observe: 'response',
    });
  }

  public getKeysAndToken(): Observable<STSRequest> {
    return this.http.get<STSRequest>(`${environment.backend.url}/buckets/sts`);
  }

  public buildFormDataAndUploadAssets(event: any, bucket: string, currentRoot: string): Observable<HttpEvent<Object>> {
    const filesToUpload: File[] = event.target.files;

    const formData = new FormData();
    if (filesToUpload && filesToUpload.length !== 0) {
      for (let index = 0; index < filesToUpload.length; index++) {
        const file = filesToUpload[index];
        formData.append('files', file);
      }
    }
    return this.uploadAssets(bucket, currentRoot, formData).pipe(finalize(() => this.reset()));
  }

  private uploadAssets(bucket: string, currentRoot: string, formData: FormData): Observable<HttpEvent<Object>> {
    let base64encodedFolderName;
    // simple trick in order to avoid sending the post request with '/' as the last character, not pretty but it works
    if (currentRoot === '') {
      base64encodedFolderName = 'default';
    } else {
      base64encodedFolderName = btoa(currentRoot);
    }
    return this.http
      .post(`${environment.backend.url}/buckets/upload/${bucket}/${base64encodedFolderName}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(timeout(21600000));
  }

  // TODO use this later when adding progress bar in order to make it possibel to cancel the upload
  public uploadSub: Subscription | undefined;

  public cancelUpload(): void {
    this.uploadSub!.unsubscribe(); // TODO check if this causes erros
    this.reset();
  }

  public reset(): void {
    this.uploadSub = undefined;
  }
}
