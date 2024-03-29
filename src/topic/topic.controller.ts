//topic controller
//
import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { UseGuards } from '@nestjs/common';
import { Role } from '../common/enum/role.enum';
import RoleGuard from '../common/guards/role.guard';
import { BannedGuard } from '../common/guards/banned.guard';

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

  @UseGuards(AccessTokenGuard)
  @Get('paginated/:page/:limit')
  async getPaginatedTopics(@Req() req: Request) {
    try {
      const page = parseInt(req.params.page);
      const limit = parseInt(req.params.limit);
      return await this.topicService.getPaginatedTopics(page, limit);
    } catch (error) {
      console.log(error);
    }
  }

  //get paginated topics for admin
  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(AccessTokenGuard)
  @Get('filter/:page/:limit')
  async filterPaginatedTopics(@Req() req: Request, @Query() query) {
    const key = query.key;
    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    return await this.topicService.filterPaginatedTopics(page, limit, key);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('delete/:id')
  async deleteTopic(@Req() req: Request) {
    try {
      const id = req.params.id;
      await this.topicService.deleteTopic(id);
      return { message: 'Topic deleted' };
    } catch (error) {
      console.log(error);
    }
  }
}
