import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import RoleGuard from '../common/guards/role.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { UserDtoStub, WrongEmailUserDtoStub } from '../../test/stubs/user.dto';
import { WrongItuEmail } from '../common/exceptions/itu-email.exception';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: AccessTokenGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        {
          provide: RoleGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },

        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();
    userController = app.get<UserController>(UserController);
    userService = app.get<UserService>(UserService);
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

  describe('createUser', () => {
    it('should return the saved user', async () => {
      const createdUser = await userService.create(UserDtoStub());
      expect(createdUser.username).toBe(UserDtoStub().username);
    });

    it('should throw error if email is not itu email - Email is not ITU email', async () => {
      await expect(userService.create(WrongEmailUserDtoStub())).rejects.toThrow(
        WrongItuEmail,
      );
    });

    it('should throw error if email is null', async () => {
      const user = UserDtoStub();
      user.email = null;
      await expect(userService.create(user)).rejects.toThrow(
        'Invalid user information',
      );
    });
    it('should throw error if username is null', async () => {
      const user = UserDtoStub();
      user.username = null;
      await expect(userService.create(user)).rejects.toThrow(
        'Invalid user information',
      );
    });
    it('should throw error if password is shorter than 6chars', async () => {
      const user = UserDtoStub();
      user.password = '12345';
      await expect(userService.create(user)).rejects.toThrow(
        'Invalid user information',
      );
    });
    it('should throw error if password is null', async () => {
      const user = UserDtoStub();
      user.password = null;
      await expect(userService.create(user)).rejects.toThrow(
        'Invalid user information',
      );
    });
  });
});

// describe('UserService', () => {
//   let userController: UserController;
//   let userService: UserService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         {
//           provide: UserService,
//           useValue: {
//             create: jest
//               .fn()
//               .mockImplementation((user: CreateUserDto) =>
//                 Promise.resolve({ id: '1', ...user }),
//               ),
//             findAll: jest.fn().mockResolvedValue([
//               {
//                 email: 'email',
//                 username: 'username',
//                 password: 'password',
//                 role: 'junior',
//               },
//               {
//                 email: 'email2',
//                 username: 'username2',
//                 password: 'password2',
//                 role: 'junior',
//               },
//             ]),
//           },
//         },
//         {
//           provide: AccessTokenGuard,
//           useValue: jest.fn().mockImplementation(() => true),
//         },
//         {
//           provide: RoleGuard,
//           useValue: jest.fn().mockImplementation(() => true),
//         },
//       ],
//       controllers: [UserController],
//     }).compile();

//     userController = module.get<UserController>(UserController);
//     userService = module.get<UserService>(UserService);
//   });

//   it('User service - should be defined', () => {
//     expect(userController).toBeDefined();
//     //expect(appController.getHello()).toBe('Hello World!');
//   });

//   describe('findAll()', () => {
//     it('should find all users ', () => {
//       userController.getAll();
//       expect(userService.findAll).toHaveBeenCalled();
//     });
//   });
// });
