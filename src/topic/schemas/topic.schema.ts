import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Comment } from '../../comment/schemas/comment.schema';
import * as mongoose from 'mongoose';

export type TopicDocument = HydratedDocument<Topic>;

@Schema()
export class Topic {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  createdBy: User;

  @Prop({ required: true })
  comment_count: number;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
