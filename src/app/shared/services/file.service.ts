import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { translate } from '@ngneat/transloco';
import { finalize, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UIService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient, private uiService: UIService) { }

  public uploadSub: Subscription | undefined; // TODO do i need this?

  public onFileSelected(event: any, bucket: string): void {

    const filesToUpload: File[] = event.target.files;

    if (filesToUpload && filesToUpload.length !== 0) {
      const formData = new FormData();

      for (let index = 0; index < filesToUpload.length; index++) {
        const file = filesToUpload[index];
        formData.append('files', file);
      }

      const upload$ = this.uploadAsset(bucket, formData).pipe(finalize(() => this.reset()));
      this.uploadSub = upload$.subscribe({
        complete: () => this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.uploadedFile')),
        error: () => this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.uploadFileError')),
      });
    }

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
