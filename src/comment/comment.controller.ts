import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { HttpException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Controller('comment')
export class CommentController {
  constructor(
    private commentService: CommentService,
    private userService: UserService,
  ) {}
  //create comment
  @UseGuards(AccessTokenGuard)
  @Post('create')
  async createComment(
    @Req() req: Request,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const email = req.user['email'];
    const user = await this.userService.findByEmail(email);
    const comment = await this.commentService.createComment(
      createCommentDto,
      user,
    );
    user.comments.push(comment._id);
    await user.save();
    return comment;
  }

  //get all comments
  @UseGuards(AccessTokenGuard)
  @Get('all/:page/:limit')
  async getAllComments(@Req() req: Request) {
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    return await this.commentService.getAllComments(page, limit);
  }

  //get comments by email
  @UseGuards(AccessTokenGuard)
  @Get('owner/:owner/:page/:limit')
  async getCommentsByOwnerId(@Req() req: Request) {
    //check if user is not banned
    if (req.user['banned'] == true)
      throw new HttpException('User is banned', HttpStatus.FORBIDDEN);
    const id = req.params.owner;
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    return await this.commentService.getPaginatedByOwnerId(id, page, limit);
  }

  //get paginated comments of topic
  @UseGuards(AccessTokenGuard)
  @Get('topic/:topicId/:page/:limit')
  async getPaginatedComments(@Req() req: Request) {
    const topicId = req.params.topicId;
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    return await this.commentService.getPaginatedComments(topicId, page, limit);
  }

  //like comment
  // comment like count += 1
  // comment likedBy.push(userId)
  // user likedComments.push(commentId)
  @UseGuards(AccessTokenGuard)
  @Post('like/:commentId')
  async likeComment(@Req() req: Request) {
    const commentId = req.params.commentId;
    return await this.commentService.likeComment(commentId);
  }

  @UseGuards(AccessTokenGuard)
  @Post('dislike/:commentId')
  async dislikeComment(@Req() req: Request) {
    const commentId = req.params.commentId;
    return await this.commentService.dislikeComment(commentId);
  }
}
