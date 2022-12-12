import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import * as mongoose from 'mongoose';

export type UserDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop()
  content: string;

  @Prop()
  owner: User;

  @Prop()
  createdAt: Date;

  @Prop()
  likes: number;

  @Prop()
  dislikes: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  liked_by: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  disliked_by: User[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
