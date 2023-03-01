import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

export class BucketOperations  {
    public uploadSub: Subscription | undefined; // TODO do i need this?

    public onFileSelected(event: any): FormData | null {

        const filesToUpload: File[] = event.target.files;

        if (filesToUpload && filesToUpload.length !== 0) {
        const formData = new FormData();

        for (let index = 0; index < filesToUpload.length; index++) {
            const file = filesToUpload[index];
            formData.append('files', file);
        }
        return formData
      }
      return null
    }

    // TODO use this later when adding progress bar in order to make it possibel to cancel the upload
    public cancelUpload(): void {
        this.uploadSub!.unsubscribe(); // TODO check if this causes erros
        this.reset();
    }

    public reset(): void {
        this.uploadSub = undefined;
    }
}
