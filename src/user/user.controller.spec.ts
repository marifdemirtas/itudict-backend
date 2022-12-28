import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import RoleGuard from '../common/guards/role.guard';
import { CreateUserDto } from './dto/create-user.dto';
const createUserDto: CreateUserDto = {
  email: 'email',
  username: 'username',
  password: 'password',
  passwordConfirm: 'password',
};

describe('UserService', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation((user: CreateUserDto) =>
                Promise.resolve({ id: '1', ...user }),
              ),
            findAll: jest.fn().mockResolvedValue([
              {
                email: 'email',
                username: 'username',
                password: 'password',
                role: 'junior',
              },
              {
                email: 'email2',
                username: 'username2',
                password: 'password2',
                role: 'junior',
              },
            ]),
          },
        },
        {
          provide: AccessTokenGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        {
          provide: RoleGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
      controllers: [UserController],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('User service - should be defined', () => {
    expect(userController).toBeDefined();
    //expect(appController.getHello()).toBe('Hello World!');
  });

  describe('findAll()', () => {
    it('should find all users ', () => {
      userController.getAll();
      expect(userService.findAll).toHaveBeenCalled();
    });
  });
});
