//topic module

import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
    UserModule,
  ],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}
