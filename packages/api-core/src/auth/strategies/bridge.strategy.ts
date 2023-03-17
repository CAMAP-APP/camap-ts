import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class BridgeStrategy extends PassportStrategy(Strategy, 'bridge') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async validate(key: string) {
    return key === this.configService.get<string>('CAMAP_KEY');
  }
}
