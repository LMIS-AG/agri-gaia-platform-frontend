import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoggingService } from '../services/logging.service';
import { UIService } from '../services/ui.service';
import { toTranslatableCamelCase } from '../utils/string-utils';
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private uiService: UIService, private loggingService: LoggingService, private router: Router) {}

  public handleError(error: any): void {
    const ignoreError = this.handleErrorTypes(error);
    if (!ignoreError) {
      this.loggingService.logException(error);
    } else {
      console.error(error);
    }
  }

  /**
   * Handle the error depending on the error type
   * @param error The error thrown in the application
   * @returns true if the error should not be reported e.g. to a remote logging service.
   */
  private handleErrorTypes(error: any): boolean {
    // Unwrap promise exceptions
    while (error.rejection) {
      error = error.rejection;
    }

    switch (error.name) {
      case 'HttpErrorResponse':
        return this.handleHttpError(error);
    }

    return false;
  }

  private handleHttpError(error: any): boolean {
    let translationKey: string;
    let ignoreError = false;

    if (error.status === 0) {
      translationKey = 'error.connection';
      ignoreError = true;
    } else if (error.status === 400) {
      console.log(error);
      translationKey = `error.${toTranslatableCamelCase(error.error.errorCode)}`;
    } else if (error.status === 401) {
      translationKey = 'error.unauthorized';
      ignoreError = true;
    } else if (error.status === 403) {
      translationKey = 'error.forbidden';
      ignoreError = true;
    } else if (error.status === 404) {
      translationKey = 'error.notFound';
      ignoreError = true;
      this.router.navigateByUrl('/');
    } else if (error.status === 500) {
      translationKey = 'error.server';
      ignoreError = true;
    } else {
      translationKey = 'error.http';
    }

    this.uiService.showErrorMessage(translationKey);

    return ignoreError;
  }
}
