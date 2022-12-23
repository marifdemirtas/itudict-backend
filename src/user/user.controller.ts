import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { Query } from '@nestjs/common';
import { QueryMethod } from '@typegoose/typegoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  getUser(@Req() req: Request) {
    console.log(req);
    return req.user;
  }

  @Post('find')
  async find(@Body() user: LoginUserDto) {
    return this.userService.findByEmail(user.email);
  }

  @UseGuards(AccessTokenGuard)
  @Post('banUser')
  async banUser(@Req() req: Request, @Query() query) {
    const email_ = req.user['email'];
    const user = await this.userService.findByEmail(email_);
    if (user) {
      if (user.role === 'admin') {
        return this.userService.banUser(query.email);
      } else {
        throw new Error('User not authorized');
      }
    } else throw new Error('User not found');
  }

  @UseGuards(AccessTokenGuard)
  @Post('promoteUser')
  async promoteUser(@Req() req: Request, @Query() query) {
    const email_ = req.user['email'];
    const user = await this.userService.findByEmail(email_);
    if (user) {
      if (user.role === 'admin') {
        return this.userService.promoteUser(query.email);
      } else {
        throw new Error('User not authorized');
      }
    } else throw new Error('User not found');
  }

  @UseGuards(AccessTokenGuard)
  @Post('demoteUser')
  async demoteUser(@Req() req: Request, @Query() query) {
    const email_ = req.user['email'];
    const user = await this.userService.findByEmail(email_);
    if (user) {
      if (user.role === 'admin') {
        return this.userService.demoteUser(query.email);
      } else {
        throw new Error('User not authorized');
      }
    } else throw new Error('User not found');
  }

  @UseGuards(AccessTokenGuard)
  @Get('all')
  async getAll() {
    return this.userService.findAll();
  }
}
