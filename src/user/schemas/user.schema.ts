import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Comment } from '../../comment/schemas/comment.schema';
import { Topic } from '../../topic/schemas/topic.schema';
import * as mongoose from 'mongoose';
import { Role } from '../interfaces/role.interface';
import { Date } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  comments?: Comment[]; // Comments about the user

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  liked_comments?: Comment[]; // Liked comments

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }] })
  topics?: Topic[]; // Topics of the user

  @Prop({ required: true, default: Role.junior })
  role: string; // Role of the user

  @Prop({ required: true, type: Date, default: new Date() })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
