import { CallHandler, NestInterceptor } from '@nestjs/common';
import { retryWhen, take, tap } from 'rxjs/operators';

const DEADLOCK_ATTEMPT = 5;

/**
 * Interceptor for SQL deadlock management
 */
export class DeadlockInterceptor implements NestInterceptor {
  intercept(_, next: CallHandler) {
    return next.handle().pipe(
      retryWhen((errors) =>
        errors.pipe(
          tap((err) => {
            if (!this.isRetriableError(err)) {
              throw err;
            }
          }),
          take(DEADLOCK_ATTEMPT),
        ),
      ),
    );
  }

  private isRetriableError(err: any): boolean {
    const mysqlDeadlock = err.code === 'ER_LOCK_DEADLOCK';
    const postgresDeadlock = err.code === 'deadlock_detected';
    return mysqlDeadlock || postgresDeadlock;
  }
}
