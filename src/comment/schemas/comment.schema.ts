import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Topic } from '../../topic/schemas/topic.schema';

// export type CommentDocument = HydratedDocument<Comment>;
export type CommentDocument = Comment & Document;

@Schema()
export class Comment {
  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop()
  topicId: string;

  @Prop({ required: true, default: Date.now })
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
