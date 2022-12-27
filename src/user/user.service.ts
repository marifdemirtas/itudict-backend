import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcyrpt from 'bcrypt';
import { DocumentType } from '@typegoose/typegoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './interfaces/role.interface';
import internal from 'stream';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    const a = createdUser._id;
    createdUser.role = Role.junior;
    createdUser.comments = [];
    createdUser.topics = [];
    createdUser.save();
    return createdUser;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({
      email: email,
    });
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find({ banned: false, role: { $ne: 'admin' } })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async findByUsername(username: string): Promise<User> {
    return this.userModel.findOne({
      username: username,
    });
  }

  async banUser(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (user) {
      user.banned = !user.banned;
      await user.save();
      return user;
    } else {
      throw new Error('User not found');
    }
  }

  async promoteUser(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (user) {
      user.role = 'Senior';
      await user.save();
      return user;
    } else {
      throw new Error('User not found');
    }
  }

  async demoteUser(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (user) {
      user.role = 'Junior';
      await user.save();
      return user;
    } else {
      throw new Error('User not found');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<UserDocument> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async filterPaginatedUsers(
    page: number,
    limit: number,
    key: string,
  ): Promise<User[]> {
    return this.userModel
      .find({
        role: { $ne: 'admin' },
        username: { $regex: '.*' + key + '.*', $options: 'i' },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  // delete comment from liked comments with given comment and user id
  async deleteCommentFromLikedComments(
    commentId: string,
    userId: string,
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.liked_comments = user.liked_comments.filter((comment) => {
      console.log(comment['id']);
      console.log(commentId);
      comment['id'] != commentId;
    });
    await user.save();
    return user;
  }

  // delete comment from user comments with given comment and user id
  async deleteCommentFromUserComments(
    commentId: string,
    userId: string,
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.comments = user.comments.filter((comment) => {
      comment['id'] != commentId;
    });
    await user.save();
    return user;
  }
}
