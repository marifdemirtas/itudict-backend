import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly users: User[] = [];

  create(user: User) {
    this.users.push(user);
    console.log(this.users);
  }

  findAll(): User[] {
    return this.users;
  }

  login(user: LoginUserDto) {
    // check if user with the same email exists
    const var_ = this.users.find((u) => u.email === user.email);
    console.log(var_);
    return var_;
  }
}
