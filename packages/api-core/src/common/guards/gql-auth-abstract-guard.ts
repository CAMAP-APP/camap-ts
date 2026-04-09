import {
  ContextType,
  ExecutionContext,
  Inject,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
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

// Factory Nest pour créer dynamiquement un AuthGuard compatible GraphQL
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

    /**
     * Méthode standard Nest pour récupérer la request
     * → utilisée par passport
     */
    getRequest(context: ExecutionContext) {
      const contextType = context.getType<ContextType & 'graphql'>();

      return contextType === 'http'
        ? context.switchToHttp().getRequest()
        : GqlExecutionContext.create(context).getContext().req;
    }

    /**
     * Helper interne pour récupérer request + response
     * compatible HTTP et GraphQL
     */
    private getReqRes(context: ExecutionContext): {
      request: Request;
      response: Response;
      contextType: ContextType | 'graphql';
    } {
      const contextType = context.getType<ContextType & 'graphql'>();

      if (contextType === 'http') {
        return {
          request: context.switchToHttp().getRequest<Request>(),
          response: context.switchToHttp().getResponse<Response>(),
          contextType,
        };
      }

      const gqlContext = GqlExecutionContext.create(context).getContext();

      return {
        request: gqlContext.req as Request,
        response: gqlContext.res as Response,
        contextType,
      };
    }

    /**
     * Vérifie que le cookie SID côté Neko et Nest sont synchronisés
     * → évite les états incohérents entre front et API
     */
    private checkSidSync(request: Request): void {
      const authSidCookie = request.cookies?.[SID_COOKIE_NAME];
      const sidCookie = request.cookies?.['sid'];

      if (authSidCookie && sidCookie && authSidCookie !== sidCookie) {
        throw new Error('Neko/Nest logged state sync error');
      }
    }

    /**
     * Écrit les cookies d'authentification
     * IMPORTANT :
     * - ne rien faire si headers déjà envoyés (sinon ERR_HTTP_HEADERS_SENT)
     */
    private setAuthCookies(
      response: Response | undefined,
      accessToken: string,
      refreshToken: string,
    ): void {
      if (!response || response.headersSent) {
        return;
      }

      response.cookie(AUTHENTICATION_COOKIE_NAME, accessToken, {
        maxAge: this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        httpOnly: true,
      });

      response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        maxAge: this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        httpOnly: true,
      });
    }

    /**
     * Supprime les cookies d'auth
     * → utilisé en cas d'erreur / logout
     */
    private clearAuthCookies(response: Response | undefined): void {
      if (!response || response.headersSent) {
        return;
      }

      response.clearCookie(AUTHENTICATION_COOKIE_NAME, {
        maxAge: 0,
        httpOnly: true,
      });

      response.clearCookie(REFRESH_COOKIE_NAME, {
        maxAge: 0,
        httpOnly: true,
      });

      response.clearCookie(SID_COOKIE_NAME, {
        maxAge: 0,
        httpOnly: true,
      });
    }

    /**
     * Nettoyage serveur des sessions + refresh tokens
     * → logout complet côté backend
     */
    private async handleLogout(request: Request): Promise<void> {
      const sid = request.cookies?.[SID_COOKIE_NAME];
      if (!sid) {
        return;
      }

      const session: SessionEntity | undefined = await this.sessionService.getBySid(sid);
      if (!session?.uid) {
        return;
      }

      await Promise.all([
        this.usersService.removeRefreshToken(session.uid),
        this.sessionService.delete(sid),
      ]);
    }

    /**
     * Méthode principale du guard
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const { request, response } = this.getReqRes(context);

      try {
        // 1. Vérification cohérence session
        this.checkSidSync(request);

        // 2. Tentative via access token (cas nominal)
        const accessToken = ExtractJwt.fromExtractors([authCookieExtractor])(request);
        const accessTokenPayload =
          accessToken && this.authService.getPayloadFromToken(accessToken);

        if (accessTokenPayload) {
          return this.activate(context);
        }

        // 3. Fallback via refresh token
        const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];
        if (!refreshToken) {
          throw new UnauthorizedException('Refresh token is not set');
        }

        const refreshTokenPayload = this.authService.getPayloadFromToken(
          refreshToken,
          true,
        );

        if (!refreshTokenPayload) {
          throw new UnauthorizedException('Refresh token is not valid');
        }

        // 4. Vérification user + refresh token
        const user = await this.usersService.getUserIfRefreshTokenMatches(
          refreshToken,
          refreshTokenPayload.id,
        );

        // 5. Génération nouveaux tokens
        const newAccessToken = this.authService.getAccessToken(user);
        const newRefreshToken =
          await this.authService.getRefreshTokenAndSaveItInUser(user);

        // 6. Mise à jour côté request (important pour la suite du pipeline)
        request.cookies[AUTHENTICATION_COOKIE_NAME] = newAccessToken;
        request.cookies[REFRESH_COOKIE_NAME] = newRefreshToken;

        // 7. Écriture cookies HTTP
        this.setAuthCookies(response, newAccessToken, newRefreshToken);

        return this.activate(context);
      } catch (err) {
        // Cas spécifique test
        if (process.env.NODE_ENV === 'test') {
          return false;
        }

        // Nettoyage backend
        await this.handleLogout(request);

        // Nettoyage cookies client
        this.clearAuthCookies(response);

        // Cas fallback strategy "void"
        if (Array.isArray(type) && type.includes('void')) {
          return this.activate(context);
        }

        return false;
      }
    }

    /**
     * Délègue au AuthGuard passport
     */
    async activate(context: ExecutionContext): Promise<boolean> {
      return super.canActivate(context) as Promise<boolean>;
    }

    /**
     * Gestion du résultat final du guard
     */
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