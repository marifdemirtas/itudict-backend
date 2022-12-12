import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() user: CreateUserDto) {
    console.log(user);
    return this.userService.create(user);
  }

  @Post('login')
  async login(@Body() user: LoginUserDto) {
    console.log(user);
    user = await this.userService.findByEmail(user.email);
    if (user) {
      return user;
    } else {
      return 'User not found';
    }
  }
}
