const CAMAP_ERROR_NAME = 'CamapError';

export class CamapError<TErrorType = string> extends Error {
  constructor(public readonly camaprErrorType: TErrorType) {
    super(camaprErrorType as unknown as string);
    this.name = CAMAP_ERROR_NAME;
  }

  toObj() {
    return JSON.parse(JSON.stringify(this));
  }
}
