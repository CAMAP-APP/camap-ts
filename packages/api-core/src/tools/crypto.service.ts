import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as md5 from 'md5';

@Injectable()
export class CryptoService {
  key: string;

  constructor(private readonly configService: ConfigService) {
    this.key = this.configService.get<string>('CAMAP_KEY');
  }

  sha1(stringToHash: string) {
    return crypto
      .createHash('sha1')
      .update(`${this.key}${stringToHash}`)
      .digest('hex');
  }

  md5(stringToHash: string) {
    return md5(`${this.key}${stringToHash}`);
  }

  async bcrypt(stringToHash: string) {
    return bcrypt.hash(stringToHash, 10);
  }

  async bcryptCompare(stringToCompare: string, hashedString: string) {
    return bcrypt.compare(stringToCompare, hashedString);
  }
}
