import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.delete(`${environment.backend.url}/assets/publish/${bucket}/${name}`, { observe: 'response' });
  }

  public uploadAsset(bucket: string, formData: FormData): Observable<HttpEvent<Object>> {
    return this.http.post(`${environment.backend.url}/assets/upload/${bucket}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
