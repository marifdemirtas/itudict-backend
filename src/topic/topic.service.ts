//topic service
//
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/schemas/comment.schema';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    private commentService: CommentService,
  ) {}

  //create topic
  async createTopic(createTopicDto: CreateTopicDto) {
    const createdTopic = new this.topicModel(createTopicDto);
    await createdTopic.save();
    const comment = await this.commentService.createComment({
      content: createTopicDto.content,
      owner: createTopicDto.owner,
      topicId: createdTopic._id,
    });
    createdTopic.comments.push(comment);
    await createdTopic.save();
    return createdTopic;
  }

  //get all topics
  async getAllTopics() {
    return await this.topicModel.find().exec();
  }

  async findById(id: string): Promise<TopicDocument> {
    return await this.topicModel.findById(id).exec();
  }

  // //get topic by id
  // async getTopicById(id: string) {
  //   return await this.topic
  //     .findById(id)
  //     .populate('owner')
  //     .populate('comments')
  //     .exec();
  // }
}
