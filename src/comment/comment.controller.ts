import {
  Body,
  Controller,
  Get,
  HttpCode,
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

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  //create comment
  @UseGuards(AccessTokenGuard)
  @Post('create')
  async createComment(
    @Req() req: Request,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.commentService.createComment(createCommentDto);
  }

  //get all comments
  @UseGuards(AccessTokenGuard)
  @Get('all')
  async getAllComments() {
    return await this.commentService.getAllComments();
  }

  //get comments by email
  @UseGuards(AccessTokenGuard)
  @Get('email')
  async getCommentsByEmail(@Req() req: Request) {
    //check if user is not banned
    if (req.user['banned'] == true)
      throw new HttpException('User is banned', HttpStatus.FORBIDDEN);
    return await this.commentService.getCommentsByEmail(req.user['email']);
  }

  // //get paginated comments of topic
  // @UseGuards(AccessTokenGuard)
  // @Get(':topicId/:page/:limit')
  // async getPaginatedComments(@Req() req: Request) {
  //   return await this.commentService.getPaginatedComments(req);
  // }
}
