import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable, Subscription, timeout } from 'rxjs';
import { Bucket } from 'src/app/shared/model/bucket';
import { environment } from 'src/environments/environment';
import { GeneralPurposeAsset } from '../../../shared/model/coopSpaceAsset';

@Injectable({
  providedIn: 'root',
})
export class BucketService {
  constructor(private http: HttpClient) {}

  public getAll(): Observable<Bucket[]> {
    return this.http.get<Bucket[]>(environment.backend.url + '/buckets');
  }

  public getAssetsByBucketName(name: string): Observable<GeneralPurposeAsset[]> {
    return this.http.get<GeneralPurposeAsset[]>(`${environment.backend.url}/buckets/${name}/assets`);
  }

  public publishAsset(bucket: string, name: string): Observable<HttpResponse<unknown>> {
    return this.http.post(`${environment.backend.url}/assets/publish/${bucket}/${name}`, {}, { observe: 'response' });
  }

  public unpublishAsset(bucket: string, name: string): Observable<HttpResponse<unknown>> {
    return this.http.delete(`${environment.backend.url}/assets/unpublish/${bucket}/${name}`, { observe: 'response' });
  }

  public deleteAsset(bucket: string, name: string): Observable<HttpResponse<unknown>> {
    return this.http.delete(`${environment.backend.url}/buckets/delete/${bucket}/${name}`, { observe: 'response' });
  }

  public buildFormDataAndUploadAssets(event: any, bucket: string): Observable<HttpEvent<Object>> {
    const filesToUpload: File[] = event.target.files;

    const formData = new FormData();
    if (filesToUpload && filesToUpload.length !== 0) {
      for (let index = 0; index < filesToUpload.length; index++) {
        const file = filesToUpload[index];
        formData.append('files', file);
      }
    }
    return this.uploadAssets(bucket, formData).pipe(finalize(() => this.reset()));
  }

  private uploadAssets(bucket: string, formData: FormData): Observable<HttpEvent<Object>> {
    return this.http.post(`${environment.backend.url}/buckets/upload/${bucket}`, formData, {
      reportProgress: true,
      observe: 'events',
    }).pipe(timeout(21600000))
    ;
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
