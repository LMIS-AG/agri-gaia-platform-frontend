import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-generate-keys-dialog',
  templateUrl: './generate-keys-dialog.component.html',
})
export class GenerateKeysDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GenerateKeysDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  public copyCode(): void {
    const accessKey = this.data.accessKey;
    const secretKey = this.data.secretKey;
    const sessionToken = this.data.sessionToken;
    const code = `from minio import Minio
    
client = Minio("minio-test-api.platform.agri-gaia.com",
    access_key="${accessKey}",
    secret_key="${secretKey}",
    session_token="${sessionToken}")
    
# Test connection and list accessible buckets
client.list_buckets()`;

    // Copy the code to the clipboard
    navigator.clipboard.writeText(code).then(() => {
      const config = new MatSnackBarConfig();
      config.verticalPosition = 'top';
      config.horizontalPosition = 'center';
      config.duration = 3000; // Set the duration for the message to be displayed
      // Open the snackbar with the given config
      this.snackBar.open('Der Code wurde erfolgreich in die Zwischenablage kopiert!', '', config);
    });
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
