import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
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
  public abstract setUserId(userId: string): void;

  public abstract logException(exception: Error): void;

  public abstract logDebug(message: string): void;

  public abstract logInfo(message: string): void;

  public abstract logWarn(message: string): void;

  public abstract logError(message: string): void;
}
