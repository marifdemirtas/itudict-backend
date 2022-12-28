//topic service
//
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { Comment } from 'src/comment/schemas/comment.schema';
import { User } from 'src/user/schemas/user.schema';
import { CommentService } from 'src/comment/comment.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @Inject(forwardRef(() => CommentService))
    private commentService: CommentService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
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
      .skip(page * limit)
      .limit(limit)
      .populate('owner')
      .exec();
    return { count, topics };
  }

  // delete comment from topic
  async deleteCommentFromTopic(commentId: string, topicId: string) {
    const topic = await this.findById(topicId);
    topic.comments = topic.comments.filter(
      (comment) => comment['_id'].toString() != commentId,
    ); // delete comment from topic
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

  // async deleteTopic(id: string) {
  //   // delete topic
  //   try {
  //     await this.topicModel.findByIdAndDelete(id);
  //   } catch (error) {}
  // }

  async deleteComments(topic) {
    for await (const comment of topic.comments) {
      await this.commentService.deleteComment(comment['_id'].toString());
    }
  }

  async deleteTopic(id: string) {
    // delete comments of topic
    // delete topic of user
    // delete topic
    try {
      const topic = await this.findById(id);
      // delete comments of user, topic, liked_bys etc.
      await this.deleteComments(topic);

      // delete topic of user
      await this.userService.deleteTopicFromUser(
        topic.owner['_id'].toString(),
        id,
      );

      // delete topic
      await this.topicModel.findByIdAndDelete(id);
    } catch (error) {}
  }
}
