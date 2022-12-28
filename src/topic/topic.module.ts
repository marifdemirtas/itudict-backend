//topic module

import { forwardRef, Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { UserModule } from 'src/user/user.module';
import { CommentModule } from 'src/comment/comment.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [TopicController],
  providers: [
    TopicService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [TopicService],
})
export class TopicModule {}
