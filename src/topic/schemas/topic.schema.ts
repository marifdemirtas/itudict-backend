import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Comment } from '../../comment/schemas/comment.schema';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// export type TopicDocument = HydratedDocument<Topic>;
export type TopicDocument = Topic & Document;

@Schema()
export class Topic {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    default: [],
  })
  comments: Comment[];

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ required: true, default: 0 })
  comment_count: number;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
