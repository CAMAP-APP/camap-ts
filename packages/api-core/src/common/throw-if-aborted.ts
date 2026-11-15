import { HttpException } from '@nestjs/common';

// Cancellation is expected when a user navigates away, not a server failure.
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new HttpException('User list count cancelled', 499);
}
