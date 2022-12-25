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
    user.comments.push(comment);
    await user.save();
    return comment;
  }

  //get all comments
  @UseGuards(AccessTokenGuard)
  @Get('all')
  async getAllComments() {
    return await this.commentService.getAllComments();
  }

  //get comments by email
  @UseGuards(AccessTokenGuard)
  @Get(':email/:page/:limit')
  async getCommentsByEmail(@Req() req: Request) {
    //check if user is not banned
    if (req.user['banned'] == true)
      throw new HttpException('User is banned', HttpStatus.FORBIDDEN);
    const email = req.params.email;
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    return await this.commentService.getCommentsByEmail(email, page, limit);
  }

  //get paginated comments of topic
  @UseGuards(AccessTokenGuard)
  @Get(':topicId/:page/:limit')
  async getPaginatedComments(@Req() req: Request) {
    const topicId = req.params.topicId;
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    return await this.commentService.getPaginatedComments(topicId, page, limit);
  }
}
