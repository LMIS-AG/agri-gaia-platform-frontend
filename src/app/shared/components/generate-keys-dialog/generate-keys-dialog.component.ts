import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-generate-keys-dialog',
  templateUrl: './generate-keys-dialog.component.html',
  styleUrls: ['./generate-keys-dialog.component.css']
})

export class GenerateKeysDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GenerateKeysDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  copyCode(): void {
    const accessKey = this.data.accessKey;
    const secretKey = this.data.secretKey;
    const sessionToken = this.data.sessionToken;
    const code = `client = Minio("minio-test-api.platform.agri-gaia.com",
    access_key="${accessKey}",
    secret_key="${secretKey}",
    session_token="${sessionToken}")
    
# Test connection and list accessible buckets
client.list_buckets()`;
    // Copy the code to the clipboard
    navigator.clipboard.writeText(code);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}