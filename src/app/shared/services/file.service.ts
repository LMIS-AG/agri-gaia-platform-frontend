import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  public uploadSub: Subscription | undefined; // TODO do i need this?

  public onFileSelected(event: any, bucket: string): Observable<HttpEvent<Object>> {
    const filesToUpload: File[] = event.target.files;

    const formData = new FormData();
    if (filesToUpload && filesToUpload.length !== 0) {
      for (let index = 0; index < filesToUpload.length; index++) {
        const file = filesToUpload[index];
        formData.append('files', file);
      }
    }
    return this.uploadAsset(bucket, formData).pipe(finalize(() => this.reset()));
  }

  // TODO use this later when adding progress bar in order to make it possibel to cancel the upload
  public cancelUpload(): void {
    this.uploadSub!.unsubscribe(); // TODO check if this causes erros
    this.reset();
  }

  public reset(): void {
    this.uploadSub = undefined;
  }

  public uploadAsset(bucket: string, formData: FormData): Observable<HttpEvent<Object>> {
    return this.http.post(`${environment.backend.url}/coopspaces/upload/${bucket}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
