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

  async getPaginatedTopics(page: number, limit: number) {
    const count = await this.topicModel.countDocuments();
    const topics = await this.topicModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner')
      .exec();
    return { count, topics };
  }

  // delete comment from topic
  async deleteCommentFromTopic(commentId: string, topicId: string) {
    const topic = await this.findById(topicId);
    topic.comments = topic.comments.filter(
      (comment) => comment['id'] != commentId,
    ); // delete comment from topic
    const topic_ = await this.findById(topicId);

    topic.comment_count = topic.comment_count - 1; // decrement comment count
    await topic.save();
  }

  async filterPaginatedTopics(
    page: number,
    limit: number,
    filter: string,
  ): Promise<{ count: number; topics: TopicDocument[] }> {
    const count = await this.topicModel.countDocuments({
      title: { $regex: filter, $options: 'i' },
    });
    const topics = await this.topicModel
      .find({ title: { $regex: '.*' + filter + '.*', $options: 'i' } })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner')
      .populate('comments')
      .exec();
    return { count, topics };
  }
}
