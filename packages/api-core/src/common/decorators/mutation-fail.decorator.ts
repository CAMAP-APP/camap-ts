import { CamapError } from '../errors/camap.error';
import { getCurrentTransaction } from '../utils';

export function MutationFail(catchedErrorType: string[]): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const original = descriptor.value;

    const catchError = <T extends CamapError>(error: T) => {
      if (
        error instanceof CamapError &&
        catchedErrorType.includes((error as CamapError).camaprErrorType as string)
      ) {
        getCurrentTransaction().rollbackTransaction();
        return error.toObj();
      }
      return null;
    };

    if (typeof original === 'function') {
      return {
        ...descriptor,
        async value(...args: any[]) {
          try {
            const res = await original.apply(this, [...args]);
            return res;
          } catch (error) {
            const catched = catchError(error);
            if (catched) return catched;
            throw error;
          }
        },
      };
    }

    return descriptor;
  };
}
