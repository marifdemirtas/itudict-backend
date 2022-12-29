import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './interfaces/role.interface';
import { WrongItuEmail } from '../common/exceptions/itu-email.exception';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  checkITUMailRegex(email: string): boolean {
    const ituMailRegex = new RegExp('^[a-zA-Z0-9_.+-]+@itu.edu.tr$', 'i');
    return ituMailRegex.test(email);
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      if (
        createUserDto?.email === null ||
        createUserDto?.password === null ||
        createUserDto?.username === null ||
        createUserDto?.passwordConfirm === null ||
        createUserDto?.password !== createUserDto?.passwordConfirm ||
        createUserDto?.username.length < 2 ||
        createUserDto?.password.length < 6
      ) {
        throw new Error('Invalid user information');
      }
      if (!this.checkITUMailRegex(createUserDto?.email)) {
        throw new WrongItuEmail();
      }
      const createdUser = new this.userModel(createUserDto);
      createdUser.role = Role.junior;
      createdUser.comments = [];
      createdUser.topics = [];
      createdUser.save();
      return createdUser;
    } catch (e) {
      throw e;
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({
      email: email,
    });
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find({ banned: false, role: { $ne: 'Admin' } })
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
  ): Promise<any> {
    const count = await this.userModel
      .find({
        banned: false,
        role: { $ne: 'Admin' },
        username: { $regex: '.*' + key + '.*', $options: 'i' },
      })
      .countDocuments();
    const users = await this.userModel
      .find({
        banned: false,
        role: { $ne: 'Admin' },
        username: { $regex: '.*' + key + '.*', $options: 'i' },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    return { count, users };
  }

  // delete comment from liked comments with given comment and user id
  async deleteCommentFromLikedComments(
    commentId: string,
    userId: string,
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    const res = user.liked_comments.filter((comment) => {
      return comment['_id'].toString() != commentId;
    });
    user.liked_comments = res;
    await user.save();
    return user;
  }

  // delete comment from user comments with given comment and user id
  async deleteCommentFromUserComments(
    commentId: string,
    userId: string,
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    const res = user.comments.filter((comment) => {
      return comment['_id'].toString() != commentId;
    });
    user.comments = res;
    await user.save();
    return user;
  }

  async deleteTopicFromUser(
    userId: string,
    topicId: string,
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.topics = user.topics.filter((topic) => {
      topic['_id'].toString() != topicId;
    });
    await user.save();
    return user;
  }
}
