import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { setFlag } from '../common/haxeCompat';
import { CacheService } from '../tools/cache.service';
import { CryptoService } from '../tools/crypto.service';
import { VariableNames, VariableService } from '../tools/variable.service';
import { UserFlags } from '../users/models/user-flags';
import { UserEntity } from '../users/models/user.entity';
import { UsersService } from '../users/users.service';
import { SessionService } from './session.service';
import TokenPayload from './tokenPayload.interface';

export const AUTHENTICATION_COOKIE_NAME = 'Authentication';
export const REFRESH_COOKIE_NAME = 'Refresh';
export const SID_COOKIE_NAME = 'Auth_sid';

export type UserWrappedWithCookies = {
  user: Pick<UserEntity, 'id' | 'email'>;
  cookies: {
    withAccessToken: string;
    withRefreshToken?: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly variableService: VariableService,
    private readonly sessionService: SessionService,
    private readonly cryptoService: CryptoService,
  ) { }

  @Transactional()
  async login(
    email: string,
    password: string,
    ip: string,
    sid: string,
  ): Promise<UserWrappedWithCookies> {
    const user = await this.usersService.findOneByEmail(email, true);
    if (!user) throw new UnauthorizedException('wrongCredentials');

    // Anti bruteforce
    const isIpBanned = await this.isBanned(ip);
    if (isIpBanned) {
      throw new UnauthorizedException('bruteForce');
    }

    const isValidPassword = await this.isValidPassword(user, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('wrongPassword');
    }

    // Update user
    const newLdate = new Date();
    await this.usersService.update({
      id: user.id,
      ldate: newLdate,
    });

    // Update Haxe's session
    let session = await this.sessionService.getBySid(sid);
    if (!session) {
      throw new UnauthorizedException(`Session not found with sid ${sid}`);
    }
    session.uid = user.id;
    session.lastTime = newLdate;
    // TODO ?session.sdata.whichUser = (email == user.email) ? 0 : 1;
    await this.sessionService.update(session);

    return this.wrapUserWithJwt(user);
  }

  @Transactional()
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
    address1?: string,
    zipCode?: string,
    city?: string,
    email2?: string,
    firstName2?: string,
    lastName2?: string,
    phone2?: string,
  ): Promise<UserEntity> {
    let existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('emailAlreadyRegistered');
    }

    const user = new UserEntity();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.address1 = address1;
    user.zipCode = zipCode;
    user.city = city;
    user.email2 = email2 !== email ? email2 : undefined;
    user.firstName2 = firstName2;
    user.lastName2 = lastName2;
    user.phone2 = phone2;
    user.pass = this.hashPasswordWithMD5(password);
    user.pass2 = await this.hashPasswordWithBcrypt(password);
    user.flags = setFlag(UserFlags.HasEmailNotif24h, user.flags);
    user.lang = 'fr';

    return this.usersService.create(user);
  }

  @Transactional()
  async registerAndLogin(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    ip: string,
    sid: string,
    phone?: string,
    address1?: string,
    zipCode?: string,
    city?: string,
    email2?: string,
    firstName2?: string,
    lastName2?: string,
    phone2?: string,
  ): Promise<UserWrappedWithCookies> {
    const user = await this.register(
      email,
      password,
      firstName,
      lastName,
      phone,
      address1,
      zipCode,
      city,
      email2,
      firstName2,
      lastName2,
      phone2,
    );

    return this.login(user.email, password, ip, sid);
  }

  getPayloadFromToken(
    token: string,
    isRefreshToken = false,
  ): TokenPayload | undefined {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get(
          isRefreshToken ? 'JWT_REFRESH_TOKEN_SECRET' : 'JWT_ACCESS_TOKEN_SECRET',
        ),
      });
    } catch {
      return;
    }
  }

  @Transactional()
  async logout(sid: string, response: Response, currentUser?: UserEntity) {
    const promises: Promise<any>[] = [this.sessionService.delete(sid)];
    if (currentUser) {
      promises.push(this.usersService.removeRefreshToken(currentUser.id));
    }
    await Promise.all(promises);

    const logoutCookies = this.getCookiesForLogOut();
    response.setHeader('Set-Cookie', [
      logoutCookies[AUTHENTICATION_COOKIE_NAME],
      logoutCookies[REFRESH_COOKIE_NAME],
      logoutCookies[SID_COOKIE_NAME],
    ]);
  }

  private getCookiesForLogOut(): { [key: string]: string } {
    const cookies = {};
    cookies[AUTHENTICATION_COOKIE_NAME] = `${AUTHENTICATION_COOKIE_NAME}=; ${process.env.NODE_ENV !== 'development' ? 'HttpOnly;' : ''
      } Path=/; Max-Age=0; ${this.getDomainProperty()}`;
    cookies[REFRESH_COOKIE_NAME] = `${REFRESH_COOKIE_NAME}=; ${process.env.NODE_ENV !== 'development' ? 'HttpOnly;' : ''
      } Path=/; Max-Age=0; ${this.getDomainProperty()}`;
    cookies[SID_COOKIE_NAME] = `${SID_COOKIE_NAME}=; ${process.env.NODE_ENV !== 'development' ? 'HttpOnly;' : ''
      } Path=/; Max-Age=0; ${this.getDomainProperty()}`;
    return cookies;
  }

  async wrapUserWithJwt(
    user: Pick<UserEntity, 'id' | 'email'>,
    refresh = true,
  ): Promise<UserWrappedWithCookies> {
    const cookies: {
      withAccessToken: string;
      withRefreshToken?: string;
    } = {
      withAccessToken: this.getCookieWithJwtAccessToken(user),
    };
    if (refresh) {
      cookies.withRefreshToken = await this.getCookieWithJwtRefreshToken(user);
    }
    return {
      user,
      cookies,
    };
  }

  /** */
  getAccessToken(user: Pick<UserEntity, 'id' | 'email'>) {
    const payload: TokenPayload = { email: user.email, id: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });
  }

  getCookieWithJwtAccessToken(
    user: Pick<UserEntity, 'id' | 'email'>,
    accessToken?: string,
  ) {
    return `${AUTHENTICATION_COOKIE_NAME}=${accessToken || this.getAccessToken(user)
      }; ${process.env.NODE_ENV !== 'development' ? 'HttpOnly;' : ''
      } Path=/; Max-Age=${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}; ${this.getDomainProperty()}`;
  }

  @Transactional()
  async getRefreshTokenAndSaveItInUser(user: Pick<UserEntity, 'id' | 'email'>) {
    const payload: TokenPayload = { email: user.email, id: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });
    await this.usersService.setCurrentRefreshToken(token, user.id);
    return token;
  }

  @Transactional()
  async getCookieWithJwtRefreshToken(
    user: Pick<UserEntity, 'id' | 'email'>,
    refreshToken?: string,
  ) {
    const token = refreshToken || (await this.getRefreshTokenAndSaveItInUser(user));
    return `${REFRESH_COOKIE_NAME}=${token}; ${process.env.NODE_ENV !== 'development' ? 'HttpOnly;' : ''
      } Path=/; Max-Age=${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}; ${this.getDomainProperty()}`;
  }

  getAuthSidCookie(sid: string) {
    return `${SID_COOKIE_NAME}=${sid}; ${process.env.NODE_ENV !== 'development' ? 'HttpOnly;' : ''
      } Path=/; Max-Age=${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}; ${this.getDomainProperty()}`;
  }

  @Transactional()
  private async isBanned(ip: string) {
    const badTriesString = await this.getIpBan(ip);

    if (!badTriesString) return false;
    if (parseInt(badTriesString, 10) < 5) return false;

    return true;
  }

  @Transactional()
  async recordBadLogin(ip: string) {
    const badTriesString = await this.getIpBan(ip);
    let badTries = parseInt(badTriesString, 10) || 0;
    badTries += 1;
    await this.cacheService.set(
      this.getIpBanCacheName(ip),
      badTries.toString(),
      60 * 10,
    );
    return badTries;
  }

  hashPasswordWithMD5(password: string): string {
    return this.cryptoService.md5(password);
  }

  async hashPasswordWithBcrypt(password: string): Promise<string> {
    return this.cryptoService.bcrypt(password);
  }

  @Transactional()
  async isValidPassword(
    user: Pick<UserEntity, 'id' | 'pass' | 'pass2'>,
    plainTextPassword: string,
  ): Promise<boolean> {
    // First, check the Bcrypt password
    const isBcryptPasswordMatching =
      user.pass2 != "" && user.pass2 != null &&
      (await this.cryptoService.bcryptCompare(plainTextPassword, user.pass2));

    if (isBcryptPasswordMatching) return true;

    // Then, check the md5 password
    const isMD5PasswordMatching =
      this.hashPasswordWithMD5(plainTextPassword) === user.pass;

    if (!isMD5PasswordMatching) return false;

    // MD5 password is correct, we can encrypt it to Bcrypt and store it
    const pass2 = await this.hashPasswordWithBcrypt(plainTextPassword);
    await this.usersService.update({
      id: user.id,
      pass2,
    });

    return true;
  }

  private getDomainProperty = () => {
    if (process.env.NODE_ENV === 'development') return '';

    let host = this.configService.get('CAMAP_HOST');
    if (host?.startsWith('https://')) {
      host = host.slice(8);
    }

    return `Domain=${host}`;
  };

  @Transactional()
  private async getIpBan(ip: string) {
    return this.cacheService.get(this.getIpBanCacheName(ip));
  }

  private getIpBanCacheName(ip: string) {
    return `${CacheService.PREFIXES.ipBan}-${ip}`;
  }
}
