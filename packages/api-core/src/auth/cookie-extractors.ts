import { Request } from 'express';
import { AUTHENTICATION_COOKIE_NAME } from './auth.service';

export const authCookieExtractor = (req: Request) => {
  return req?.cookies[AUTHENTICATION_COOKIE_NAME];
};
