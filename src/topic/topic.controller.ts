//topic controller
//
import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { UseGuards } from '@nestjs/common';
import { Role } from '../common/enum/role.enum';
import RoleGuard from '../common/guards/role.guard';
import { BannedGuard } from 'src/common/guards/banned.guard';

@Controller('topic')
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    private readonly userService: UserService,
  ) {}

  //create topic
  @UseGuards(AccessTokenGuard, BannedGuard, RoleGuard(Role.Senior))
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
      const topic = await this.topicService.createTopic(createTopicDto, user);
      user.topics.push(topic._id);
      await user.save();
      return topic;
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('latest')
  async getLatestTopics(@Req() req: Request) {
    try {
      return await this.topicService.getLatestTopics();
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('popular')
  async getPopularTopics(@Req() req: Request) {
    try {
      return await this.topicService.getPopularTopics();
    } catch (error) {
      console.log(error);
    }
  }
}
