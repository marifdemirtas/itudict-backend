import { CreateUserDto } from 'src/user/dto/create-user.dto';

export const UserDtoStub = (): CreateUserDto => {
  return {
    username: 'erce',
    email: 'erce@itu.edu.tr',
    password: '1234567',
    passwordConfirm: '1234567',
  };
};

export const WrongEmailUserDtoStub = (): CreateUserDto => {
  return {
    username: 'erce can',
    email: 'erce@boun.edu.tr',
    password: '1234567',
    passwordConfirm: '1234567',
  };
};
