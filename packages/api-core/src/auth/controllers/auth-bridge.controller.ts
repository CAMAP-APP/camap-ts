import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';

@UseGuards(AuthGuard('bridge'))
@Controller('bridge/auth')
export class AuthBridgeController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @Get('tokens/:id')
  async getTokenforUser(@Param('id') _userId: string) {
    if (!_userId) throw new BadRequestException(`param: userId required`);

    const user = await this.usersService.findOne(parseInt(_userId, 10));

    if (!user) {
      throw new NotFoundException();
    }

    return this.jwtService.sign({ email: user.email, id: user.id });
  }

  @Get('logout/:id')
  async logout(@Param('id') _userId: string) {
    if (!_userId) throw new BadRequestException(`param: userId required`);
    const user = await this.usersService.findOne(parseInt(_userId, 10));

    if (!user) {
      throw new NotFoundException();
    }

    await this.usersService.removeRefreshToken(user.id);

    return true;
  }

  @Get('delete-user/:id')
  async deleteUser(@Param('id') userId: string) {
    if (!userId) throw new BadRequestException(`param: userId required`);
    const user = await this.usersService.findOne(parseInt(userId, 10));

    if (!user) {
      throw new NotFoundException();
    }

    await this.usersService.delete(user);

    return true;
  }
}
