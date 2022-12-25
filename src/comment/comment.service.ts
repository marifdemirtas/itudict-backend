import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TopicService } from 'src/topic/topic.service';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private topicService: TopicService,
  ) {}
  //create comment
  async createComment(createCommentDto: CreateCommentDto, user: User) {
    const createdComment = new this.commentModel(createCommentDto);
    createdComment.owner = user;
    await createdComment.save();
    const topic = await this.topicService.findById(createCommentDto.topicId);
    topic.comments.push(createdComment);
    topic.comment_count = topic.comment_count + 1;
    await topic.save();
    return createdComment;
  }

  //get all comments
  async getAllComments() {
    return await this.commentModel.find().exec();
  }

  //get comments of user by email
  async getCommentsByEmail(email: string, page: number, limit: number) {
    return await this.commentModel
      .find({ owner: { email: email } })
      .skip(page * limit)
      .limit(limit)
      .exec();
  }

  //get paginated comments
  async getPaginatedComments(topicId: string, page: number, limit: number) {
    const count = await this.commentModel.countDocuments({
      topicId: { _id: topicId },
    });
    const comments = await this.commentModel
      .find({ topicId: { _id: topicId } })
      .skip(page * limit)
      .limit(limit)
      .exec();
    return { count, comments };
  }

  async getPaginatedByOwnerId(id: string, page: number, limit: number) {
    const count = await this.commentModel.countDocuments({
      owner: { _id: id },
    });
    const comments = await this.commentModel
      .find({ owner: { _id: id } })
      .skip(page * limit)
      .limit(limit)
      .exec();
    return { count, comments };
  }
}
