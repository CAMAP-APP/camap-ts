import { Strategy } from 'passport-cookie';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      cookieName: 'sid',
    });
  }

  async validate(sid: string) {
    return sid;
  }
}
