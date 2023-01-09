import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import RoleGuard from '../common/guards/role.guard';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CommentService } from '../comment/comment.service';
import { Comment, CommentSchema } from '../comment/schemas/comment.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Topic, TopicSchema } from '../topic/schemas/topic.schema';
import { TopicService } from '../topic/topic.service';
import { TopicDtoStub } from '../../test/stubs/topic.dto';
import { UserDtoStub } from '../../test/stubs/user.dto';
import { CommentDtoStub } from '../../test/stubs/comment.dto';
import { TopicController } from './topic.controller';

describe('CommentController', () => {
  let topicController: TopicController;

  let commentService: CommentService;
  let userService: UserService;
  let topicService: TopicService;

  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let commentModel: Model<Comment>;
  let userModel: Model<User>;
  let topicModel: Model<Topic>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    topicModel = mongoConnection.model(Topic.name, TopicSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TopicController],
      providers: [
        UserService,
        CommentService,
        TopicService,
        {
          provide: AccessTokenGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        {
          provide: RoleGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },

        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(Topic.name), useValue: topicModel },
      ],
    }).compile();
    topicController = app.get<TopicController>(TopicController);
    commentService = app.get<CommentService>(CommentService);
    userService = app.get<UserService>(UserService);
    topicService = app.get<TopicService>(TopicService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createTopic', () => {
    it('should return the saved topic', async () => {
      const createdUser = await userService.create(UserDtoStub());
      const createdTopic = await topicService.createTopic(
        TopicDtoStub(),
        createdUser,
      );
      expect(createdTopic.title).toBe(TopicDtoStub().title);
    });

    it('should throw error if title is null', async () => {
      const createdUser = await userService.create(UserDtoStub());
      const topic = TopicDtoStub();
      topic.title = null;
      await expect(
        topicService.createTopic(topic, createdUser),
      ).rejects.toThrow(
        Error("TypeError: Cannot read properties of null (reading 'replace')"),
      );
    });

    it('should throw error if title is null', async () => {
      const createdUser = await userService.create(UserDtoStub());
      const topic = TopicDtoStub();
      topic.title = '   ';
      await expect(
        topicService.createTopic(topic, createdUser),
      ).rejects.toThrow('Content can not be all white spaces');
    });
  });
});
