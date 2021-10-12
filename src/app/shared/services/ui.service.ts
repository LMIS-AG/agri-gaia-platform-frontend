import { Injectable } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateHotToastRef, HotToastService, ObservableMessages, ToastOptions } from '@ngneat/hot-toast';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../components/confirm-dialog/confirm-dialog.component';

export interface ConfirmDialogOptions {
  confirmButtonColor: ThemePalette;
  buttonLabels: 'confirm' | 'yesno';
  confirmationText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UIService {
  constructor(
    private dialog: MatDialog,
    private hotToastService: HotToastService,
    private translateService: TranslocoService
  ) {}

  /**
   * Translates the message if the parameter is a valid message key.
   * The behaviour is similar to TranslocoService.translate,
   * but this method will not log an error if the key does not exist
   * so it can work with message keys as well as already translated messages.
   * @param message The message or message key.
   * @returns The translatest message or the passed value if no translation exists.
   */
  private translate(message: string): string {
    const translation: Translation = this.translateService.getTranslation(this.translateService.getActiveLang());
    return translation[message] || message;
  }

  private getMessageText(message: string | undefined, defaultMessage: string): string {
    return !!message ? this.translate(message) : this.translate(defaultMessage);
  }

  public showSuccessMessage<DataType>(
    message?: string,
    options?: ToastOptions<DataType>
  ): CreateHotToastRef<DataType | unknown> {
    const messageText = this.getMessageText(message, 'common.successMessage');
    return this.hotToastService.success(messageText, options);
  }

  public showErrorMessage<DataType>(
    message?: string,
    options?: ToastOptions<DataType>
  ): CreateHotToastRef<DataType | unknown> {
    const messageText = this.getMessageText(message, 'common.errorMessage');
    return this.hotToastService.error(messageText, options);
  }

  public showInfoMessage<DataType>(
    message: string,
    options?: ToastOptions<DataType>
  ): CreateHotToastRef<DataType | unknown> {
    return this.hotToastService.info(this.translate(message), options);
  }

  public showWarningMessage<DataType>(
    message: string,
    options?: ToastOptions<DataType>
  ): CreateHotToastRef<DataType | unknown> {
    return this.hotToastService.warning(this.translate(message), options);
  }

  public showLoadingMessage<DataType>(
    message: string,
    options?: ToastOptions<DataType>
  ): CreateHotToastRef<DataType | unknown> {
    return this.hotToastService.loading(this.translate(message), options);
  }

  public showMessage<DataType>(
    message: string,
    options?: ToastOptions<DataType>
  ): CreateHotToastRef<DataType | unknown> {
    return this.hotToastService.show(this.translate(message), options);
  }

  public showObserveMessages<T, DataType>(
    messages: ObservableMessages<T, DataType>
  ): (source: Observable<T>) => Observable<T> {
    return this.hotToastService.observe(messages);
  }

  public confirm(title: string, message: string, options?: ConfirmDialogOptions): Observable<boolean> {
    if (!options) {
      options = { buttonLabels: 'yesno', confirmButtonColor: 'primary' };
    }

    const dialogData = new ConfirmDialogModel(title, message, options);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
    });

    return dialogRef.afterClosed();
  }

  public confirmDiscardingUnsavedChanges(): Observable<boolean> {
    return this.confirm(
      this.translate('common.unsavedChanges.headline'),
      this.translate('common.unsavedChanges.question')
    );
  }
}
