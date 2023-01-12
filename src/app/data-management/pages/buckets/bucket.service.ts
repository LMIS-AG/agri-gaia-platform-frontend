import { HttpClient } from '@angular/common/http';
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

  // TODO Move subscribe to component and look for errors
  public publish(bucket: string, name: string): void {
    this.http.post<void>(`${environment.backend.url}/assets/${bucket}/${name}`, {}).subscribe();
  }

  // TODO Move subscribe to component and look for errors
  public unpublishAsset(bucket: string, name: string): void {
    this.http.delete<void>(`${environment.backend.url}/assets/${bucket}/${name}`, {}).subscribe();
  }
}
