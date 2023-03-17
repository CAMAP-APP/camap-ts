import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups/groups.module';
import { SessionEntity } from '../tools/models/session.entity';
import { ToolsModule } from '../tools/tools.module';
import { UsersModule } from '../users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthBridgeController } from './controllers/auth-bridge.controller';
import { SessionService } from './session.service';
import { BridgeStrategy } from './strategies/bridge.strategy';
import { CookieStrategy } from './strategies/cookie.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VoidStrategy } from './strategies/void.strategy';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity]),
    PassportModule.register({
      defaultStrategy: ['jwt', 'cookie'],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          )}s`,
        },
      }),
    }),
    UsersModule,
    ToolsModule,
    forwardRef(() => GroupsModule),
  ],
  providers: [
    AuthService,
    CookieStrategy,
    JwtStrategy,
    VoidStrategy,
    BridgeStrategy,
    AuthResolver,
    SessionService,
  ],
  controllers: [AuthBridgeController],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
