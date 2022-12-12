import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
