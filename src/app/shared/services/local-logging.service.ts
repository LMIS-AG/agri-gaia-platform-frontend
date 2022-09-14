import { Injectable } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class LocalLoggingService extends LoggingService {
  public setUserId(userId: string): void {
    console.log(`Authenticated user id: ${userId}`);
  }

  public logException(exception: Error): void {
    console.error(exception);
  }

  public logDebug(message: string): void {
    console.log(`[DEBUG] ${message}`);
  }

  public logInfo(message: string): void {
    console.log(message);
  }

  public logWarn(message: string): void {
    console.warn(message);
  }

  public logError(message: string): void {
    console.error(message);
  }
}
