import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VoidStrategy extends PassportStrategy(Strategy, 'void') {
  async validate() {
    return -1;
  }
}
