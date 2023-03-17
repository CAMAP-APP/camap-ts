import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { CacheService } from '../tools/cache.service';
import { CryptoService } from '../tools/crypto.service';
import { VariableService } from '../tools/variable.service';
import { UserEntity } from '../users/models/user.entity';
import { UsersService } from '../users/users.service';
import {
  AUTHENTICATION_COOKIE_NAME,
  AuthService,
  REFRESH_COOKIE_NAME,
} from './auth.service';
import { SessionService } from './session.service';

// should be place somewhere else to be available to all tests?
jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

const CAMAP_KEY = 'md5key';

const JWT_ACCESS_TOKEN_EXPIRATION_TIME = 10;
const JWT_REFRESH_TOKEN_EXPIRATION_TIME = 100;

const MOCK_USER = {
  id: 1,
};

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findOneByEmail: () => {
      return MOCK_USER;
    },
    update: jest.fn(),
    create: (u: UserEntity) => u,
    setCurrentRefreshToken: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockSessionService = {
    getBySid: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockVariableService = {
    getInt: () => 1,
  };

  const mockCryptoService = {
    bcryptCompare: jest.fn(),
    md5: (s: string) => s,
    bcrypt: (s: string) => s,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'CAMAP_KEY') return CAMAP_KEY;
              if (key === 'JWT_ACCESS_TOKEN_EXPIRATION_TIME')
                return JWT_ACCESS_TOKEN_EXPIRATION_TIME;
              if (key === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME')
                return JWT_REFRESH_TOKEN_EXPIRATION_TIME;
            },
          },
        },
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: VariableService, useValue: mockVariableService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('If user is not found, should throw error', async () => {
      jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValueOnce(undefined as never);

      await expect(
        service.login('email@alilo.fr', 'password', '192.0.0.1', 'sid'),
      ).rejects.toThrow('wrongCredentials');
    });

    it('If is banned, should throw error', async () => {
      jest.spyOn(mockCacheService, 'get').mockResolvedValueOnce('5');

      await expect(
        service.login('email@alilo.fr', 'password', '192.0.0.1', 'sid'),
      ).rejects.toThrow('bruteForce');
    });

    it(`If password is correct, 
        Should update session and return updated user and cookie`, async () => {
      const mockJwtAccessToken = 'jwttoken';
      const mockJwtRefreshToken = 'wtrefreshtoken';
      jest.spyOn(service, 'isValidPassword').mockResolvedValueOnce(true);
      jest.spyOn(mockSessionService, 'getBySid').mockResolvedValueOnce({});
      jest.spyOn(mockJwtService, 'sign').mockReturnValueOnce(mockJwtAccessToken);
      jest.spyOn(mockJwtService, 'sign').mockReturnValueOnce(mockJwtRefreshToken);
      const dateSpy = jest.spyOn(global, 'Date');

      const result = await service.login(
        'email@alilo.fr',
        'password',
        '192.0.0.1',
        'sid',
      );
      const date = dateSpy.mock.instances[0];

      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockSessionService.update).toHaveBeenCalledTimes(1);
      expect(mockSessionService.update).toHaveBeenCalledWith({
        uid: 1,
        lastTime: date,
      });

      expect(mockUserService.update).toHaveBeenCalledWith({
        id: 1,
        ldate: date,
      });
      expect(result.user).toEqual({ id: MOCK_USER.id });
      expect(mockUserService.setCurrentRefreshToken).toHaveBeenCalled();
      expect(result.cookies.withAccessToken).toBe(
        `${AUTHENTICATION_COOKIE_NAME}=${mockJwtAccessToken}; HttpOnly; Path=/; Max-Age=${JWT_ACCESS_TOKEN_EXPIRATION_TIME}; Domain=undefined`,
      );
      expect(result.cookies.withRefreshToken).toBe(
        `${REFRESH_COOKIE_NAME}=${mockJwtRefreshToken}; HttpOnly; Path=/; Max-Age=${JWT_REFRESH_TOKEN_EXPIRATION_TIME}; Domain=undefined`,
      );
    });

    it('If password is wrong, should throw an error', async () => {
      await expect(
        service.login('email@alilo.fr', 'password', '192.0.0.1', 'sid'),
      ).rejects.toThrow('wrongPassword');
    });
  });

  describe('registerAndLogin', () => {
    it('If a user with this email already exists, should throw an error', async () => {
      await expect(
        service.registerAndLogin(
          'email@alilo.fr',
          'password',
          'firstname',
          'lastname',
          '192.0.0.1',
          'sid',
        ),
      ).rejects.toThrow('emailAlreadyRegistered');
    });

    it(`If there is no user with this email,
        Should create a user and login`, async () => {
      jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValueOnce(undefined as never);
      const mockLoginResult = {
        user: MOCK_USER as UserEntity,
        cookies: { withAccessToken: '' },
      };
      jest.spyOn(service, 'login').mockResolvedValueOnce(mockLoginResult);

      const userCreationSpy = jest.spyOn(mockUserService, 'create');

      const email = 'email@alilo.fr';
      const firstName = 'firstname';
      const lastName = 'lastname';

      const result = await service.registerAndLogin(
        email,
        'password',
        firstName,
        lastName,
        '192.0.0.1',
        'sid',
      );

      const createdUser: UserEntity = userCreationSpy.mock.results[0].value;

      expect(result).toEqual(mockLoginResult);

      expect(createdUser.email).toEqual(email);
      expect(createdUser.firstName).toEqual(firstName);
      expect(createdUser.lastName).toEqual(lastName);
      expect(createdUser.pass).toBeDefined();
      expect(createdUser.pass2).toBeDefined();
    });
  });

  describe('isValidPassword', () => {
    it('If bcrypt password is correct, should return true', async () => {
      const mockPassword = 'password';
      const bcryptEncryptedPassword = await service.hashPasswordWithBcrypt(
        mockPassword,
      );
      jest
        .spyOn(mockCryptoService, 'bcryptCompare')
        .mockResolvedValueOnce(Promise.resolve(true));

      const result = await service.isValidPassword(
        { pass2: bcryptEncryptedPassword } as UserEntity,
        mockPassword,
      );

      expect(result).toBe(true);
    });

    it(`If the bcrypt password is not correct but the MD5 password is correct,
        Should return true and set the bcrypt password`, async () => {
      const mockPassword = 'password';
      const md5EncryptedPassword = service.hashPasswordWithMD5(mockPassword);
      const bcryptPasswordSpy = jest.spyOn(service, 'hashPasswordWithBcrypt');
      jest
        .spyOn(mockCryptoService, 'bcryptCompare')
        .mockResolvedValueOnce(Promise.resolve(false));

      const result = await service.isValidPassword(
        { pass: md5EncryptedPassword, id: 1 } as UserEntity,
        mockPassword,
      );

      expect(result).toBe(true);

      const bcryptEncryptedPassword = await bcryptPasswordSpy.mock.results[0].value;

      expect(mockUserService.update).toHaveBeenCalledWith({
        id: 1,
        pass2: bcryptEncryptedPassword,
      });
    });

    it(`If both the bcrypt password and the MD5 password are not correct,
       Should return false`, async () => {
      jest
        .spyOn(mockCryptoService, 'bcryptCompare')
        .mockResolvedValueOnce(Promise.resolve(false));

      const result = await service.isValidPassword(
        { pass2: 'wrong', pass: 'alsoWrong' } as UserEntity,
        'mockPassword',
      );

      expect(result).toBe(false);
    });
  });

  describe('recordBadLogin', () => {
    it('Should increment and return the number of bad login', async () => {
      jest.spyOn(mockCacheService, 'get').mockResolvedValueOnce('1');
      const badLogin = await service.recordBadLogin('ip');
      expect(badLogin).toBe(2);
      expect(mockCacheService.set).toHaveBeenCalled();
    });
  });
});
