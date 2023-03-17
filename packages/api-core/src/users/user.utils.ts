import { UserEntity } from './models/user.entity';
import { hasFlag } from '../common/haxeCompat';
import { UserFlags } from './models/user-flags';

export const userHasEmailNotif4h = (user: UserEntity) => {
  return hasFlag(UserFlags.HasEmailNotif4h, user.flags);
};

export const userHasEmailNotif24h = (user: UserEntity) => {
  return hasFlag(UserFlags.HasEmailNotif24h, user.flags);
};

export const userHasEmailNotifOuverture = (user: UserEntity) => {
  return hasFlag(UserFlags.HasEmailNotifOuverture, user.flags);
};
