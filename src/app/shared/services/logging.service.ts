import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
/**
 * Base class for a logging service. An implementation can be provided based on the environment.
 * (e.g. console for localhost / remote logging service for production)
 */
export abstract class LoggingService {
  /**
   * Sets the user id of the authenticated user so it can be used in log messages.
   * @param userId User Id.
   */
  abstract setUserId(userId: string): void;
  abstract logException(exception: Error): void;
  abstract logDebug(message: string): void;
  abstract logInfo(message: string): void;
  abstract logWarn(message: string): void;
  abstract logError(message: string): void;
}
