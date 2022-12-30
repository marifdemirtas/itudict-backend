import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import RoleGuard from '../common/guards/role.guard';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Topic, TopicSchema } from '../topic/schemas/topic.schema';
import { TopicService } from '../topic/topic.service';
import { TopicDtoStub } from '../../test/stubs/topic.dto';
import { UserDtoStub } from '../../test/stubs/user.dto';
import { CommentDtoStub } from '../../test/stubs/comment.dto';

describe('CommentController', () => {
  let commentController: CommentController;

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
      controllers: [CommentController],
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
    commentController = app.get<CommentController>(CommentController);
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

  describe('createComment', () => {
    it('should return the saved comment', async () => {
      const createdUser = await userService.create(UserDtoStub());
      const createdTopic = await topicService.createTopic(
        TopicDtoStub(),
        createdUser,
      );
      const newComment = CommentDtoStub();
      newComment.topicId = createdTopic['_id'].toString();
      const createdComment = await commentService.createComment(
        newComment,
        createdUser,
      );
      expect(createdComment.content).toBe(CommentDtoStub().content);
    });

    it('should throw error if content is null', async () => {
      const createdUser = await userService.create(UserDtoStub());
      const createdTopic = await topicService.createTopic(
        TopicDtoStub(),
        createdUser,
      );
      const newComment = CommentDtoStub();
      newComment.topicId = createdTopic['_id'].toString();
      newComment.content = null;
      await expect(
        commentService.createComment(newComment, createdUser),
      ).rejects.toThrow(
        "TypeError: Cannot read properties of null (reading 'replace')",
      );
    });

    it('should throw error if content is only whitespaces', async () => {
      const createdUser = await userService.create(UserDtoStub());
      const createdTopic = await topicService.createTopic(
        TopicDtoStub(),
        createdUser,
      );
      const newComment = CommentDtoStub();
      newComment.topicId = createdTopic['_id'].toString();
      newComment.content = '     ';
      await expect(
        commentService.createComment(newComment, createdUser),
      ).rejects.toThrow('Content can not be all white spaces');
    });
  });
});
