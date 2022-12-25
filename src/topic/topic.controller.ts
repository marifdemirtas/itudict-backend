//topic controller
//
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CommentService } from 'src/comment/comment.service';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { UseGuards } from '@nestjs/common';
import { Role } from '../common/enum/role.enum';

@Controller('topic')
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
  ) {}

  //create topic
  @UseGuards(AccessTokenGuard)
  @Post('create')
  async createTopic(
    @Req() req: Request,
    @Body() createTopicDto: CreateTopicDto,
  ) {
    try {
      const email = req.user['email'];
      const user = await this.userService.findByEmail(email);
      if (user['banned'] == true || user['role'] != Role.Senior)
        throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
      return await this.topicService.createTopic(createTopicDto);
    } catch (error) {
      console.log(error);
    }
  }
}
