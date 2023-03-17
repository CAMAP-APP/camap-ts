// eslint-disable-next-line max-classes-per-file
import { CamapError } from '../common/errors/camap.error';

export enum UserErrorType {
  MailAlreadyInUse = 'MailAlreadyInUse',
  UserNotFound = 'UserNotFound',
}

export class UpdateUserMailAlreadyInUse extends CamapError {
  constructor() {
    super(UserErrorType.MailAlreadyInUse);
  }
}

export class UserNotFound extends CamapError {
  constructor(public readonly userId: number) {
    super(UserErrorType.UserNotFound);
  }
}
