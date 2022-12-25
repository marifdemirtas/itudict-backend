//topic service
//
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { Comment } from 'src/comment/schemas/comment.schema';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  //create topic
  async createTopic(createTopicDto: CreateTopicDto, user: User) {
    const createdTopic = new this.topicModel(createTopicDto);
    createdTopic.owner = user;
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

  async addCommentToTopic(topicId: string, comment: Comment) {
    const topic = await this.findById(topicId);
    topic.comments.push(comment);
    await topic.save();
    return topic;
  }

  async getLatestTopics() {
    return await this.topicModel
      .find()
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async getPopularTopics() {
    return await this.topicModel
      .find()
      .sort({ comment_count: -1 })
      .limit(20)
      .exec();
  }

  //get topic by id
  async getTopicById(id: string) {
    return await this.topicModel
      .findById(id)
      .populate('owner')
      .populate('comments')
      .exec();
  }
}
