import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TopicService } from 'src/topic/topic.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private topicService: TopicService,
  ) {}
  //create comment
  async createComment(createCommentDto: CreateCommentDto) {
    const createdComment = new this.commentModel(createCommentDto);
    await createdComment.save();
    const topic = await this.topicService.findById(createCommentDto.topicId);
    topic.comments.push(createdComment);
    await topic.save();
    return createdComment;
  }

  //get all comments
  async getAllComments() {
    return await this.commentModel.find().exec();
  }

  //get comments of user by email
  async getCommentsByEmail(email: string) {
    return await this.commentModel.find({ owner: { email: email } }).exec();
  }

  //get paginated comments
  async getPaginatedComments(topicId: string, page: number, limit: number) {
    return await this.commentModel
      .find({ topic: { _id: topicId } })
      .skip(page * limit)
      .limit(limit)
      .exec();
  }
}
