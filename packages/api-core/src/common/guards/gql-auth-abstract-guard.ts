import {
  ContextType,
  ExecutionContext,
  Inject,
  mixin,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, IAuthGuard, Type } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import {
  AUTHENTICATION_COOKIE_NAME,
  AuthService,
  REFRESH_COOKIE_NAME,
  SID_COOKIE_NAME,
} from '../../auth/auth.service';
import { authCookieExtractor } from '../../auth/cookie-extractors';
import { SessionService } from '../../auth/session.service';
import { SessionEntity } from '../../tools/models/session.entity';
import { UsersService } from '../../users/users.service';

export const GqlAuthAbstractGuard: (type?: string | string[]) => Type<IAuthGuard> =
  createAuthGuard;

function createAuthGuard(type?: string | string[]): Type<IAuthGuard> {
  class MixinGqlAuthGuard extends AuthGuard(type) {
    constructor(
      @Inject(AuthService) private readonly authService: AuthService,
      private readonly usersService: UsersService,
      private readonly configService: ConfigService,
      private readonly sessionService: SessionService,
    ) {
      super();
    }

    getRequest(context: ExecutionContext) {
      const contextType = context.getType<ContextType & 'graphql'>();

      return contextType === 'http'
        ? context.switchToHttp().getRequest()
        : GqlExecutionContext.create(context).getContext().req;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const contextType = context.getType<ContextType & 'graphql'>();

      let request: Request;
      let response: Response;

      if (contextType === 'http') {
        request = context.switchToHttp().getRequest();
        response = context.switchToHttp().getResponse();
      }
      if (contextType === 'graphql') {
        request = GqlExecutionContext.create(context).getContext().req as Request;
        response = GqlExecutionContext.create(context).getContext().res as Response;
      }

      try {
        // We might be logged out in Neko but not here
        const authSidCookie = request.cookies[SID_COOKIE_NAME];
        const sidCookie = request.cookies['sid'];
        if (authSidCookie && sidCookie && authSidCookie !== sidCookie) {
          throw new Error('Neko/Nest logged state sync error');
        }

        const accessToken = ExtractJwt.fromExtractors([authCookieExtractor])(
          request,
        );
        const accessTokenPayload =
          accessToken && this.authService.getPayloadFromToken(accessToken);
        const isValidAccessToken = !!accessTokenPayload;
        if (isValidAccessToken) return this.activate(context);

        const refreshToken = request.cookies[REFRESH_COOKIE_NAME];
        if (!refreshToken)
          throw new UnauthorizedException('Refresh token is not set');
        const refreshTokenPayload = this.authService.getPayloadFromToken(
          refreshToken,
          true,
        );
        const isValidRefreshToken = !!refreshTokenPayload;
        if (!isValidRefreshToken)
          throw new UnauthorizedException('Refresh token is not valid');

        const user = await this.usersService.getUserIfRefreshTokenMatches(
          refreshToken,
          refreshTokenPayload.id,
        );

        const newAccessToken = this.authService.getAccessToken(user);
        const newRefreshToken =
          await this.authService.getRefreshTokenAndSaveItInUser(user);

        request.cookies[AUTHENTICATION_COOKIE_NAME] = newAccessToken;
        request.cookies[REFRESH_COOKIE_NAME] = newRefreshToken;

        response.cookie(AUTHENTICATION_COOKIE_NAME, newAccessToken, {
          maxAge: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
          httpOnly: true,
        });
        response.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
          maxAge: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
          httpOnly: true,
        });
        response.setHeader('Set-Cookie', [
          this.authService.getCookieWithJwtAccessToken(user, newAccessToken),
          await this.authService.getCookieWithJwtRefreshToken(user, newRefreshToken),
        ]);

        return this.activate(context);
      } catch (err) {
        // Test environment
        if (process.env.NODE_ENV === 'test') {
          return false;
        }

        response.clearCookie(AUTHENTICATION_COOKIE_NAME, {
          maxAge: 0,
          httpOnly: true,
        });
        response.clearCookie(REFRESH_COOKIE_NAME, {
          maxAge: 0,
          httpOnly: true,
        });

        // Logout in Haxe
        const sid = request.cookies[SID_COOKIE_NAME];
        let session: SessionEntity;
        session = sid && (await this.sessionService.getBySid(sid));

        if (session && session.uid) {
          await Promise.all([
            this.usersService.removeRefreshToken(session.uid),
            this.sessionService.delete(sid),
          ]);
        }

        response.clearCookie(SID_COOKIE_NAME, {
          maxAge: 0,
          httpOnly: true,
        });

        if (typeof type !== 'string') {
          // If one of the AuthGuard types is void, we don't want to return false
          // because we want to fallback to the void strategy.
          if (type.includes('void')) return this.activate(context);
        }
        return typeof contextType === 'string' ? false : this.activate(context);
      }
    }

    async activate(context: ExecutionContext): Promise<boolean> {
      return super.canActivate(context) as Promise<boolean>;
    }

    handleRequest(err: Error, user: any) {
      if (err || !user) {
        throw new UnauthorizedException();
      }

      return user;
    }
  }

  const guard = mixin(MixinGqlAuthGuard);
  return guard;
}
