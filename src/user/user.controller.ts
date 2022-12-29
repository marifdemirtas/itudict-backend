import { Controller, Post, Body, Get } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { Query } from '@nestjs/common';
import RoleGuard from '../common/guards/role.guard';
import { Role } from '../common/enum/role.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  getUser(@Req() req: Request) {
    return req.user;
  }

  @Get('find/:email')
  async find(@Req() req: Request) {
    const email_ = req.params.email;
    return this.userService.findByEmail(email_);
  }

  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(AccessTokenGuard)
  @Post('banUser')
  async banUser(@Req() req: Request, @Query() query) {
    const email_ = req.user['email'];
    const user = await this.userService.findByEmail(email_);
    if (user) {
      if (user.role === Role.Admin) {
        return this.userService.banUser(query.email);
      } else {
        throw new Error('User not authorized');
      }
    } else throw new Error('User not found');
  }

  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(AccessTokenGuard)
  @Post('promoteUser')
  async promoteUser(@Req() req: Request, @Query() query) {
    const email_ = req.user['email'];
    const user = await this.userService.findByEmail(email_);
    console.log(user);
    if (user) {
      if (user.role === Role.Admin) {
        return this.userService.promoteUser(query.email);
      } else {
        throw new Error('User not authorized');
      }
    } else throw new Error('User not found');
  }

  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(AccessTokenGuard)
  @Post('demoteUser')
  async demoteUser(@Req() req: Request, @Query() query) {
    const email_ = req.user['email'];
    const user = await this.userService.findByEmail(email_);
    if (user) {
      if (user.role === Role.Admin) {
        return this.userService.demoteUser(query.email);
      } else {
        throw new Error('User not authorized');
      }
    } else throw new Error('User not found');
  }

  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(AccessTokenGuard)
  @Get('all')
  async getAll() {
    return this.userService.findAll();
  }

  //get paginated users
  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(AccessTokenGuard)
  @Get('filter/:page/:limit')
  async getPaginatedUsers(@Req() req: Request, @Query() query) {
    const key = query.key;
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    return await this.userService.filterPaginatedUsers(page, limit, key);
  }
}
