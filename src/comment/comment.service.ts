import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TopicService } from 'src/topic/topic.service';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private topicService: TopicService,
    private userService: UserService,
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
    const comments = await this.commentModel.find().populate('owner').exec();
    return comments;
  }

  //get comments of user by email
  async getCommentsByEmail(email: string, page: number, limit: number) {
    return await this.commentModel
      .find({ owner: { email: email } })
      .skip(page * limit)
      .limit(limit)
      .populate('owner')
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
      .populate('owner')
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
      .populate('owner')
      .exec();
    return { count, comments };
  }

  //find comment by id
  async findById(id: string): Promise<CommentDocument> {
    const comment = await this.commentModel
      .findOne({ _id: id })
      .populate('owner')
      .populate('liked_by')
      .populate('disliked_by')
      .exec();
    return comment;
  }

  //like comment
  // comment like count += 1
  // comment likedBy.push(userId)
  // user likedComments.push(commentId)
  async likeComment(id: string) {
    const comment = await this.findById(id);
    const user = await this.userService.findById(comment.owner['_id']);
    // if user already liked the comment
    console.log(comment.liked_by);
    if (comment.liked_by.find((liker) => liker['_id'] == user.id)) {
      return comment;
    }
    // if user already disliked the comment
    else if (comment.disliked_by.find((liker) => liker['_id'] == user.id)) {
      comment.dislikes = comment.dislikes - 1;
      comment.disliked_by = comment.disliked_by.filter(
        (user_) => user_['_id'] != user.id,
      );
    }
    comment.likes = comment.likes + 1;
    comment.liked_by.push(user);
    await comment.save();
    user.liked_comments.push(comment);
    await user.save();
    return comment;
  }

  async dislikeComment(id: string) {
    const comment = await this.findById(id);
    const user = await this.userService.findById(comment.owner['_id']);
    // if user already liked the comment
    if (comment.liked_by.find((liker) => liker['_id'] == user.id)) {
      comment.likes = comment.likes - 1;
      comment.liked_by = comment.liked_by.filter(
        (user_) => user_['_id'] != user.id,
      );
      // pull disliked comment from user liked_comments
      user.liked_comments = user.liked_comments.filter(
        (comment) => comment['_id'] != id,
      );
      await user.save();
    }
    // if user already disliked the comment
    else if (comment.disliked_by.find((liker) => liker['_id'] == user.id)) {
      return comment;
    }
    comment.dislikes = comment.dislikes + 1;
    comment.disliked_by.push(user);
    await comment.save();

    return comment;
  }
}
