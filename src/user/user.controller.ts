import { Controller, Post, Body, Get } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { Query } from '@nestjs/common';
import RoleGuard from 'src/common/guards/role.guard';
import { Role } from 'src/common/enum/role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  getUser(@Req() req: Request) {
    console.log(req);
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
      if (user.role === 'admin') {
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
    if (user) {
      if (user.role === 'admin') {
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
      if (user.role === 'admin') {
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
  @Get('filter/:key/:page/:limit')
  async getPaginatedUsers(@Req() req: Request) {
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    const key = req.params.key;
    return await this.userService.filterPaginatedUsers(page, limit, key);
  }
}
